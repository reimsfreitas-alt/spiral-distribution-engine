"use strict";

/**
 * Spiral Distribution Engine — execution/data plane publisher.
 * Policy and authorization belong upstream. This module executes a supplied
 * campaign and records execution evidence; it does not declare verification.
 */
const path = require("path");
const fs = require("fs");
const { SpiralLedgerClient } = require("./ledgerClient");
const { buildExecutionContract, assertProviderContract } = require("./executionContract");

const LEDGER_URL = process.env.LEDGER_URL || "http://localhost:4700";
const LEDGER_TOKEN = process.env.LEDGER_TOKEN || null;
const ledger = new SpiralLedgerClient(LEDGER_URL, LEDGER_TOKEN);

function slug(text) {
    return String(text || "campaign").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function publishCampaign(campaign) {
    if (!campaign) throw new Error("Campaign inválida.");
    if (!Array.isArray(campaign.targets) || campaign.targets.length === 0) throw new Error("Nenhum target informado.");

    const assetsDir = process.env.ASSETS_DIR || path.join(__dirname, "..", "..", "assets", "marketing");
    const attachments = (campaign.assets || []).map(file => {
        const full = path.join(assetsDir, file);
        if (!fs.existsSync(full)) {
            console.warn(`[publisher] Asset inexistente: ${file}`);
            return null;
        }
        return full;
    }).filter(Boolean);

    const base = slug(campaign.name);
    const results = [];
    const tenant_id = String(campaign.tenant_id || "default");

    for (const target of campaign.targets) {
        const provider = require(`../providers/${target}`);
        assertProviderContract(provider, target);

        const contract = buildExecutionContract({
            tenant_id,
            campaign,
            target,
            payload_ref: campaign.payload_ref || `${base}:${target}`,
            authorization: campaign.authorization || null
        });

        const meta = {
            ...contract,
            decision_id: `${base}-${target}`,
            target,
            why: campaign.name || null
        };

        await ledger.record({ ...meta, state: "DISPATCHED" });

        try {
            const providerResult = await provider.send({
                target,
                campaign,
                execution: contract,
                payload: { text: campaign.content, attachments }
            });

            await ledger.record({
                ...meta,
                state: "EXECUTED",
                provider_result_ref: providerResult && providerResult.id ? String(providerResult.id) : null
            });

            results.push({ target, ok: true, execution_id: contract.execution_id, idempotency_key: contract.idempotency_key });
        } catch (err) {
            // A transport/adapter error does not prove that the external effect did not happen.
            // Preserve that uncertainty for reconciliation instead of mislabeling it FAILED.
            const state = err && err.confirmed_not_sent === true ? "FAILED" : "UNKNOWN";
            try {
                await ledger.record({
                    ...meta,
                    state,
                    why: String(err && (err.message || err) || "unknown execution error")
                });
            } catch (ledgerError) {
                console.error("[Ledger]", ledgerError.message);
            }

            results.push({
                target,
                ok: false,
                state,
                execution_id: contract.execution_id,
                idempotency_key: contract.idempotency_key,
                error: String(err && (err.message || err) || "unknown execution error")
            });
        }
    }

    return results;
}

module.exports = { publishCampaign };

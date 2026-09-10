"use strict";

const crypto = require("crypto");

/**
 * Canonical execution identity for the Distribution Engine.
 * The engine executes an already-authorized execution; it does not create policy
 * authority or declare external effect verification.
 */
function stableJson(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableJson(value[k])}`).join(",")}}`;
}

function sha256(value) {
    return crypto.createHash("sha256").update(stableJson(value)).digest("hex");
}

function buildExecutionContract({ tenant_id = "default", campaign, target, payload_ref = null, authorization = null }) {
    if (!campaign || !campaign.name) throw new Error("Campaign inválida: name obrigatório.");
    if (!target) throw new Error("Execution inválida: target obrigatório.");

    const source_ref = String(campaign.source_ref || campaign.id || campaign.name);
    const correlation_id = String(campaign.correlation_id || source_ref);
    const execution_id = sha256({ tenant_id, source_ref, target, correlation_id });
    const idempotency_key = sha256({ tenant_id, source_ref, target, payload_ref: payload_ref || campaign.content || "" });

    return {
        execution_id,
        tenant_id,
        actor: "distribution-engine",
        action: "publish",
        scope: { target },
        authorization,
        idempotency_key,
        deadline: campaign.deadline || null,
        target,
        payload_ref,
        correlation_id,
        source_ref
    };
}

function assertProviderContract(provider, target) {
    if (!provider || typeof provider.send !== "function") {
        throw new Error(`Provider inválido: ${target} precisa expor send().`);
    }
}

module.exports = { stableJson, sha256, buildExecutionContract, assertProviderContract };

"use strict";

/**
 * Spiral Distribution Engine
 * Publisher
 * Publica campanhas e registra TODA a corrente no Spiral Ledger.
 */

const path = require("path");
const fs = require("fs");
const { SpiralLedgerClient } = require("./ledgerClient");

const LEDGER_URL =
    process.env.LEDGER_URL ||
    "http://localhost:4700";

const LEDGER_TOKEN =
    process.env.LEDGER_TOKEN ||
    null;

const ledger = new SpiralLedgerClient(
    LEDGER_URL,
    LEDGER_TOKEN
);

function slug(text) {
    return String(text || "campaign")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

async function publishCampaign(campaign) {

    if (!campaign)
        throw new Error("Campaign inválida.");

    if (!campaign.targets || campaign.targets.length === 0)
        throw new Error("Nenhum target informado.");

    const assetsDir =
        process.env.ASSETS_DIR ||
        path.join(
            __dirname,
            "..",
            "..",
            "assets",
            "marketing"
        );

    const attachments =
        (campaign.assets || [])
            .map(file => {

                const full =
                    path.join(assetsDir, file);

                if (!fs.existsSync(full)) {
                    console.warn(
                        `[publisher] Asset inexistente: ${file}`
                    );
                    return null;
                }

                return full;

            })
            .filter(Boolean);

    const base = slug(campaign.name);

    const results = [];

    for (const target of campaign.targets) {

        const decision_id =
            `${base}-${target}`;

        const idempotency_key =
            `${decision_id}-${Date.now()}`;

        const meta = {

            decision_id,
            idempotency_key,

            target,

            actor: "distribution-engine",

            why: campaign.name || null

        };

        //-------------------------------------------------
        // DISPATCHED
        //-------------------------------------------------

        await ledger.record({

            ...meta,

            state: "DISPATCHED"

        });

        try {

            const provider =
                require(`../providers/${target}`);

            await provider.send({

                target,

                campaign,

                payload: {

                    text: campaign.content,

                    attachments

                }

            });

            //---------------------------------------------
            // EXECUTED
            //---------------------------------------------

            await ledger.record({

                ...meta,

                state: "EXECUTED"

            });

            console.log(
                `[Ledger] ${decision_id} EXECUTED`
            );

            results.push({

                target,

                ok: true

            });

        }
        catch (err) {

            //---------------------------------------------
            // FAILED
            //---------------------------------------------

            try {

                await ledger.record({

                    ...meta,

                    state: "FAILED",

                    why: String(err.message || err)

                });

            }
            catch (ledgerError) {

                console.error(
                    "[Ledger]",
                    ledgerError.message
                );

            }

            results.push({

                target,

                ok: false,

                error: String(err.message || err)

            });

        }

    }

    return results;

}

module.exports = {

    publishCampaign

};
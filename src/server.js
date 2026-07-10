"use strict";

const express = require("express");
const registry = require("./core/providerRegistry");
const { publishCampaign } = require("./core/publisher");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ============================================================
 * HOME
 * ============================================================ */

app.get("/", (req, res) => {

    res.json({
        name: "Spiral Distribution Engine",
        version: "1.0.0",
        status: "online"
    });

});

/* ============================================================
 * HEALTH
 * ============================================================ */

app.get("/health", (req, res) => {

    let version = "1.0.0";

    try {
        version = require("../package.json").version;
    } catch {}

    res.json({

        service: "distribution-engine",

        status: "online",

        version,

        build: process.env.SPIRAL_BUILD || "local",

        port: PORT,

        uptimeSeconds: Math.round(process.uptime()),

        dependencies: [
            process.env.LEDGER_URL || "http://localhost:4700"
        ],

        heartbeat: new Date().toISOString()

    });

});

/* ============================================================
 * PROVIDERS
 * ============================================================ */

app.get("/providers", (req, res) => {

    res.json({

        total: registry.list().length,

        providers: registry.list()

    });

});

/* ============================================================
 * PUBLICAR CAMPANHA
 * ============================================================ */

app.post("/publish", async (req, res) => {

    try {

        const campaign = req.body;

        if (!campaign)
            return res.status(400).json({
                error: "Body vazio."
            });

        if (!campaign.targets || campaign.targets.length === 0)
            return res.status(400).json({
                error: "targets obrigatório."
            });

        const result = await publishCampaign(campaign);

        res.json({

            ok: true,

            published: result.length,

            result

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            ok: false,

            error: err.message

        });

    }

});

/* ============================================================
 * START
 * ============================================================ */

app.listen(PORT, () => {

    console.log("");

    console.log("================================");
    console.log(`SPIRAL SERVER ONLINE : ${PORT}`);
    console.log("================================");

    console.log("LEDGER_URL :", process.env.LEDGER_URL || "http://localhost:4700");

    console.log("POST /publish disponível");

});
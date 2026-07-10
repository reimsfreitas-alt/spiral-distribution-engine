"use strict";

const express = require("express");
const registry = require("./core/providerRegistry");
const { publishCampaign } = require("./core/publisher");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {

    res.json({
        name: "Spiral Distribution Engine",
        version: "1.0.0",
        status: "online"
    });

});

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

app.get("/providers", (req, res) => {

    res.json({
        total: registry.list().length,
        providers: registry.list()
    });

});

/* ============================================================
   PUBLICAR CAMPANHA
   ============================================================ */

app.post("/publish", async (req, res) => {

    try {

        const result = await publishCampaign(req.body);

        res.json({
            ok: true,
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

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log(`SPIRAL SERVER ONLINE : ${PORT}`);
    console.log("================================");
    console.log("LEDGER:", process.env.LEDGER_URL || "http://localhost:4700");
    console.log("POST /publish disponível");

});
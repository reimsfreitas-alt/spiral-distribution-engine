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

    console.log("================================");
    console.log("POST /publish recebido");
    console.log("Body:");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("================================");

    try {

        const result = await publishCampaign(req.body);

        console.log("Publish OK:");
        console.log(JSON.stringify(result, null, 2));

        return res.status(200).json({
            ok: true,
            result
        });

    } catch (err) {

        console.error("================================");
        console.error("ERRO NO PUBLISH");
        console.error("Mensagem:", err.message);
        console.error(err.stack);
        console.error("================================");

        return res.status(500).json({
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
    console.log("LEDGER:", process.env.LEDGER_URL || "http://localhost:4700");
    console.log("POST /publish disponível");
    console.log("");

});
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
        version: require("../package.json").version,
        status: "online",
        runtime: "distribution-engine",
        mode: process.env.DISTRIBUTION_MODE || "execution",
        providers: registry.list()
    });
});

app.get("/health", (req, res) => {
    let version = "1.0.0";
    try { version = require("../package.json").version; } catch {}

    res.json({
        service: "distribution-engine",
        status: "online",
        version,
        build: process.env.SPIRAL_BUILD || "local",
        uptimeSeconds: Math.round(process.uptime()),
        ledger: process.env.LEDGER_URL || "http://localhost:4700",
        providers: registry.list(),
        heartbeat: new Date().toISOString()
    });
});

app.get("/providers", (req, res) => {
    res.json({
        total: registry.list().length,
        providers: registry.list()
    });
});

app.post("/publish", async (req, res) => {
    try {
        const result = await publishCampaign(req.body);
        return res.status(200).json({ ok: true, result });
    } catch (err) {
        console.error("ERRO NO PUBLISH", err);
        return res.status(500).json({
            ok: false,
            error: String(err.message || err)
        });
    }
});

// Vercel imports the Express app. Local Node execution still starts a server.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SPIRAL DISTRIBUTION ENGINE ONLINE : ${PORT}`);
        console.log("LEDGER:", process.env.LEDGER_URL || "http://localhost:4700");
        console.log("PROVIDERS:", registry.list().join(", "));
    });
}

module.exports = app;

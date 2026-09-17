"use strict";

const path = require("path");
const express = require("express");
const registry = require("./core/providerRegistry");
const { publishCampaign } = require("./core/publisher");
const jobStore = require("./core/jobStore");

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
        providers: registry.list().map((p) => p.name)
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
        providers: registry.list().map((p) => p.name),
        heartbeat: new Date().toISOString()
    });
});

// Full, honest status per provider: real vs simulated, and whether required
// credentials are currently present — this is what makes the UI able to say
// "this target will actually publish" vs "this target is a simulation"
// *before* anyone clicks distribute, not after it silently no-ops.
app.get("/providers", (req, res) => {
    const providers = registry.list();
    res.json({ total: providers.length, providers });
});

app.get("/jobs", (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    res.json({ jobs: jobStore.list({ limit }) });
});

app.get("/jobs/:id", (req, res) => {
    const job = jobStore.get(req.params.id);
    if (!job) return res.status(404).json({ ok: false, error: "job não encontrado" });
    res.json({ ok: true, job });
});

app.post("/publish", async (req, res) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ ok: false, error: "corpo da requisição inválido: esperado um objeto JSON." });
    }
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

// The human-facing experience: intent -> authorization -> distribution -> execution ->
// observation -> confirmation -> evidence, rendered as a single static page. It only talks
// to the JSON API above (same-origin fetch) — no separate backend, no invented capability.
app.use("/ui", express.static(path.join(__dirname, "..", "public")));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SPIRAL DISTRIBUTION ENGINE ONLINE : ${PORT}`);
        console.log("LEDGER:", process.env.LEDGER_URL || "http://localhost:4700");
        console.log("PROVIDERS:", registry.list().map((p) => p.name).join(", "));
        console.log(`UI: http://localhost:${PORT}/ui/`);
    });
}

module.exports = app;

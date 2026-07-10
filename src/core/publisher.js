"use strict";
/**
 * Publisher — dispara a campanha nos providers e REGISTRA cada disparo no
 * spiral-ledger (fonte única da verdade). Sem ledger em memória.
 */
const path = require("path");
const fs = require("fs");
const { SpiralLedgerClient } = require("../../../spiral-ledger/sdk/client");

// Fonte única da verdade: spiral-ledger via HTTP. Nada de gravação paralela.
const LEDGER_URL = process.env.LEDGER_URL || "http://localhost:4700";
const LEDGER_TOKEN = process.env.LEDGER_TOKEN || null;
const ledger = new SpiralLedgerClient(LEDGER_URL, LEDGER_TOKEN);

function slug(s) {
  return String(s || "campanha").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function publishCampaign(campaign) {
  if (!campaign.targets || campaign.targets.length === 0) {
    throw new Error("Nenhum target (canal) definido na campanha.");
  }

  const ASSETS_DIR = process.env.ASSETS_DIR || path.join(__dirname, "..", "..", "assets", "marketing");
  const attachments = (campaign.assets || []).map((filename) => {
    const fullPath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(fullPath)) { console.warn(`⚠️ Asset não encontrado: ${filename}`); return null; }
    return fullPath;
  }).filter((p) => p !== null);

  const base = slug(campaign.name);
  const results = [];

  for (const target of campaign.targets) {
    const decision_id = `${base}-${target}`;
    const idempotency_key = `${decision_id}-${Date.now()}`;
    // O Vision pareia DISPATCHED -> EXECUTED/FAILED por idempotency_key (latência de execução).
    const meta = { decision_id, idempotency_key, target, actor: "distribution-engine", why: campaign.name || null };

    // Abertura da decisão ANTES do disparo (par que o Vision precisa para medir).
    await ledger.record({ ...meta, state: "DISPATCHED" });

    try {
      const provider = require(`../providers/${target}`);
      await provider.send({ target, campaign, payload: { text: campaign.content, attachments } });

      // >>> Ponto imediatamente APÓS provider.send bem-sucedido: registro no spiral-ledger.
      await ledger.record({ ...meta, state: "EXECUTED" });
      console.log(`🧾 [Ledger] ${decision_id} EXECUTED`);
      results.push({ target, ok: true });
    } catch (err) {
      console.error(`❌ Erro no provedor ${target}:`, err.message);
      // Fecha a decisão como FALHA — nunca silenciosa; o Vision conta failures.
      try { await ledger.record({ ...meta, state: "FAILED", why: String(err.message || err) }); }
      catch (e2) { console.error("❌ Ledger indisponível:", e2.message); }
      results.push({ target, ok: false, error: String(err.message || err) });
    }
  }

  return results;
}

module.exports = { publishCampaign };

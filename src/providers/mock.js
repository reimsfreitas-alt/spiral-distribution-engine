"use strict";
/**
 * Provider MOCK — simula uma publicação no LinkedIn sem tocar a rede.
 * Usado no start-all e no teste E2E para exercitar publisher -> ledger -> vision
 * sem exigir credenciais reais. Mesmo contrato dos providers reais: send().
 */
async function send({ target, campaign, payload }) {
  console.log(`🔗 [LinkedIn · mock] publicando "${campaign && campaign.name || "?"}" em ${target}`);
  await new Promise((r) => setTimeout(r, 150)); // latência simulada (aparece no Vision)
  return { status: "success", mock: true, target };
}
module.exports = { send };

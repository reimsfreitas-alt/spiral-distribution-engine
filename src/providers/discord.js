"use strict";
/**
 * Provider: Discord (real)
 *
 * Publishes through a configured Discord webhook. Missing credentials fail honestly.
 */
const axios = require("axios");

async function send({ payload }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("DISCORD_WEBHOOK_URL não configurado.");
  if (!payload || !payload.text) throw new Error("Campanha sem conteúdo.");

  const response = await axios.post(`${webhookUrl}?wait=true`, {
    content: payload.text
  });

  const id = response.data && response.data.id ? String(response.data.id) : null;
  return { status: "success", network: "discord", id };
}

module.exports = { send };

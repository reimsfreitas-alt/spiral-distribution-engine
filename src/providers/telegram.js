"use strict";
/**
 * Provider: Telegram (real)
 *
 * Publishes through the Telegram Bot API. Missing credentials fail honestly.
 */
const axios = require("axios");

async function send({ payload }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN não configurado.");
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID não configurado.");
  if (!payload || !payload.text) throw new Error("Campanha sem conteúdo.");

  const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: payload.text
  });

  const result = response.data && response.data.result;
  const id = result && result.message_id != null ? String(result.message_id) : null;
  return { status: "success", network: "telegram", id };
}

module.exports = { send };

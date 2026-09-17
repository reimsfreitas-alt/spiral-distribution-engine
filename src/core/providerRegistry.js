"use strict";

/**
 * Single source of truth for what a "provider" (a distribution target) actually is.
 *
 * Before this file, GET /providers reported channels/* (only linkedin + gmail), while
 * POST /publish actually dispatched through providers/* (discord, email, facebook, linkedin,
 * telegram, twitter, mock, test) via a raw dynamic require that never consulted the registry
 * at all. The two were disconnected: what the product told the user was distributable had no
 * relationship to what would actually run. This file fixes that by being the one place that
 * both server.js (reporting) and publisher.js (execution) read from.
 *
 * It also carries the one rule the product cannot compromise on: a simulated provider must
 * never be indistinguishable from a real one. `real: false` providers do not touch the
 * network — they exist for local testing — and every consumer of this registry must be able
 * to tell them apart before anything is dispatched, not just after something fails.
 */

const CATALOG = {
  linkedin: {
    real: true,
    requiredEnv: ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_AUTHOR_URN"],
    note: "Publica de fato via api.linkedin.com (UGC posts), incluindo upload de imagem."
  },
  facebook: {
    real: true,
    requiredEnv: ["FACEBOOK_PAGE_ID", "FACEBOOK_ACCESS_TOKEN"],
    note: "Publica de fato via graph.facebook.com. Exige ao menos uma imagem em assets/marketing/."
  },
  discord: {
    real: true,
    requiredEnv: ["DISCORD_WEBHOOK_URL"],
    note: "Publica de fato via webhook do Discord."
  },
  telegram: {
    real: true,
    requiredEnv: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
    note: "Publica de fato via Telegram Bot API (sendMessage)."
  },
  email: {
    real: false,
    requiredEnv: [],
    note: "Simulado. Existe um fluxo real de Gmail (OAuth) em legacy/channels/gmail.js, não conectado a este pipeline."
  },
  twitter: {
    real: false,
    requiredEnv: [],
    note: "Simulado. Postar via X API v2 exige OAuth 1.0a/2.0 de usuário (não apenas um bearer token de app) — não implementado nesta sessão."
  },
  mock: {
    real: false,
    requiredEnv: [],
    note: "Provider de teste. Nunca deve aparecer como alvo em uma campanha real."
  },
  test: {
    real: false,
    requiredEnv: [],
    note: "Provider de teste. Nunca deve aparecer como alvo em uma campanha real."
  }
};

function credentialStatus(entry) {
  const missing = (entry.requiredEnv || []).filter((key) => !process.env[key]);
  return { credentialed: missing.length === 0, missing };
}

function statusOf(name) {
  const entry = CATALOG[name];
  if (!entry) return null;
  const { credentialed, missing } = credentialStatus(entry);
  const status = !entry.real ? "simulated" : credentialed ? "real_ready" : "real_missing_credentials";
  return {
    name,
    real: entry.real,
    credentialed,
    missingEnv: missing,
    status,
    note: entry.note
  };
}

function list() {
  return Object.keys(CATALOG).map(statusOf);
}

function get(name) {
  if (!CATALOG[name]) {
    throw new Error(`Provider desconhecido: "${name}". Providers disponíveis: ${Object.keys(CATALOG).join(", ")}`);
  }
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(`../providers/${name}`);
}

module.exports = { list, get, statusOf, CATALOG };

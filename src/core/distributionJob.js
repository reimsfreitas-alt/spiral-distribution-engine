"use strict";

const crypto = require("crypto");

const STATES = Object.freeze(["CREATED", "AUTHORIZED", "QUEUED", "SCHEDULED", "DISPATCHING", "PROVIDER_REQUESTED", "PROVIDER_ACCEPTED", "PUBLISHED", "OBSERVED", "CONFIRMED", "RETRYING", "FAILED", "DEAD_LETTER", "CANCELLED"]);
const TERMINAL_STATES = new Set(["CONFIRMED", "FAILED", "DEAD_LETTER", "CANCELLED"]);
const TRANSITIONS = Object.freeze({
  CREATED: new Set(["AUTHORIZED", "CANCELLED"]),
  AUTHORIZED: new Set(["QUEUED", "SCHEDULED", "CANCELLED"]),
  QUEUED: new Set(["DISPATCHING", "CANCELLED"]),
  SCHEDULED: new Set(["QUEUED", "CANCELLED"]),
  DISPATCHING: new Set(["PROVIDER_REQUESTED", "RETRYING", "FAILED"]),
  PROVIDER_REQUESTED: new Set(["PROVIDER_ACCEPTED", "PUBLISHED", "OBSERVED", "RETRYING", "FAILED"]),
  PROVIDER_ACCEPTED: new Set(["PUBLISHED", "OBSERVED", "RETRYING", "FAILED"]),
  PUBLISHED: new Set(["OBSERVED", "CONFIRMED", "RETRYING", "FAILED"]),
  OBSERVED: new Set(["CONFIRMED", "RETRYING", "FAILED"]),
  RETRYING: new Set(["QUEUED", "DEAD_LETTER", "FAILED", "CANCELLED"]),
  CONFIRMED: new Set(), FAILED: new Set(), DEAD_LETTER: new Set(), CANCELLED: new Set()
});

function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(stableJson(value)).digest("hex");
}

function buildIdempotencyKey({ tenant_id, campaign_id, channel, identity_id, payload }) {
  if (!tenant_id || !campaign_id || !channel || !identity_id) throw new Error("tenant_id, campaign_id, channel e identity_id são obrigatórios.");
  return sha256({ tenant_id, campaign_id, channel, identity_id, payload: payload || null });
}

function createDistributionJob(input = {}) {
  const { job_id = crypto.randomUUID(), tenant_id, campaign_id, idempotency_key, channel, destination, identity_id, payload = null, state = "CREATED", correlation_id = job_id } = input;
  if (!tenant_id || !campaign_id || !channel || !destination || !identity_id) throw new Error("DistributionJob inválido: tenant, campaign, channel, destination e identity são obrigatórios.");
  if (!STATES.includes(state)) throw new Error(`Estado inválido: ${state}`);
  return { job_id, tenant_id, campaign_id, idempotency_key: idempotency_key || buildIdempotencyKey({ tenant_id, campaign_id, channel, identity_id, payload }), channel, destination, identity_id, payload, state, correlation_id, created_at: new Date().toISOString() };
}

function canTransition(from, to) { return Boolean(TRANSITIONS[from] && TRANSITIONS[from].has(to)); }

function transitionJob(job, to, metadata = {}) {
  if (!job || !STATES.includes(job.state)) throw new Error("Job inválido.");
  if (!canTransition(job.state, to)) throw new Error(`Transição inválida: ${job.state} -> ${to}`);
  return { ...job, state: to, updated_at: new Date().toISOString(), transition: { from: job.state, to, ...metadata } };
}

function isTerminal(state) { return TERMINAL_STATES.has(state); }

module.exports = { STATES, TERMINAL_STATES, TRANSITIONS, stableJson, sha256, buildIdempotencyKey, createDistributionJob, canTransition, transitionJob, isTerminal };

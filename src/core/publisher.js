"use strict";

/**
 * Spiral Distribution Engine — execution/data plane publisher.
 *
 * This is the one place that turns an intent into a governed DistributionJob per target and
 * walks it through real states: CREATED -> AUTHORIZED -> QUEUED -> DISPATCHING ->
 * PROVIDER_REQUESTED -> (PUBLISHED | SIMULATED | UNKNOWN | FAILED).
 *
 * Two rules this module refuses to break, because the product depends on them:
 *
 * 1. Nothing executes on intent alone. Without an explicit `authorization` object every job
 *    stops at CREATED and no provider is ever called — not "authorized automatically because
 *    someone hit an endpoint".
 * 2. PUBLISHED means "the provider's own API claimed success" — it is never promoted to
 *    OBSERVED/CONFIRMED here, because this engine has no independent way to re-read LinkedIn,
 *    Facebook, Discord or Telegram and verify the post actually exists. Claiming otherwise
 *    would be exactly the "simulação apresentada como realidade" the product forbids.
 */
const path = require("path");
const fs = require("fs");
const { SpiralLedgerClient } = require("./ledgerClient");
const { buildExecutionContract, assertProviderContract } = require("./executionContract");
const { createDistributionJob, transitionJob } = require("./distributionJob");
const registry = require("./providerRegistry");
const jobStore = require("./jobStore");

const LEDGER_URL = process.env.LEDGER_URL || "http://localhost:4700";
const LEDGER_TOKEN = process.env.LEDGER_TOKEN || null;
const ledger = new SpiralLedgerClient(LEDGER_URL, LEDGER_TOKEN);

function slug(text) {
  return String(text || "campaign").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function recordLedger(event) {
  try {
    await ledger.record(event);
    return true;
  } catch (err) {
    console.error("[Ledger] indisponível:", err.message);
    return false;
  }
}

function isValidAuthorization(authorization) {
  return Boolean(authorization && typeof authorization.by === "string" && authorization.by.trim().length > 0);
}

function isTransportUncertainty(err) {
  const code = err && err.code;
  if (["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "ENOTFOUND"].includes(code)) return true;
  return Boolean(err && /timeout/i.test(String(err.message || "")));
}

function resolveAttachments(intent) {
  const assetsDir = process.env.ASSETS_DIR || path.join(__dirname, "..", "..", "assets", "marketing");
  const requested = intent.assets || [];
  const found = [];
  const missing = [];
  for (const file of requested) {
    const full = path.join(assetsDir, file);
    if (fs.existsSync(full)) found.push(full);
    else missing.push(file);
  }
  if (missing.length) console.warn(`[publisher] Assets inexistentes em ${assetsDir}: ${missing.join(", ")}`);
  return { found, missing };
}

async function runTarget({ target, intent, authorization, contractBase, attachments }) {
  const providerStatus = registry.statusOf(target);
  const tenant_id = contractBase.tenant_id;
  const authorized = isValidAuthorization(authorization);

  const contract = buildExecutionContract({
    tenant_id,
    campaign: intent,
    target,
    payload_ref: intent.payload_ref || `${contractBase.base}:${target}`,
    authorization: authorization || null
  });

  if (authorized) {
    const prior = jobStore.findByIdempotencyKey(contract.idempotency_key);
    if (prior && ["PUBLISHED", "SIMULATED", "UNKNOWN"].includes(prior.state)) {
      return {
        target, provider: providerStatus, job_id: prior.job_id, state: prior.state, authorization: "granted",
        claim_only: prior.state === "PUBLISHED",
        replayed: true,
        evidence: { execution_id: contract.execution_id, idempotency_key: contract.idempotency_key, ledger: "recorded_previously" }
      };
    }
  }

  let job = createDistributionJob({
    tenant_id,
    campaign_id: contractBase.base,
    channel: target,
    destination: target,
    identity_id: authorized ? authorization.by.trim() : "unauthenticated",
    idempotency_key: contract.idempotency_key,
    payload: { text: intent.content, assets: intent.assets || [] }
  });
  jobStore.put(job);

  let ledgerOk = await recordLedger({ ...contract, decision_id: `${contractBase.base}-${target}`, target, why: intent.name || null, state: "CREATED" });

  if (!authorized) {
    jobStore.put(job);
    return {
      target,
      provider: providerStatus,
      job_id: job.job_id,
      state: job.state,
      authorization: "required",
      claim_only: false,
      evidence: { execution_id: contract.execution_id, idempotency_key: contract.idempotency_key, ledger: ledgerOk ? "recorded" : "unavailable" }
    };
  }

  job = transitionJob(job, "AUTHORIZED", { by: authorization.by || null, note: authorization.note || null });
  jobStore.put(job);
  ledgerOk = (await recordLedger({ ...contract, decision_id: `${contractBase.base}-${target}`, target, why: intent.name || null, state: "AUTHORIZED" })) && ledgerOk;

  job = transitionJob(job, "QUEUED");
  job = transitionJob(job, "DISPATCHING");
  jobStore.put(job);

  if (!providerStatus) {
    job = transitionJob(job, "UNKNOWN", { reason: "unknown_provider_registry_state" });
    job = transitionJob(job, "FAILED", { reason: `Provider desconhecido: ${target}` });
    jobStore.put(job);
    ledgerOk = (await recordLedger({ ...contract, decision_id: `${contractBase.base}-${target}`, target, why: `Provider desconhecido: ${target}`, state: "FAILED" })) && ledgerOk;
    return {
      target, provider: null, job_id: job.job_id, state: job.state, authorization: "granted", claim_only: false,
      error: `Provider desconhecido: ${target}`,
      evidence: { execution_id: contract.execution_id, idempotency_key: contract.idempotency_key, ledger: ledgerOk ? "recorded" : "unavailable" }
    };
  }

  job = transitionJob(job, "PROVIDER_REQUESTED");
  jobStore.put(job);

  if (providerStatus.status === "real_missing_credentials") {
    job = transitionJob(job, "FAILED", { reason: `Credenciais ausentes: ${providerStatus.missingEnv.join(", ")}` });
    jobStore.put(job);
    ledgerOk = (await recordLedger({ ...contract, decision_id: `${contractBase.base}-${target}`, target, why: `missing_credentials:${providerStatus.missingEnv.join(",")}`, state: "FAILED" })) && ledgerOk;
    return {
      target, provider: providerStatus, job_id: job.job_id, state: job.state, authorization: "granted", claim_only: false,
      error: `Credenciais ausentes: ${providerStatus.missingEnv.join(", ")}`,
      evidence: { execution_id: contract.execution_id, idempotency_key: contract.idempotency_key, ledger: ledgerOk ? "recorded" : "unavailable" }
    };
  }

  const provider = registry.get(target);
  assertProviderContract(provider, target);

  try {
    const providerResult = await provider.send({
      target,
      campaign: intent,
      execution: contract,
      payload: { text: intent.content, attachments: attachments.found }
    });

    const toState = providerStatus.real ? "PUBLISHED" : "SIMULATED";
    job = transitionJob(job, toState, {
      provider_result_ref: providerResult && providerResult.id ? String(providerResult.id) : null
    });
    jobStore.put(job);
    ledgerOk = (await recordLedger({
      ...contract, decision_id: `${contractBase.base}-${target}`, target, state: toState,
      provider_result_ref: providerResult && providerResult.id ? String(providerResult.id) : null
    })) && ledgerOk;

    return {
      target, provider: providerStatus, job_id: job.job_id, state: job.state, authorization: "granted",
      claim_only: toState === "PUBLISHED",
      provider_result_ref: providerResult && providerResult.id ? String(providerResult.id) : null,
      evidence: { execution_id: contract.execution_id, idempotency_key: contract.idempotency_key, ledger: ledgerOk ? "recorded" : "unavailable" }
    };
  } catch (err) {
    const toState = isTransportUncertainty(err) ? "UNKNOWN" : "FAILED";
    job = transitionJob(job, toState, { reason: String(err && (err.message || err) || "unknown execution error") });
    jobStore.put(job);
    ledgerOk = (await recordLedger({
      ...contract, decision_id: `${contractBase.base}-${target}`, target, state: toState,
      why: String(err && (err.message || err) || "unknown execution error")
    })) && ledgerOk;

    return {
      target, provider: providerStatus, job_id: job.job_id, state: job.state, authorization: "granted", claim_only: false,
      error: String(err && (err.message || err) || "unknown execution error"),
      evidence: { execution_id: contract.execution_id, idempotency_key: contract.idempotency_key, ledger: ledgerOk ? "recorded" : "unavailable" }
    };
  }
}

async function publishCampaign(body) {
  const intent = body && body.intent ? body.intent : body;
  const authorization = (body && body.authorization) || null;

  if (!intent || typeof intent !== "object") throw new Error("Intenção inválida.");
  if (!intent.name || typeof intent.name !== "string") throw new Error("Intenção inválida: name (texto) obrigatório.");
  if (!intent.content || typeof intent.content !== "string" || !intent.content.trim()) throw new Error("Intenção inválida: content (texto) obrigatório.");
  if (!Array.isArray(intent.targets) || intent.targets.length === 0) throw new Error("Nenhum target informado.");
  if (!intent.targets.every((t) => typeof t === "string" && t.trim())) throw new Error("Intenção inválida: targets deve ser uma lista de nomes de canal (texto).");

  const attachments = resolveAttachments(intent);
  const base = slug(intent.name);
  const tenant_id = String(intent.tenant_id || "default");
  const contractBase = { base, tenant_id };
  const authorized = isValidAuthorization(authorization);

  const results = [];
  for (const target of intent.targets) {
    const result = await runTarget({ target, intent, authorization, contractBase, attachments });
    results.push(result);
  }

  return {
    authorization: authorized ? "granted" : "required",
    intent: { name: intent.name, targets: intent.targets },
    assets_missing: attachments.missing,
    results
  };
}

module.exports = { publishCampaign };

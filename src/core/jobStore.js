"use strict";

/**
 * In-memory store for DistributionJobs, so the API and UI can show the pipeline's real
 * state instead of only a fire-and-forget response. This is intentionally not a database:
 * it resets on restart. That is a real, disclosed limitation (see docs), not something to
 * hide — the ledger (src/core/ledgerClient.js), when reachable, is the durable evidence
 * trail; this store is just for the running process to answer "what state is job X in".
 */

const jobs = new Map();
const byIdempotencyKey = new Map();
const MAX_JOBS = 500;

function put(job) {
  jobs.set(job.job_id, job);
  if (job.idempotency_key) byIdempotencyKey.set(job.idempotency_key, job.job_id);
  if (jobs.size > MAX_JOBS) {
    const oldestKey = jobs.keys().next().value;
    const oldest = jobs.get(oldestKey);
    if (oldest && oldest.idempotency_key && byIdempotencyKey.get(oldest.idempotency_key) === oldestKey) {
      byIdempotencyKey.delete(oldest.idempotency_key);
    }
    jobs.delete(oldestKey);
  }
  return job;
}

function get(jobId) {
  return jobs.get(jobId) || null;
}

function findByIdempotencyKey(key) {
  const jobId = byIdempotencyKey.get(key);
  return jobId ? jobs.get(jobId) || null : null;
}

function list({ limit = 50 } = {}) {
  return Array.from(jobs.values())
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, limit);
}

module.exports = { put, get, list, findByIdempotencyKey };

# Meta → Spiral: Execution Plane review — 2026-09-11

## Purpose

This document captures the external architecture review received on 2026-09-11 and converts it into an implementation boundary for the Distribution Engine. It is a handoff artifact for the next engineering pass. It does not authorize a broad rewrite.

## Executive decision

Distribution Engine remains internal infrastructure. Target architecture:

- Spiral Intent = Control Plane
- Distribution Engine = Execution Plane
- Observation = Verification Plane
- Ledger / Receipt = Evidence Plane

H1 implementation is deliberately narrow: make one execution path durable, idempotent, rate-limited, observable and evidence-producing before adding channels or SaaS surface area.

## P0 — implement first

1. **DistributionJob contract and state machine**
   - `tenant_id`, `campaign_id`, `channel`, `destination`, `identity_id`, `idempotency_key`, `correlation_id`, payload reference and lifecycle state.
   - Legal states include `CREATED`, `AUTHORIZED`, `QUEUED`, `DISPATCHING`, `PROVIDER_REQUESTED`, `PROVIDER_ACCEPTED`, `PUBLISHED`, `OBSERVED`, `CONFIRMED`, `RETRYING`, `FAILED`, `DEAD_LETTER`, `CANCELLED`.
   - Never treat provider HTTP 200 as business confirmation.

2. **Database source of truth + transactional outbox**
   - Postgres owns job state.
   - Creation/update of a job and its evidence event must be atomic.
   - Relay/outbox may feed Redis; Redis must never become the source of truth.

3. **Idempotency**
   - Unique key scoped to tenant/channel/identity/job intent.
   - On duplicate request, return the existing job rather than enqueueing another external effect.
   - On provider timeout, observe before retrying; do not blindly republish.

4. **Receipt v1**
   - Persist provider request/acceptance, external identifier, observation result and final verdict.
   - `PUBLISHED` means an external identifier is known.
   - `CONFIRMED` requires independent observation.

5. **Safety boundary**
   - Policy/authorization must happen before `QUEUED`.
   - Distribution Engine executes authorized work; it does not invent authorization.
   - AI may propose content or scheduling; it must not directly call provider publish methods.

## P1 — after P0 is green

- Provider capability contract with `capabilities()`, `validate()`, `prePublish()`, `publish()`, `getStatus()`, `normalizeError()`.
- Generic Dispatcher Worker + provider strategy; do not create one worker class per network.
- Rate limiter keyed by `provider:identity:tenant`.
- Exponential backoff + jitter for 429/5xx/timeouts and provider processing states.
- Circuit breaker and DLQ.
- Signed webhook ingestion and duplicate-event protection.
- Structured logs with `correlation_id`, `job_id`, `tenant_id`, `provider`, `external_id`.

## Meta-specific boundary

For production Meta integrations, validate the current official API requirements before implementation. The review identifies these operational concerns:

- Instagram publishing is asynchronous and may require container creation followed by publish/status observation.
- Facebook/Instagram/WhatsApp credentials and identities must be isolated and health-checked.
- Webhooks must validate signatures and be idempotent.
- Rate limits must be enforced per provider identity rather than globally.
- WhatsApp messaging requires the applicable Meta policy, consent/opt-in and approved templates where required.
- Conversions API is useful for acquisition measurement, but it is not a substitute for the Execution Plane's own receipt/evidence model.

## Explicit non-goals for this pass

- Kafka
- 100-channel expansion
- drag-and-drop campaign editor
- public plugin marketplace
- white-label SaaS
- multi-region
- enterprise SSO/SCIM/VPC
- AI auto-publish
- LinkedIn scraping or prohibited engagement automation

## Commercial alignment

The engine is not the offer. It is the internal execution layer supporting Spiral's commercial products. For immediate cash, prioritize the governed recovery / Leak Audit path. Do not allow the infrastructure roadmap to delay a sellable offer.

## Handoff to next engineer / Claude

Before changing architecture, inspect the existing runtime and tests. Preserve working behavior. Implement only the smallest vertical slice that proves:

`AUTHORIZED -> QUEUED -> DISPATCHING -> PROVIDER_ACCEPTED/PUBLISHED -> OBSERVED -> CONFIRMED|FAILED|DEAD_LETTER -> RECEIPT`

Required proof before calling the slice complete:

- duplicate submission does not create a second job;
- worker crash does not lose the job;
- provider timeout does not blindly duplicate the external effect;
- 429 retries with backoff;
- invalid 4xx is not retried;
- duplicate webhook does not duplicate evidence;
- final receipt can reconstruct the execution chain;
- existing contract/smoke tests remain green.

The goal is not to make the engine look bigger. The goal is to make one execution path trustworthy enough to become the foundation for everything else.

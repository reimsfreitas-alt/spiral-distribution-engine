# P0 COMMISSION — REAL DISTRIBUTION ENGINE + SPIRAL LITE

## READ THIS FIRST

This file is the canonical implementation brief for the Claude engineering agent.

Repositories:
- Distribution Engine: `reimsfreitas-alt/spiral-distribution-engine`
- Spiral Lite: `reimsfreitas-alt/Spiral-Lite`

Also read:
- `reimsfreitas-alt/Spiral-Lite/PRODUCTION-READINESS.md`

## Mission

The current Vercel cockpit/demo is not sufficient for commercial sale. Do not polish or extend a fake execution surface. Build the smallest REAL production-capable path that can honestly sit behind Stripe.

Absorb Spiral Lite as the first vertical application of Distribution Engine. Do NOT maintain a second execution engine.

Canonical architecture:

SPIRAL OS
  INTENT
    -> AUTHORIZATION
      -> DISTRIBUTION ENGINE
        -> REAL EXTERNAL CHANNEL
          -> OBSERVATION
            -> TRUTH / EVIDENCE

LITE = governed recovery application on top of that execution infrastructure.

Policy is an internal mechanism, NOT a product.

## Non-negotiable

1. ZERO fake success.
2. No simulated/mock/hardcoded-success provider in the production execution path.
3. Missing credentials/configuration = `NOT CONFIGURED` and execution blocked.
4. Never infer `SENT` from `DELIVERED`, `READ`, `REPLIED`, `QUALIFIED` or `CONVERTED`.
5. Provider timeout/unknown = `UNKNOWN`, followed by reconciliation; never success.
6. Authorization must be enforced server-side and bound to tenant, target, action, scope, deadline and idempotency key.
7. Suppression/opt-out must be checked immediately before execution.
8. Webhook authenticity and replay protection must be implemented where supported.
9. Persistent server-side storage; browser/localStorage cannot be the source of truth.
10. Ledger/evidence must be durable, concurrency-safe and tamper-evident.
11. Stable identifiers must survive the chain: `intent_id`, `authorization_id`, `execution_id`, `observation_id`, `receipt_id` where applicable.
12. Truth must distinguish provider acknowledgement from independently observed external effect.

## First real channel

Choose ONE real provider and make it genuinely end-to-end before expanding channels.

Preferred for Lite: WhatsApp Cloud API if technically feasible.
If WhatsApp is blocked by external approval/credentials, implement a real email provider first as the scoped live channel and mark WhatsApp `NOT CONFIGURED`.

The chosen live channel must have:
- credential validation;
- real API call;
- safe request/response capture without secrets;
- idempotency;
- retry policy;
- timeout -> UNKNOWN;
- webhook/observation where available;
- reconciliation/read-after-write where possible;
- durable execution and observation records;
- evidence/receipt generation;
- integration/E2E tests in the target environment or provider sandbox where available.

## Lite integration

Preserve Lite's recovery semantics:

LEAD -> RECOVERY CANDIDATE -> ELIGIBILITY/POLICY -> AUTHORIZATION -> MESSAGE -> EXECUTION -> OBSERVATION -> VERIFICATION -> OUTCOME

Lite owns the recovery UX/use case. Distribution Engine owns execution. Truth owns verification/evidence.

Customer flow:
1. import/upload eligible dormant opportunities;
2. review recovery candidates;
3. authorize selected action;
4. execute through Distribution Engine;
5. observe/reconcile;
6. inspect evidence/outcome.

## Commercial gate

Do not call this production-ready until the deployed target has:
- real backend;
- persistent workspace/customer data;
- real execution path;
- blocked execution when not configured;
- clear provider configuration state;
- no demo language on a configured production path;
- complete operator/customer flow testable end-to-end.

## Required final report

Return exactly:
- LIVE: what is genuinely live;
- NOT CONFIGURED: what is implemented but lacks external credentials/approval;
- BLOCKED: what cannot currently be executed and why;
- chosen real provider;
- request -> execution -> observation -> evidence chain;
- persistence/storage used;
- authorization/idempotency behavior;
- E2E test results;
- production URL;
- remaining external dependencies.

Screenshots are not proof of execution.

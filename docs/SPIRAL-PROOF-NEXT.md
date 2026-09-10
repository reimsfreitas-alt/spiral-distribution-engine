# Spiral Proof — Next Operational Gates

This file is an execution guardrail, not a roadmap of speculative features.

## Current truth

The Distribution Engine is the execution/data plane. It may execute an authorized contract and record execution evidence. It must not become the authority that creates policy, signs authorization, or declares external success.

## Tomorrow-risk register

1. **Authorization drift** — an execution contract can carry authorization data without independently proving that the authorization is valid, unexpired, and bound to the exact execution. Before enabling external production effects, add envelope verification at the engine boundary.
2. **Duplicate side effects** — deterministic idempotency exists, but an external provider must honor or reconcile it. Never claim exactly-once delivery without provider evidence.
3. **UNKNOWN amplification** — transport errors can mean the provider accepted the effect. UNKNOWN requires read-after-write/reconciliation before retry.
4. **Provider divergence** — every adapter must expose a common execution contract and explicit outcome semantics; provider-specific success must not become system-wide verification.
5. **Ledger dependency** — execution evidence is weaker if the ledger is unavailable. Define durable failure behavior before production: fail closed for authorization, preserve local correlation, reconcile later.
6. **Credential isolation** — provider credentials must be tenant/provider scoped and never mixed across executions.
7. **Observation gap** — EXECUTED is not OBSERVED and neither is VERIFIED. An independent observer/verifier remains mandatory for claims of effect.

## P0 gates before real-money / real-customer execution

- Verify authorization envelope: signature, tenant, action, target/scope, execution_id, idempotency_key, deadline/expiry.
- Add provider-independent reconciliation path for UNKNOWN.
- Add duplicate-execution tests under concurrency.
- Add explicit adapter outcome contract: CONFIRMED_SENT / REJECTED / UNKNOWN.
- Record correlation_id and source_ref through every ledger event.
- Ensure no engine endpoint can mutate policy or authorization authority.
- Add a production dry-run/LOG_ONLY mode that exercises the entire chain without external side effects.

## 24-hour decision rule

If a proposed change increases connector count, UI complexity, AI behavior, or marketing surface without closing one of the P0 gates above, defer it.

## Definition of evidence

BUILDING is not READY. EXECUTED is not CONFIRMED. A provider response is not independent observation. A dashboard is not an audit trail. A test is not production evidence.

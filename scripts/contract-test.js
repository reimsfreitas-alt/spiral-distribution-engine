"use strict";

const assert = require("assert");
const { buildExecutionContract, sha256 } = require("../src/core/executionContract");

const campaign = {
    name: "proof-campaign",
    source_ref: "crm-opportunity-42",
    correlation_id: "corr-42",
    content: "test"
};

const a = buildExecutionContract({ tenant_id: "tenant-a", campaign, target: "gmail", payload_ref: "asset-1" });
const b = buildExecutionContract({ tenant_id: "tenant-a", campaign, target: "gmail", payload_ref: "asset-1" });
const c = buildExecutionContract({ tenant_id: "tenant-a", campaign, target: "linkedin", payload_ref: "asset-1" });
const d = buildExecutionContract({ tenant_id: "tenant-b", campaign, target: "gmail", payload_ref: "asset-1" });

assert.equal(a.execution_id, b.execution_id);
assert.equal(a.idempotency_key, b.idempotency_key);
assert.notEqual(a.execution_id, c.execution_id);
assert.notEqual(a.execution_id, d.execution_id);
assert.notEqual(a.idempotency_key, d.idempotency_key);
assert.equal(sha256({ b: 2, a: 1 }), sha256({ a: 1, b: 2 }));
assert.equal(a.action, "publish");
assert.equal(a.scope.target, "gmail");
assert.equal(a.source_ref, "crm-opportunity-42");

console.log("Distribution Engine contract: PASS");

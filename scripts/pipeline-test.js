"use strict";

const assert = require("assert");
const registry = require("../src/core/providerRegistry");
const { publishCampaign } = require("../src/core/publisher");
const jobStore = require("../src/core/jobStore");

async function run() {
  const providers = registry.list();
  assert(providers.some((p) => p.name === "linkedin" && p.real === true));
  assert(providers.some((p) => p.name === "email" && p.real === false));
  assert(providers.some((p) => p.name === "twitter" && p.real === false));

  const before = jobStore.list().length;
  const unauthed = await publishCampaign({
    name: "pipeline-test-no-auth",
    content: "teste",
    targets: ["test"]
  });
  assert.strictEqual(unauthed.authorization, "required");
  assert.strictEqual(unauthed.results[0].state, "CREATED");
  assert.strictEqual(jobStore.list().length, before + 1);

  const simulated = await publishCampaign({
    name: "pipeline-test-simulated",
    content: "teste",
    targets: ["test"],
    authorization: { by: "pipeline-test" }
  });
  assert.strictEqual(simulated.authorization, "granted");
  assert.strictEqual(simulated.results[0].state, "SIMULATED");

  const missingReal = await publishCampaign({
    name: "pipeline-test-real-without-credentials",
    content: "teste",
    targets: ["linkedin"],
    authorization: { by: "pipeline-test" }
  });
  assert.strictEqual(missingReal.results[0].state, "FAILED");
  assert.match(missingReal.results[0].error, /Credenciais ausentes/);

  console.log("pipeline-test: PASS");
}

run().catch((err) => {
  console.error("pipeline-test: FAIL", err);
  process.exitCode = 1;
});

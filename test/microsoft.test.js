"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

test("Microsoft Graph channel is registered", () => {
  const registry = require("../src/core/providerRegistry");
  assert.ok(registry.get("microsoft"));
  assert.equal(typeof registry.get("microsoft").send, "function");
});

test("Microsoft Graph channel rejects missing access token before network call", async () => {
  const previous = process.env.MICROSOFT_GRAPH_ACCESS_TOKEN;
  delete process.env.MICROSOFT_GRAPH_ACCESS_TOKEN;

  try {
    const channel = require("../src/channels/microsoft");
    await assert.rejects(
      channel.send({
        campaign: { subject: "Test", content: "Hello" },
        payload: { to: "audit@example.com", text: "Hello" }
      }),
      /Missing required environment variable: MICROSOFT_GRAPH_ACCESS_TOKEN/
    );
  } finally {
    if (previous === undefined) delete process.env.MICROSOFT_GRAPH_ACCESS_TOKEN;
    else process.env.MICROSOFT_GRAPH_ACCESS_TOKEN = previous;
  }
});

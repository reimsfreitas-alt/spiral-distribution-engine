"use strict";

const assert = require("assert");
const app = require("../src/server");

async function request(path, options = {}) {
    const server = app.listen(0);
    try {
        const port = server.address().port;
        const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
        const body = await response.json();
        return { status: response.status, body };
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
}

(async () => {
    const home = await request("/");
    assert.equal(home.status, 200);
    assert.equal(home.body.status, "online");
    assert.equal(home.body.runtime, "distribution-engine");
    assert(Array.isArray(home.body.providers));

    const health = await request("/health");
    assert.equal(health.status, 200);
    assert.equal(health.body.status, "online");

    const providers = await request("/providers");
    assert.equal(providers.status, 200);
    assert.equal(providers.body.total, providers.body.providers.length);

    console.log("Distribution Engine smoke: PASS");
})();

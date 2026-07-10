"use strict";

const http = require("http");
const https = require("https");

class SpiralLedgerClient {

    constructor(baseUrl, token) {
        this.base = baseUrl.replace(/\/$/, "");
        this.token = token || null;
    }

    request(method, path, body) {

        return new Promise((resolve, reject) => {

            const url = new URL(this.base + path);

            const lib = url.protocol === "https:" ? https : http;

            const req = lib.request({

                hostname: url.hostname,
                port: url.port || (url.protocol === "https:" ? 443 : 80),
                path: url.pathname + url.search,
                method,

                headers: {

                    "Content-Type": "application/json",

                    ...(this.token
                        ? { Authorization: "Bearer " + this.token }
                        : {})

                }

            }, res => {

                let data = "";

                res.on("data", c => data += c);

                res.on("end", () => {

                    let json = {};

                    try {
                        json = data ? JSON.parse(data) : {};
                    } catch {}

                    if (res.statusCode >= 200 && res.statusCode < 300)
                        return resolve(json);

                    reject(new Error(json.error || data || res.statusCode));

                });

            });

            req.on("error", reject);

            if (body)
                req.write(JSON.stringify(body));

            req.end();

        });

    }

    record(event) {
        return this.request("POST", "/v1/records", event);
    }

    latest(decisionId) {
        return this.request(
            "GET",
            "/v1/records/" + encodeURIComponent(decisionId)
        );
    }

    verify() {
        return this.request("GET", "/v1/chain/verify");
    }

}

module.exports = { SpiralLedgerClient };
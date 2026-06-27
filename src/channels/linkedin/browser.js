"use strict";

require("dotenv").config();

const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");

const { log } = require("./utils");

const AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization";

/** Build the LinkedIn authorization URL and the CSRF `state`. */
function buildAuthorizationUrl() {
    const state = crypto.randomBytes(16).toString("hex");

    const scope = process.env.LINKEDIN_SCOPE || "openid profile email w_member_social";

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        state,
        scope
    });

    return { state, url: `${AUTHORIZE_URL}?${params.toString()}` };
}

/**
 * One-shot loopback server bound to LINKEDIN_REDIRECT_URI.
 * Resolves with { code, state } when LinkedIn redirects back.
 */
function waitForAuthorizationCode() {
    const redirect = new URL(process.env.LINKEDIN_REDIRECT_URI);
    const port = redirect.port || 3000;
    const callbackPath = redirect.pathname || "/linkedin/callback";

    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const requestUrl = new URL(req.url, `http://localhost:${port}`);

            if (requestUrl.pathname !== callbackPath) {
                res.writeHead(404);
                res.end();
                return;
            }

            const code = requestUrl.searchParams.get("code");
            const state = requestUrl.searchParams.get("state");

            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end("<h2>LinkedIn autenticado com sucesso.</h2><p>Pode fechar esta janela.</p>");

            server.close();

            if (!code) {
                reject(new Error("Authorization Code não retornado pelo LinkedIn."));
                return;
            }

            resolve({ code, state });
        });

        server.on("error", reject);
        server.listen(port);
    });
}

/**
 * Full interactive consent: open the system browser, capture the redirect,
 * and validate the `state`. Returns the authorization code.
 *
 * `open` v11 is ESM-only, so it is loaded via dynamic import (CommonJS-safe).
 */
async function authorizeViaBrowser() {
    const { state, url } = buildAuthorizationUrl();

    const waiter = waitForAuthorizationCode();

    try {
        const { default: open } = await import("open");
        await open(url);
    } catch (error) {
        log(`Abra esta URL manualmente para autorizar:\n${url}`);
    }

    const result = await waiter;

    if (result.state !== state) {
        throw new Error("State divergente — possível CSRF. Autenticação abortada.");
    }

    return result.code;
}

module.exports = {
    buildAuthorizationUrl,
    waitForAuthorizationCode,
    authorizeViaBrowser
};

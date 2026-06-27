"use strict";

const tokenStore = require("../../core/oauth/tokenStore");

const { authorizeViaBrowser } = require("./browser");
const { exchangeAuthorizationCode } = require("./exchange");
const { publishText } = require("./publish");
const { decodeIdToken, personUrn, isFutureEpoch, log } = require("./utils");

const PROVIDER = "linkedin";

/**
 * Interactive OAuth: browser consent -> exchange -> persist token + id_token.
 */
async function authenticate() {
    log("OAuth iniciado");

    const code = await authorizeViaBrowser();
    const token = await exchangeAuthorizationCode(code);

    if (!token || !token.access_token) {
        throw new Error("Exchange não retornou access_token.");
    }

    // Additive field: absolute reference for status() (expires_in is relative).
    token.obtained_at = new Date().toISOString();

    tokenStore.save(PROVIDER, token);

    log("OAuth concluído");
    log("Token salvo");
    log("Provider conectado");

    return token;
}

/**
 * Publish a text post. The author URN is derived LOCALLY from the persisted
 * id_token (decode -> sub), with NO call to /userinfo.
 */
async function publish(text) {
    log("Publicação iniciada");

    const token = tokenStore.load(PROVIDER);

    if (!token || !token.access_token) {
        throw new Error("Sem token persistido. Rode authenticate() primeiro.");
    }
    if (!token.id_token) {
        throw new Error("Token sem id_token. Refaça authenticate() com escopo openid.");
    }

    const { sub } = decodeIdToken(token.id_token);
    const author = personUrn(sub);

    const result = await publishText({
        accessToken: token.access_token,
        author,
        text
    });

    log("Publicação concluída");
    log(`Share URN: ${result.urn}`);

    return result.urn;
}

/** Remove the persisted token. */
function disconnect() {
    tokenStore.remove(PROVIDER);
    log("Provider desconectado");
    return true;
}

/**
 * Report connection state + token/id_token validity. No network call.
 */
function status() {
    const token = tokenStore.load(PROVIDER);

    if (!token) {
        return { connected: false, reason: "Nenhum token persistido." };
    }

    let idTokenValid = false;
    let idTokenExpiresAt = null;
    let identity = null;

    if (token.id_token) {
        try {
            const claims = decodeIdToken(token.id_token);
            idTokenValid = isFutureEpoch(claims.exp);
            idTokenExpiresAt = claims.exp ? new Date(claims.exp * 1000).toISOString() : null;
            identity = { sub: claims.sub, name: claims.name, email: claims.email };
        } catch (error) {
            idTokenValid = false;
        }
    }

    let accessExpiresAt = null;
    let accessTokenValid = Boolean(token.access_token);

    if (token.obtained_at && typeof token.expires_in === "number") {
        accessExpiresAt = new Date(
            new Date(token.obtained_at).getTime() + token.expires_in * 1000
        ).toISOString();
        accessTokenValid = new Date(accessExpiresAt).getTime() > Date.now();
    }

    return {
        connected: accessTokenValid,
        accessToken: {
            present: Boolean(token.access_token),
            valid: accessTokenValid,
            expiresAt: accessExpiresAt
        },
        idToken: {
            present: Boolean(token.id_token),
            valid: idTokenValid,
            expiresAt: idTokenExpiresAt
        },
        identity
    };
}

module.exports = {
    PROVIDER,
    authenticate,
    publish,
    disconnect,
    status
};

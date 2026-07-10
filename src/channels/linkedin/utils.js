"use strict";

/**
 * LinkedIn provider utilities. Pure functions — NO HTTP, NO side effects.
 */

/** Decode a base64url segment (JWT-safe) to a UTF-8 string. */
function base64UrlDecode(segment) {
    const pad = segment.length % 4 === 0 ? "" : "=".repeat(4 - (segment.length % 4));
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Decode the OpenID id_token (JWT) locally and return the identity claims.
 * No call to /userinfo — the `sub` here is the same member id.
 */
function decodeIdToken(idToken) {
    if (!idToken || typeof idToken !== "string") {
        throw new Error("id_token ausente ou inválido.");
    }

    const parts = idToken.split(".");

    if (parts.length !== 3) {
        throw new Error("id_token não é um JWT válido (esperadas 3 partes).");
    }

    let claims;

    try {
        claims = JSON.parse(base64UrlDecode(parts[1]));
    } catch (error) {
        throw new Error("Falha ao decodificar o payload do id_token: " + error.message);
    }

    return {
        sub: claims.sub,
        email: claims.email,
        name: claims.name,
        picture: claims.picture,
        locale: claims.locale,
        exp: claims.exp,
        iat: claims.iat
    };
}

/** Build the LinkedIn person URN from the OpenID subject id. */
function personUrn(sub) {
    if (!sub) {
        throw new Error("sub ausente; não é possível montar a URN do autor.");
    }
    return `urn:li:person:${sub}`;
}

/** True if a unix-epoch (seconds) timestamp is still in the future. */
function isFutureEpoch(epochSeconds) {
    return typeof epochSeconds === "number" && epochSeconds * 1000 > Date.now();
}

/** Standardized provider log line. */
function log(message) {
    console.log(`[linkedin] ${message}`);
}

module.exports = {
    base64UrlDecode,
    decodeIdToken,
    personUrn,
    isFutureEpoch,
    log
};

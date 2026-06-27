"use strict";

require("dotenv").config();

const axios = require("axios");

const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";

/**
 * Exchange an authorization code for the token set
 * ({ access_token, expires_in, scope, token_type, id_token }).
 */
async function exchangeAuthorizationCode(code) {
    if (!code) {
        throw new Error("Authorization Code não informado.");
    }

    const params = new URLSearchParams();

    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.LINKEDIN_REDIRECT_URI);
    params.append("client_id", process.env.LINKEDIN_CLIENT_ID);
    params.append("client_secret", process.env.LINKEDIN_CLIENT_SECRET);

    try {
        const response = await axios.post(TOKEN_URL, params.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error("Falha no exchange: " + JSON.stringify(error.response.data));
        }
        throw error;
    }
}

module.exports = {
    exchangeAuthorizationCode
};

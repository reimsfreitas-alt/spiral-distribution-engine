require("dotenv").config();

const crypto = require("crypto");

function getAuthorization() {

    const state = crypto.randomBytes(16).toString("hex");

    const scopes = [
        "w_member_social"
    ].join(" ");

    const params = new URLSearchParams({

        response_type: "code",

        client_id: process.env.LINKEDIN_CLIENT_ID,

        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,

        state,

        scope: scopes

    });

    return {

        state,

        url:
            "https://www.linkedin.com/oauth/v2/authorization?" +
            params.toString()

    };

}

module.exports = {

    getAuthorization

};
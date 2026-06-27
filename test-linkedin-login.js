require("dotenv").config();

const crypto = require("crypto");

const state = crypto.randomBytes(16).toString("hex");

const authUrl =
    "https://www.linkedin.com/oauth/v2/authorization?" +
    new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        scope: process.env.LINKEDIN_SCOPE,
        state
    }).toString();

console.log("");
console.log("====================================");
console.log("LINKEDIN LOGIN");
console.log("====================================");
console.log("");
console.log(authUrl);
console.log("");
console.log("STATE:");
console.log(state);
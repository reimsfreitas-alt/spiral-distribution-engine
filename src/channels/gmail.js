const path = require("path");

const { authenticate } = require("@google-cloud/local-auth");

const SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.send"
];

const KEYFILE = path.join(
    __dirname,
    "..",
    "..",
    "config",
    "credentials.json"
);

let authClient = null;

async function authorize() {

    if (authClient) {
        return authClient;
    }

    authClient = await authenticate({
        scopes: SCOPES,
        keyfilePath: KEYFILE
    });

    console.log("====================================");
    console.log("GOOGLE AUTENTICADO");
    console.log("====================================");

    return authClient;
}

module.exports = {
    authorize
};
const linkedin = require("./src/channels/linkedin/index");

const code = process.argv[2];

if (!code) {
    console.error("Uso: node test-authenticate.js <authorization_code>");
    process.exit(1);
}

(async () => {
    try {
        const token = await linkedin.authenticate(code);
        console.log(token);
    } catch (err) {
        console.error(err);
    }
})();
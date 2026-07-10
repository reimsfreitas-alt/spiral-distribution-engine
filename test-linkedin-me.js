const fs = require("fs");
const path = require("path");
const axios = require("axios");

(async () => {

    const token = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, "config", "tokens", "linkedin.json"),
            "utf8"
        )
    );

    const accessToken = token.access_token;

    const endpoints = [
        "https://api.linkedin.com/v2/me",
        "https://api.linkedin.com/v2/userinfo",
        "https://api.linkedin.com/rest/me"
    ];

    for (const url of endpoints) {

        console.log("");
        console.log("================================");
        console.log(url);
        console.log("================================");

        try {

            const r = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "LinkedIn-Version": "202506",
                    "X-Restli-Protocol-Version": "2.0.0"
                }
            });

            console.log(r.data);

        } catch (e) {

            if (e.response) {

                console.log(e.response.status);
                console.log(e.response.data);

            } else {

                console.log(e.message);

            }

        }

    }

})();
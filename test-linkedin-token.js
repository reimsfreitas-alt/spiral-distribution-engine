require("dotenv").config();

const axios = require("axios");

// COLE AQUI O AUTHORIZATION CODE
const CODE =
"AQSywYaEW_q5MkEfw0D7TPeanfC7vnIG9wVNepTVCc7cn9PjRy2KUMr88ug9Ow8sXQ-ypQl6VCobNVimUC4qF2-LVtY4nLGBJ5WiBJNxaQTT2hBYh1EEM4DH2Xw-X3SG7vMbgeHq07TdPu2Xwalp8d4s91SxHr4ucFsvioVC6YwLT4FzMj1gu_CdOgj1rkYcYr3ud1v3XDq9D5itqEU";
(async () => {

    try {

        const params = new URLSearchParams();

        params.append("grant_type", "authorization_code");
        params.append("code", CODE);
        params.append("redirect_uri", process.env.LINKEDIN_REDIRECT_URI);
        params.append("client_id", process.env.LINKEDIN_CLIENT_ID);
        params.append("client_secret", process.env.LINKEDIN_CLIENT_SECRET);

        const response = await axios.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            params.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        console.log("");
        console.log("====================================");
        console.log("ACCESS TOKEN");
        console.log("====================================");
        console.log("");

        console.log(response.data);

    } catch (err) {

        console.log("");
        console.log("====================================");
        console.log("ERRO");
        console.log("====================================");
        console.log("");

        if (err.response) {

            console.log(err.response.data);

        } else {

            console.log(err.message);

        }

    }

})();
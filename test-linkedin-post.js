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

    const payload = {

        author: "urn:li:person:1Obv19LcFX",

        lifecycleState: "PUBLISHED",

        specificContent: {

            "com.linkedin.ugc.ShareContent": {

                shareCommentary: {

                    text:
`🚀 Primeira publicação automática da Spiral Distribution Engine.

Integração OAuth concluída com sucesso.

#SpiralCodes
#LinkedInAPI`

                },

                shareMediaCategory: "NONE"

            }

        },

        visibility: {

            "com.linkedin.ugc.MemberNetworkVisibility":
                "PUBLIC"

        }

    };

    try {

        const response = await axios.post(

            "https://api.linkedin.com/v2/ugcPosts",

            payload,

            {

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`,

                    "Content-Type":
                        "application/json",

                    "X-Restli-Protocol-Version":
                        "2.0.0"

                }

            }

        );

        console.log(response.status);
        console.log(response.data);

    }

    catch (err) {

        console.log(err.response.status);
        console.log(err.response.data);

    }

})();
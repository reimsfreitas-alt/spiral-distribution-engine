require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const path = require("path");

(async () => {

    try {

        const token = JSON.parse(

            fs.readFileSync(

                path.join(
                    __dirname,
                    "config",
                    "tokens",
                    "linkedin.json"
                ),
                "utf8"
            )

        );

        const accessToken = token.access_token;

        // Recupera o perfil do usuário
        const me = await axios.get(

            "https://api.linkedin.com/v2/userinfo",

            {

                headers: {

                    Authorization: `Bearer ${accessToken}`

                }

            }

        );

        const author = `urn:li:person:${me.data.sub}`;

        console.log("Autor:", author);

        const payload = {

            author,

            lifecycleState: "PUBLISHED",

            specificContent: {

                "com.linkedin.ugc.ShareContent": {

                    shareCommentary: {

                        text:
`🚀 Primeira publicação automática da Spiral Distribution Engine.

Hoje concluímos toda a infraestrutura de autenticação OAuth do LinkedIn.

Este post foi publicado automaticamente.

#SpiralCodes
#Automation
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

        console.log("");
        console.log("====================================");
        console.log("PUBLICAÇÃO REALIZADA");
        console.log("====================================");
        console.log(response.data);

    }

    catch (err) {

        console.log("");
        console.log("====================================");
        console.log("ERRO");
        console.log("====================================");

        if (err.response) {

            console.log(err.response.data);

        } else {

            console.log(err.message);

        }

    }

})();
require("dotenv").config();

const axios = require("axios");

(async () => {
    try {
        const response = await axios.post(
            "https://api.linkedin.com/v2/assets?action=registerUpload",
            {
                registerUploadRequest: {
                    owner: process.env.LINKEDIN_AUTHOR_URN,
                    recipes: [
                        "urn:li:digitalmediaRecipe:feedshare-image"
                    ],
                    serviceRelationships: [
                        {
                            relationshipType: "OWNER",
                            identifier: "urn:li:userGeneratedContent"
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("SUCESSO");
        console.log(response.data);

    } catch (err) {

        console.log("STATUS:", err.response?.status);
        console.log("BODY:");
        console.dir(err.response?.data, { depth: null });

    }
})();
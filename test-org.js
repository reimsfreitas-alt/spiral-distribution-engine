require("dotenv").config();

const axios = require("axios");

(async () => {
    try {
        const response = await axios.get(
            "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee",
            {
                headers: {
                    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`
                }
            }
        );

        console.dir(response.data, { depth: null });

    } catch (err) {
        console.log("STATUS:", err.response?.status);
        console.dir(err.response?.data, { depth: null });
    }
})();
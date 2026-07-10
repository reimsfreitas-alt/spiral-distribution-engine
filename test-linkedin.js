require("dotenv").config();

const axios = require("axios");

(async () => {
    try {
        const res = await axios.get(
            "https://api.linkedin.com/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`
                }
            }
        );

        console.log(res.data);
    } catch (err) {
        console.log(err.response?.status);
        console.log(err.response?.data);
    }
})();
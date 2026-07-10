// debug_linkedin.js
require('dotenv').config();
const axios = require('axios');

async function getMyUrn() {
    try {
        const response = await axios.get('https://api.linkedin.com/v2/me', {
            headers: { 'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` }
        });
        console.log("✅ IDENTIDADE DO TOKEN (Use este ID no .env):");
        console.log(`urn:li:person:${response.data.id}`);
    } catch (error) {
        console.error("❌ Erro ao buscar identidade:", error.response?.data || error.message);
    }
}

getMyUrn();
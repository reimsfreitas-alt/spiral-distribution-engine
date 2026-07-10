const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

async function getURNs() {
    try {
        // 1. Seu URN de Pessoa
        const me = await axios.get("https://api.linkedin.com/v2/me", {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log("Seu URN de Pessoa:", me.data.id); // O URN geralmente é urn:li:person:<id>

        // 2. Seus URNs de Organização
        const orgs = await axios.get("https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR", {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log("Suas Organizações:", JSON.stringify(orgs.data.elements, null, 2));

    } catch (e) {
        console.error("Erro na busca de URNs:", e.response?.data || e.message);
    }
}
getURNs();
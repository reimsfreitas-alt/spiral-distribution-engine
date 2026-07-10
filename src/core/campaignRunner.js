const { listCampaigns } = require("./campaignList");
const { publishCampaign } = require("./publisher");

async function runCampaign(index = 0) {

    const campaigns = listCampaigns();

    if (campaigns.length === 0) {

        console.log("");
        console.log("========================================");
        console.log("NENHUMA CAMPANHA ENCONTRADA");
        console.log("========================================");
        console.log("");

        return;

    }

    const campaign = campaigns[index];

    console.log("");
    console.log("========================================");
    console.log("CARREGANDO CAMPANHA");
    console.log("========================================");

    await publishCampaign(campaign);

}

module.exports = {
    runCampaign
};
const { listCampaigns } = require("./src/services/campaignList");

const campaigns = listCampaigns();

console.log("");
console.log("========================================");
console.log(" CAMPANHAS DA SPIRAL");
console.log("========================================");

campaigns.forEach((campaign, index) => {

    console.log("");

    console.log(`${index + 1}. ${campaign.name}`);

    console.log(`Produto : ${campaign.product}`);

    console.log(`Status  : ${campaign.status}`);

    console.log(`Canais  : ${campaign.channels.join(", ")}`);

});

console.log("");
console.log("========================================");
console.log(`Total: ${campaigns.length}`);
console.log("========================================");
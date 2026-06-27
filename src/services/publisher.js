const { resolveAssets } = require("./assetResolver");

async function publishCampaign(campaign) {

    console.log("");
    console.log("========================================");
    console.log("      SPIRAL PUBLISH PIPELINE");
    console.log("========================================");
    console.log("");

    console.log("Campanha:");
    console.log(campaign.name);
    console.log("");

    const assets = resolveAssets(campaign.assets);

    console.log("Assets encontrados:");
    console.log("");

    assets.forEach((asset, index) => {

        console.log(`${index + 1}. ${asset.name}`);

    });

    console.log("");
    console.log("Canais:");

    campaign.channels.forEach(channel => {

        console.log(`• ${channel}`);

    });

    console.log("");
    console.log("========================================");
    console.log("PIPELINE PREPARADO");
    console.log("========================================");
    console.log("");

    return {

        campaign,
        assets

    };

}

module.exports = {
    publishCampaign
};
const { moveCampaign } = require("./core/campaignState");
const { resolveAssets } = require("./core/assetResolver");
const { dispatch } = require("./core/channelDispatcher");

async function publishMenu() {

    // campanha temporária de teste
    const { loadNextCampaign } = require("./core/campaignLoader");

while (true) {

    const campaign = loadNextCampaign();

    if (!campaign) {

        console.log("");
        console.log("Fila concluída.");
        break;

    }

    // permanece toda a lógica atual
    // resolveAssets
    // dispatch
    // moveCampaign

}

if (!campaign) {

    console.log("");

    console.log("Nenhuma campanha disponível.");

    return;

}
    const assets = resolveAssets(campaign.assets);

    console.log("");
    console.log("========================================");
    console.log("      SPIRAL PUBLISH PIPELINE");
    console.log("========================================");
    console.log("");

    console.log("Campanha:");
    console.log(campaign.name);
    console.log("");

    console.log("Assets:");

    assets.forEach(asset => {
        console.log(`• ${asset.name}`);
    });

    console.log("");

    let success = true;

for (const channel of campaign.channels) {

    try {

        await dispatch(channel, campaign, assets);

    } catch (error) {

        success = false;

        console.error(error.message);

    }

}

if (campaign.__file) {

    moveCampaign(

        campaign.__file,

        success ? "published" : "failed"

    );

}
    console.log("");
    console.log("========================================");
    console.log("PIPELINE FINALIZADO");
    console.log("========================================");
}

module.exports = publishMenu;
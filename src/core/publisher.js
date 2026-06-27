const { resolveAssets } = require("./assetResolver");
const { dispatch } = require("./channelDispatcher");

async function publishCampaign(campaign) {

    console.log("");
    console.log("========================================");
    console.log("      SPIRAL PUBLISH PIPELINE");
    console.log("========================================");

    const assets = resolveAssets(campaign.assets);

    const results = [];

    for (const channel of campaign.channels) {

        const result = await dispatch(

            channel,

            campaign,

            assets

        );

        results.push(result);

    }

    console.log("");
    console.log("========================================");
    console.log("RESULTADO");
    console.log("========================================");

    results.forEach(result => {

        console.log(

            `${result.channel} -> ${result.message}`

        );

    });

    console.log("");
    console.log("========================================");
    console.log("PIPELINE FINALIZADO");
    console.log("========================================");

    return results;

}

module.exports = {

    publishCampaign

};
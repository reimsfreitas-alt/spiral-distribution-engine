function execute(campaign, assets) {

    console.log("");
    console.log("========================================");
    console.log("        SPIRAL DRY RUN");
    console.log("========================================");

    console.log("");

    console.log(`Campanha : ${campaign.name}`);
    console.log(`ID       : ${campaign.id}`);

    console.log("");

    console.log("Canais:");

    campaign.channels.forEach(channel => {

        console.log(`   ✓ ${channel}`);

    });

    console.log("");

    console.log("Assets:");

    assets.forEach(asset => {

        console.log(`   ✓ ${asset.name}`);

    });

    console.log("");

    console.log("Nenhuma publicação foi enviada.");

    console.log("");

}

module.exports = {
    execute
};
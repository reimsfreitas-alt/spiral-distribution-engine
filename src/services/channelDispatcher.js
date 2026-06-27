async function dispatch(channel, assets) {

    console.log("");

    console.log("========================================");
    console.log(`CANAL: ${channel.toUpperCase()}`);
    console.log("========================================");

    assets.forEach(asset => {

        console.log(`• ${asset.name}`);

    });

    console.log("");

    switch (channel) {

        case "gmail":

            console.log(">> Gmail ainda em integração.");

            break;

        case "linkedin":

            console.log(">> LinkedIn ainda em integração.");

            break;

        case "instagram":

            console.log(">> Instagram ainda em integração.");

            break;

        case "whatsapp":

            console.log(">> WhatsApp ainda em integração.");

            break;

        case "telegram":

            console.log(">> Telegram ainda em integração.");

            break;

        default:

            console.log("Canal não reconhecido.");

    }

}

module.exports = {
    dispatch
};
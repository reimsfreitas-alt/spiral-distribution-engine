const { getPlugin } = require("./pluginManager");

async function dispatch(channel, campaign, assets) {

    console.log("");
    console.log("========================================");
    console.log(`CANAL: ${channel.toUpperCase()}`);
    console.log("========================================");

    const plugin = getPlugin(channel);

    if (!plugin) {

        return {

            success: false,

            channel,

            message: "Plugin inexistente"

        };

    }

    return await plugin.publish({

        campaign,

        assets

    });

}

module.exports = {

    dispatch

};
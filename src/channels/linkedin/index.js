"use strict";

const provider = require("./provider");

/**
 * Plugin contract used by the channel dispatcher: publish({ campaign, assets }).
 * Reduces to provider.publish(campaign.text), so the CLI only ever needs text.
 */
async function publish({ campaign }) {
    const urn = await provider.publish(campaign.text);
    return { success: Boolean(urn), channel: "linkedin", urn };
}

module.exports = {
    publish,
    authenticate: provider.authenticate,
    disconnect: provider.disconnect,
    status: provider.status
};

/**
 * Direct CLI:
 *   node src/channels/linkedin/index.js authenticate
 *   node src/channels/linkedin/index.js publish "texto"
 *   node src/channels/linkedin/index.js status
 *   node src/channels/linkedin/index.js disconnect
 */
if (require.main === module) {
    const [, , command, ...rest] = process.argv;
    const text = rest.join(" ");

    (async () => {
        try {
            if (command === "authenticate") {
                await provider.authenticate();
            } else if (command === "publish") {
                if (!text) throw new Error('Uso: node src/channels/linkedin/index.js publish "seu texto"');
                await provider.publish(text);
            } else if (command === "status") {
                console.log(JSON.stringify(provider.status(), null, 2));
            } else if (command === "disconnect") {
                provider.disconnect();
            } else {
                console.log('Comandos: authenticate | publish "texto" | status | disconnect');
            }
        } catch (error) {
            console.error(`[linkedin] erro: ${error.message}`);
            process.exit(1);
        }
    })();
}

/**
 * Provider: Discord
 * Localização: src/providers/discord.js
 */

async function send({ target, campaign, payload }) {
    console.log(`\n💬 [Discord] Conectando ao Webhook do servidor...`);
    
    // Simulação de envio com embed
    console.log(`💬 [Discord] Mensagem enviada para o canal de anúncios.`);
    
    return { status: "success", network: "discord", id: "webhook_999" };
}

module.exports = { send };
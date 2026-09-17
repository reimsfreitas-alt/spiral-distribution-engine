/**
 * Provider: Twitter / X (SIMULADO)
 *
 * Não faz nenhuma chamada de rede. O registry marca este provider explicitamente como
 * real:false. Postar via X API v2 exige OAuth de usuário e assinatura apropriada, o que
 * não está implementado nesta sessão. Fica simulado em vez de fingir uma integração real.
 */

async function send({ payload }) {
    console.log(`\n🐦 [Twitter] Simulação local de publicação.`);

    if (payload.attachments.length > 0) {
        console.log(`🖼️ [Twitter] Simulação de ${payload.attachments.length} mídias...`);
    }

    console.log(`🐦 [Twitter] Simulação: "${payload.text.substring(0, 50)}..."`);

    return { status: "success", network: "twitter", id: "tweet_simulated_001" };
}

module.exports = { send };

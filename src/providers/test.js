/**
 * Provider de Teste (Simulador)
 * Localização: src/providers/test.js
 */

async function send({ target, campaign, payload }) {
    // Log de depuração para você ver o que está chegando
    console.log(`[DEBUG] Recebido no provider de teste:`, { target });

    // Verificação de segurança: evita o erro "Cannot read properties of undefined"
    if (!campaign) {
        throw new Error("Campanha não definida. Verifique o objeto enviado pelo Publisher.");
    }

    // Acessando os dados de forma segura
    const campaignName = campaign.name || "Campanha Sem Nome";
    const content = payload ? JSON.stringify(payload) : "Sem conteúdo";

    console.log(`📡 Distribuindo para: ${target}...`);
    console.log(`📝 Campanha: ${campaignName}`);
    console.log(`📦 Payload: ${content}`);

    // Simula um tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 500));

    return { 
        status: "success", 
        message: `Disparo simulado para ${target} concluído.` 
    };
}

module.exports = { send };
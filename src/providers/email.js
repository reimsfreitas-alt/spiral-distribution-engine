/**
 * Provider: Email (SIMULADO)
 *
 * Não faz nenhuma chamada de rede. O fluxo real de Gmail (OAuth via
 * @google-cloud/local-auth) permanece em legacy/channels/gmail.js e não está conectado a
 * este pipeline. O registry marca este provider explicitamente como real:false.
 */

async function send({ payload }) {
    console.log(`\n📧 [Email] Preparando servidor SMTP...`);
    console.log(`📧 [Email] Disparado para a lista de contatos: "${payload.text}"`);
    return {
        status: "success",
        network: "email",
        id: "email_sent_001"
    };
}

module.exports = { send };

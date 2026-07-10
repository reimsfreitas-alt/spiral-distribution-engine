/**
 * Provider: Email
 * Localização: src/providers/email.js
 */

async function send({ target, campaign, payload }) {
    console.log(`\n📧 [Email] Preparando servidor SMTP...`);
    
    // Aqui viria a lógica: transporter.sendMail(...)
    
    console.log(`📧 [Email] Disparado para a lista de contatos: "${payload.text}"`);
    
    return { 
        status: "success", 
        network: "email", 
        id: "email_sent_001" 
    };
}

module.exports = { send };
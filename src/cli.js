/**
 * Motor de Disparo: Spiral Engine
 * Orquestrador Central: cli.js
 */

const path = require('path');
const dotenv = require('dotenv');

// 1. Carregamento forçado e absoluto do .env na raiz (C:\espiral\distribution-engine\.env)
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const { publishCampaign } = require('./core/publisher');
const fs = require('fs');

async function main() {
    console.log("🚀 Iniciando Motor Espiral v1.0...");

    // 2. Verificação crítica de segurança
    const requiredVars = ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_AUTHOR_URN'];
    const missing = requiredVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ ERRO CRÍTICO: Variáveis não carregadas.");
        console.error("Verifique se o arquivo .env está em:", envPath);
        console.error("Variáveis faltando:", missing.join(', '));
        return;
    }

    console.log("✅ Variáveis carregadas com sucesso.");
    console.log(`👤 Autor detectado: ${process.env.LINKEDIN_AUTHOR_URN}`);

    // Definição da Campanha
    const campaignPath = path.join(__dirname, '../campaigns/lançamento-dia-d.json');
    
    if (!fs.existsSync(campaignPath)) {
        console.error(`❌ Erro: Campanha não encontrada em ${campaignPath}`);
        return;
    }

    try {
        const campaignData = fs.readFileSync(campaignPath, 'utf-8');
        const campaign = JSON.parse(campaignData);
        
        console.log(`📡 Carregando combustível: ${campaign.name}...`);
        
        // Execução do Pipeline
        await publishCampaign(campaign);
        
        console.log("✅ Pipeline concluído. O mundo está recebendo a mensagem.");
    } catch (error) {
        // Log detalhado para capturar onde o fluxo quebrou
        console.error("❌ Erro Fatal no Pipeline:");
        console.error(error.message);
    }
}

main();
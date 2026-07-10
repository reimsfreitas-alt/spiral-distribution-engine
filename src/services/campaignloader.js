const fs = require('fs');
const path = require('path');

function getAvailableCampaigns() {
    // Aponta para a raiz do projeto (C:\espiral\distribution-engine\campaigns)
    const dir = path.join(__dirname, '../../campaigns');
    
    if (!fs.existsSync(dir)) {
        console.log(`[ERRO] Diretório de campanhas não encontrado em: ${dir}`);
        fs.mkdirSync(dir);
        return [];
    }
    
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
            name: file.replace('.json', ''),
            path: path.join(dir, file)
        }));
}

function loadCampaign(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { getAvailableCampaigns, loadCampaign };
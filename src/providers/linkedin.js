const axios = require('axios');
const fs = require('fs');

async function send({ target, campaign, payload }) {
    console.log(`\n🔗 [LinkedIn] Iniciando Postagem com Mídia...`);
    
    const TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
    const AUTHOR_URN = process.env.LINKEDIN_AUTHOR_URN;

    try {
        const assets = [];
        // 1. Processar cada imagem (Protocolo de Registro)
        for (const filePath of payload.attachments) {
            console.log(`🖼️ [LinkedIn] Registrando asset: ${filePath}`);
            
            // Passo 1: Registrar a intenção de upload
            const registerRes = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', {
                "registerUploadRequest": {
                    "owner": AUTHOR_URN,
                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                    "serviceRelationships": [{"relationshipType": "OWNER", "identifier": "urn:li:userGeneratedContent"}]
                }
            }, { headers: { 'Authorization': `Bearer ${TOKEN}` } });

            const uploadUrl = registerRes.data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
            const assetUrn = registerRes.data.value.asset;

            // Passo 2: Upload binário da imagem
            const fileData = fs.readFileSync(filePath);
            await axios.put(uploadUrl, fileData, { 
                headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/octet-stream' } 
            });
            
            assets.push(assetUrn);
            console.log(`✅ [LinkedIn] Asset registrado e enviado: ${assetUrn}`);
        }

        // 2. Publicar o post final com todas as imagens
        const postResponse = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
            "author": AUTHOR_URN,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": { "text": payload.text },
                    "shareMediaCategory": "IMAGE",
                    "media": assets.map(urn => ({ "status": "READY", "media": urn }))
                }
            },
            "visibility": { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
        }, { headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });

        console.log(`🚀 [LinkedIn] Post com imagem publicado com sucesso!`);
        return { status: "success" };

    } catch (error) {
        console.error("❌ Erro Real LinkedIn (Detalhe):", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { send };
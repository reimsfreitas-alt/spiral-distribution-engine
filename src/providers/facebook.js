const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FB_API_VERSION = "v21.0"; // Definindo versão para estabilidade

async function send(data) {
    const campaign = data.campaign;
    const payload = data.payload;

    console.log("\n📘 [Facebook] Iniciando publicação...\n");

    if (!PAGE_ID) throw new Error("FACEBOOK_PAGE_ID não configurado.");
    if (!ACCESS_TOKEN) throw new Error("FACEBOOK_ACCESS_TOKEN não configurado.");
    if (!payload.text) throw new Error("Campanha sem conteúdo.");
    if (!payload.attachments || payload.attachments.length === 0)
        throw new Error("Campanha sem imagens.");

    const uploadedMedia = [];

    // 1. Upload de Mídia (Processamento Sequencial para garantir integridade)
    for (const asset of campaign.assets) {
        const imagePath = path.join(__dirname, "../../assets/marketing", asset);

        if (!fs.existsSync(imagePath)) {
            throw new Error(`Imagem não encontrada: ${imagePath}`);
        }

        console.log(`🖼️ Upload: ${asset}`);

        const form = new FormData();
        form.append("source", fs.createReadStream(imagePath));
        form.append("published", "false"); // Mantém a mídia no servidor sem postar ainda
        form.append("access_token", ACCESS_TOKEN);

        try {
            const response = await axios.post(
                `https://graph.facebook.com/${FB_API_VERSION}/${PAGE_ID}/photos`,
                form,
                { headers: form.getHeaders() }
            );
            uploadedMedia.push(response.data.id);
        } catch (error) {
            throw new Error(`Falha no upload da mídia ${asset}: ${error.message}`);
        }
    }

    // 2. Criação do Post (O Ledger só aceita a transação se o post for criado)
    console.log("🔗 Criando publicação no Feed...");

    const attached_media = uploadedMedia.map((id) => ({ media_fbid: id }));

    const postPayload = {
        message: payload.text,
        attached_media: attached_media,
        access_token: ACCESS_TOKEN,
    };

    try {
        await axios.post(
            `https://graph.facebook.com/${FB_API_VERSION}/${PAGE_ID}/feed`,
            postPayload
        );
        console.log("✅ Facebook finalizado.");
        return true;
    } catch (error) {
        throw new Error(`Falha ao publicar no feed: ${error.message}`);
    }
}

module.exports = { send };
const { select } = require("@inquirer/prompts");

async function showMenu() {

    const resposta = await select({
        message: "Escolha uma opção:",
        choices: [
            {
                name: "📁 Ver Ativos",
                value: "ativos"
            },
            {
                name: "🚀 Publicar",
                value: "publicar"
            },
            {
                name: "🩺 Doctor",
                value: "doctor"
            },
            {
                name: "📊 Estatísticas",
                value: "estatisticas"
            },
            {
                name: "⚙ Configurações",
                value: "configuracoes"
            },
            {
                name: "❌ Sair",
                value: "sair"
            }
        ]
    });

    return resposta;

}

module.exports = showMenu;
#!/usr/bin/env node

console.clear();

const showMenu = require("./menu");
const publishMenu = require("./publisher");
const showAssets = require("./assetManager");

async function main() {

    console.log(`
=========================================
      SPIRAL DISTRIBUTION ENGINE
=========================================
`);

    const opcao = await showMenu();

    switch (opcao) {

        case "ativos":

            showAssets();

            break;

        case "publicar":

            await publishMenu();

            break;

        case "estatisticas":

            console.clear();

            console.log("📊 Estatísticas ainda em construção.");

            break;

        case "configuracoes":

            console.clear();

            console.log("⚙ Configurações ainda em construção.");

            break;

        default:

            console.clear();

            console.log("Até logo, Diretor.");

    }

}

main();
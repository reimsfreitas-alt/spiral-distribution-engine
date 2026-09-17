#!/usr/bin/env node
"use strict";

/**
 * Spiral Distribution Engine — CLI ("spiral" bin).
 *
 * Before this session, this file only ever did one thing: load the single hardcoded file
 * campaigns/lançamento-dia-d.json (whose name was mangled to "lan#U00e7amento-dia-d.json" on
 * disk — a real encoding bug, now noted in docs) and check only two LinkedIn env vars,
 * regardless of which targets that campaign actually listed. It could not run any other
 * campaign. This version is a real general-purpose CLI: it takes a campaign file, resolves
 * whichever providers that campaign targets through the same registry the server uses, and
 * requires an explicit --authorize flag before anything is dispatched — the same
 * intent-without-authorization-does-nothing rule the HTTP API enforces.
 */

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { Command } = require("commander");
const { publishCampaign } = require("./core/publisher");
const registry = require("./core/providerRegistry");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const program = new Command();

program
    .name("spiral")
    .description("Spiral Distribution Engine CLI")
    .version(require("../package.json").version);

program
    .command("providers")
    .description("Lista os providers e seu status real (real/simulado, credenciado ou não)")
    .action(() => {
        for (const p of registry.list()) {
            const flag = p.status === "real_ready" ? "✅ real, pronto"
                : p.status === "real_missing_credentials" ? `⚠️  real, faltando: ${p.missingEnv.join(", ")}`
                : "◌ simulado (não toca a rede)";
            console.log(`${p.name.padEnd(10)} ${flag}`);
        }
    });

program
    .command("publish <campaignFile>")
    .description("Publica um arquivo de campanha JSON ({name, content, targets, assets})")
    .option("--authorize <by>", "Autoriza explicitamente a execução, identificando quem autorizou")
    .option("--note <note>", "Nota opcional de autorização")
    .action(async (campaignFile, options) => {
        const fullPath = path.resolve(process.cwd(), campaignFile);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Campanha não encontrada: ${fullPath}`);
            process.exitCode = 1;
            return;
        }

        const intent = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
        const authorization = options.authorize ? { by: options.authorize, note: options.note || null } : null;

        if (!authorization) {
            console.log("⚠️  Nenhuma autorização informada (--authorize <nome>). A intenção será registrada, mas nada será executado.");
        }

        try {
            const result = await publishCampaign({ intent, authorization });
            console.log(JSON.stringify(result, null, 2));
            const anyFailed = result.results.some((r) => r.state === "FAILED" || r.state === "UNKNOWN");
            if (anyFailed) process.exitCode = 1;
        } catch (err) {
            console.error("❌ Erro no pipeline:", err.message);
            process.exitCode = 1;
        }
    });

program.parse(process.argv);

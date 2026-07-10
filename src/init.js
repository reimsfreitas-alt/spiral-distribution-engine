"use strict";

const fs = require("fs");
const path = require("path");

const folders = [
    "logs",
    "publish",
    "campaigns",
    "campaigns/ready",
    "campaigns/published",
    "campaigns/failed",
    "config",
    "config/tokens"
];

folders.forEach(folder => {

    const full = path.join(process.cwd(), folder);

    if (!fs.existsSync(full)) {

        fs.mkdirSync(full, { recursive: true });

        console.log("✓ criado:", folder);

    } else {

        console.log("• existe:", folder);

    }

});

const env = path.join(process.cwd(), ".env");

if (!fs.existsSync(env)) {

    fs.writeFileSync(env, "");

    console.log("✓ criado: .env");

}

console.log("");
console.log("Spiral inicializada.");
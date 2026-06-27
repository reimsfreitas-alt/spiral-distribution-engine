const fs = require("fs");
const path = require("path");

console.log("");
console.log("========== SPIRAL DOCTOR ==========");
console.log("");

const checks = [

    {
        name: "package.json",
        file: "package.json"
    },

    {
        name: ".env",
        file: ".env"
    },

    {
        name: "config/Config.json",
        file: "config/Config.json"
    },

    {
        name: "config/tokens",
        file: "config/tokens"
    }

];

checks.forEach(check => {

    const ok = fs.existsSync(path.join(process.cwd(), check.file));

    console.log(`${ok ? "✅" : "❌"} ${check.name}`);

});

console.log("");
console.log("==================================");
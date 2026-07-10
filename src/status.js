const fs = require("fs");
const path = require("path");

const folders = [
    "ready",
    "processing",
    "published",
    "failed"
];

console.log("");
console.log("========== SPIRAL HUB STATUS ==========");
console.log("");

folders.forEach(folder => {

    const dir = path.join(
        process.cwd(),
        "campaigns",
        folder
    );

    const total = fs.existsSync(dir)
        ? fs.readdirSync(dir).length
        : 0;

    console.log(`${folder.padEnd(12)} : ${total}`);

});

console.log("");
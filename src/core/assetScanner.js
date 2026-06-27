const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "assets");

function scanAssets(root = ROOT) {

    const assets = [];

    function walk(dir) {

        const files = fs.readdirSync(dir, {
            withFileTypes: true
        });

        for (const file of files) {

            if (
                file.name.startsWith(".") ||
                file.name === "node_modules"
            ) {
                continue;
            }

            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {

                walk(fullPath);

            } else {

                const ext = path.extname(file.name).toLowerCase();

                if ([".png", ".jpg", ".jpeg"].includes(ext)) {

                    assets.push({
                        name: file.name,
                        path: fullPath,
                        size: fs.statSync(fullPath).size
                    });

                }

            }

        }

    }

    walk(root);

    return assets;

}

module.exports = scanAssets;
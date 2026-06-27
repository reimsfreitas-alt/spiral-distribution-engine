const scanAssets = require("./assetScanner");

function formatBytes(bytes) {

    if (bytes < 1024)
        return bytes + " B";

    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / 1024 / 1024).toFixed(2) + " MB";

}

function showAssets() {

    const assets = scanAssets();

    console.clear();

    console.log(`
======================================================
          SPIRAL DISTRIBUTION ENGINE
======================================================

PATRIMÔNIO DA SPIRAL

======================================================
`);

    assets.forEach((asset, index) => {

        console.log(`${index + 1}. ${asset.name}`);
        console.log(`   📦 ${formatBytes(asset.size)}`);
        console.log("");

    });

    console.log("======================================================");
    console.log(`Total de ativos: ${assets.length}`);
    console.log("======================================================");

}

module.exports = showAssets;
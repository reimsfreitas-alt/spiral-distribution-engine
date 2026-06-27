const scanAssets = require("../assetScanner");

function resolveAssets(ids) {

    const assets = scanAssets();

    return ids
        .map(id => assets[id - 1])
        .filter(Boolean);

}

module.exports = {
    resolveAssets
};
const fs = require("fs");
const path = require("path");

const READY = path.join(process.cwd(), "campaigns", "ready");

function loadNextCampaign() {

    const files = fs.readdirSync(READY)
        .filter(file => file.endsWith(".json"))
        .sort();

    if (files.length === 0) {
        return null;
    }

    const file = files[0];

    const fullPath = path.join(READY, file);

    const campaign = JSON.parse(
        fs.readFileSync(fullPath, "utf8")
    );

    campaign.__file = fullPath;

    return campaign;

}

module.exports = {
    loadNextCampaign
};
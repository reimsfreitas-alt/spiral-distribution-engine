const fs = require("fs");
const path = require("path");

const READY_DIR = path.join(__dirname, "..", "..", "campaigns", "ready");

function loadNextCampaign() {

    if (!fs.existsSync(READY_DIR)) {
        throw new Error(`Pasta não encontrada: ${READY_DIR}`);
    }

    const files = fs
        .readdirSync(READY_DIR)
        .filter(file => file.endsWith(".json"))
        .sort();

    if (files.length === 0) {
        return null;
    }

    const file = files[0];
    const filePath = path.join(READY_DIR, file);

    const campaign = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    campaign.__file = filePath;

    return campaign;
}

module.exports = {
    loadNextCampaign
};
const fs = require("fs");
const path = require("path");

const CAMPAIGN_DIR = path.join(
    __dirname,
    "..",
    "..",
    "campaigns"
);

function listCampaigns() {

    if (!fs.existsSync(CAMPAIGN_DIR)) {
        return [];
    }

    const files = fs.readdirSync(CAMPAIGN_DIR);

    return files
        .filter(file => file.endsWith(".json"))
        .map(file => {

            const filepath = path.join(CAMPAIGN_DIR, file);

            return JSON.parse(
                fs.readFileSync(filepath)
            );

        });

}

module.exports = {
    listCampaigns
};
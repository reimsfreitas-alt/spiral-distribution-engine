const fs = require("fs");
const path = require("path");

const CAMPAIGN_DIR = path.join(
    __dirname,
    "..",
    "..",
    "campaigns"
);

function saveCampaign(campaign) {

    if (!fs.existsSync(CAMPAIGN_DIR)) {
        fs.mkdirSync(CAMPAIGN_DIR, { recursive: true });
    }

    const filename =
        campaign.name
            .toLowerCase()
            .replace(/\s+/g, "-") + ".json";

    const filepath = path.join(CAMPAIGN_DIR, filename);

    fs.writeFileSync(
        filepath,
        JSON.stringify(campaign, null, 4)
    );

    console.log("");
    console.log("========================================");
    console.log("CAMPANHA SALVA");
    console.log("========================================");
    console.log(filepath);
    console.log("");
}

module.exports = {
    saveCampaign
};
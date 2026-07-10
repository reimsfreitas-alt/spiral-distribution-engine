const { saveCampaign } = require("./src/services/campaignManager");

saveCampaign({

    name: "Lançamento Spiral Wealth",

    product: "Spiral Wealth",

    channels: [
        "gmail",
        "linkedin"
    ],

    assets: [
        1,
        2,
        3
    ],

    status: "draft",

    createdAt: new Date().toISOString()

});
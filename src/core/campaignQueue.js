const { loadNextCampaign } = require("./campaignLoader");

function next() {
    return loadNextCampaign();
}

module.exports = {
    next
};
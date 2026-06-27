const provider = require("./linkedin");

async function publish({ campaign }) {

    return await provider.publish(campaign.text);

}

module.exports = {

    publish

};
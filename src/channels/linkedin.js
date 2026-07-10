const provider = require("../providers/linkedin");

async function publish({ campaign }) {

    return await provider.publish(campaign);

}

module.exports = {
    publish
};
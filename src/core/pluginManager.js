const registry = require("./providerRegistry");

registry.register("gmail", require("../channels/gmail"));
registry.register("linkedin", require("../channels/linkedin"));

function getPlugin(channel) {
    return registry.get(channel);
}

module.exports = {
    getPlugin
};
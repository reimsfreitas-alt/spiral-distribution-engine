const registry = require("./providerRegistry");

function getPlugin(channel) {
    return registry.get(channel);
}

function listPlugins() {
    return registry.list();
}

module.exports = {
    getPlugin,
    listPlugins
};
const providers = new Map();

function register(name, provider) {
    providers.set(name, provider);
}

function get(name) {
    return providers.get(name);
}

function all() {
    return [...providers.keys()];
}

module.exports = {
    register,
    get,
    all
};
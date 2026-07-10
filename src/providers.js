const registry = require("./core/providerRegistry");

console.log("");

console.log("========== PROVIDERS ==========");

console.log("");

registry.list().forEach(provider => {

    console.log("✓", provider);

});

console.log("");

console.log("===============================");
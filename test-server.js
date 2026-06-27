const {

    waitForAuthorizationCode

} = require("./src/core/oauth/server");

console.log("");

console.log("================================");

console.log("SERVIDOR AGUARDANDO CALLBACK");

console.log("================================");

console.log("");

waitForAuthorizationCode()

.then(console.log);
require("dotenv").config();

const { getAuthorization } =
    require("./src/channels/linkedin/auth");

const auth = getAuthorization();

console.log("");

console.log("====================================");
console.log("LINKEDIN AUTH");
console.log("====================================");

console.log("");

console.log(auth.url);

console.log("");

console.log("STATE:");

console.log(auth.state);
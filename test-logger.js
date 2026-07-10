const logger = require("./src/core/logger/index.js");

console.log("LOGGER:");
console.log(logger);
console.log("TIPO:", typeof logger.info);

logger.info("Pipeline iniciado.");
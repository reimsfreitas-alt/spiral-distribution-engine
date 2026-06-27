const LEVELS = {

    INFO: "INFO",

    SUCCESS: "SUCCESS",

    WARN: "WARN",

    ERROR: "ERROR",

    DEBUG: "DEBUG"

};

function print(level, message) {

    console.log(`[${level}] ${message}`);

}

module.exports = {

    info(message) {

        print(LEVELS.INFO, message);

    },

    success(message) {

        print(LEVELS.SUCCESS, message);

    },

    warn(message) {

        print(LEVELS.WARN, message);

    },

    error(message) {

        print(LEVELS.ERROR, message);

    },

    debug(message) {

        print(LEVELS.DEBUG, message);

    }

};
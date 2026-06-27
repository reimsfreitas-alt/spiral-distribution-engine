const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "distribution.log");

function ensureLogFolder() {

    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }

}

function writeLog(message) {

    ensureLogFolder();

    const now = new Date();

    const line =
        `[${now.toLocaleString()}] ${message}\n`;

    fs.appendFileSync(LOG_FILE, line);

}

module.exports = writeLog;
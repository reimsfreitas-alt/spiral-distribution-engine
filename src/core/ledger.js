const fs = require("fs");
const path = require("path");

const FILE = path.join(
    process.cwd(),
    "logs",
    "ledger",
    "ledger.jsonl"
);

function append(entry) {

    fs.appendFileSync(

        FILE,

        JSON.stringify(entry) + "\n",

        "utf8"

    );

}

module.exports = {

    append

};
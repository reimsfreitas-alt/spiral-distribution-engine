const fs = require("fs");
const path = require("path");

const TOKEN_DIR = path.join(
    process.cwd(),
    "config",
    "tokens"
);

function ensureDirectory() {

    if (!fs.existsSync(TOKEN_DIR)) {

        fs.mkdirSync(TOKEN_DIR, {

            recursive: true

        });

    }

}

function getFile(provider) {

    ensureDirectory();

    return path.join(

        TOKEN_DIR,

        `${provider}.json`

    );

}

function save(provider, token) {

    const file = getFile(provider);

    fs.writeFileSync(

        file,

        JSON.stringify(token, null, 4),

        "utf8"

    );

}

function load(provider) {

    const file = getFile(provider);

    if (!fs.existsSync(file)) {

        return null;

    }

    return JSON.parse(

        fs.readFileSync(file, "utf8")

    );

}

function exists(provider) {

    return fs.existsSync(

        getFile(provider)

    );

}

function remove(provider) {

    const file = getFile(provider);

    if (fs.existsSync(file)) {

        fs.unlinkSync(file);

    }

}

module.exports = {

    save,

    load,

    exists,

    remove

};
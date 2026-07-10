const fs = require("fs");
const path = require("path");

function archive(campaign, status = "published") {

    if (!campaign.__file) {
        throw new Error("campaign.__file não definido.");
    }

    const destinationDir = path.join(
        __dirname,
        "..",
        "..",
        "campaigns",
        status
    );

    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }

    const destination = path.join(
        destinationDir,
        path.basename(campaign.__file)
    );

    fs.renameSync(campaign.__file, destination);

    return destination;

}

module.exports = {
    archive
};
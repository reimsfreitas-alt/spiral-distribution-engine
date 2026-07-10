const fs = require("fs");
const path = require("path");

function check(title, target) {

    const ok = fs.existsSync(target);

    console.log(
        `${ok ? "✅" : "❌"} ${title}`
    );

    return ok;
}

function runDoctor() {

    console.clear();

    console.log("");
    console.log("========================================");
    console.log("         SPIRAL OS DOCTOR");
    console.log("========================================");
    console.log("");

    const root = path.join(__dirname, "..");

    const results = [];

    results.push(
        check(
            "Campaigns",
            path.join(root, "campaigns")
        )
    );

    results.push(
        check(
            "Campaign Queue",
            path.join(root, "campaigns", "ready")
        )
    );

    results.push(
        check(
            "Published Folder",
            path.join(root, "campaigns", "published")
        )
    );

    results.push(
        check(
            "Kernel",
            path.join(__dirname, "core", "kernel")
        )
    );

    results.push(
        check(
            "Channels",
            path.join(__dirname, "channels")
        )
    );

    results.push(
        check(
            "Providers",
            path.join(__dirname, "providers")
        )
    );

    console.log("");

    if (results.every(Boolean)) {

        console.log("🟢 SYSTEM HEALTHY");

    } else {

        console.log("🔴 PROBLEMAS ENCONTRADOS");

    }

    console.log("");
}

module.exports = runDoctor;
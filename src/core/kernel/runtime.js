const boot = require("./boot");

function startKernel() {

    console.log("");
    console.log("========================================");
    console.log("          SPIRAL OS KERNEL");
    console.log("========================================");

    const ok = boot();

    if (ok) {
        console.log("✅ Distribution Engine Connected.");
    } else {
        console.log("❌ Kernel Boot Failed.");
    }

    console.log("");

    return ok;
}

module.exports = startKernel;
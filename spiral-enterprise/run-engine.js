require('dotenv').config();

const Ledger = require("../src/core/kernel/ledger");
const DecisionBus = require("../src/core/kernel/decisionBus");
const GmailDriver = require("../src/core/drivers/gmail");

async function run() {
    const ledger = new Ledger();
    const bus = new DecisionBus(ledger, { publicKey: "TEST_KEY" });

    const driver = new GmailDriver({
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    });
    
    bus.registerDriver(driver);

    const intent = {
        decision_id: "SW-2026-07-01",
        to: "reimsfreitas@gmail.com",
        subject: "Teste Spiral",
        content: "Teste de envio."
    };

    try {
        const resultado = await bus.submit(intent, "SIGNATURE_TEST");
        console.log(resultado);
    } catch (err) {
        console.error(err.message);
    } finally {
        ledger.close();
    }
}

run();
"use strict";

class DecisionBus {
    constructor(ledger, config = {}) {
        this.ledger = ledger;
        this.publicKey = config.publicKey;
        this.drivers = new Map();
        this.inFlight = new Set();
    }

    registerDriver(driver) {
        this.drivers.set(driver.constructor.name, driver);
    }

    async submit(intent, signature) {
        if (this.inFlight.has(intent.decision_id)) {
            throw new Error("IDEMPOTENCY_LOCK_ACTIVE");
        }
        
        this.inFlight.add(intent.decision_id);

        try {
            const entry = await this.ledger.log(intent, "PENDING");
            
            const driver = this.drivers.values().next().value;
            if (!driver) throw new Error("NO_DRIVER_REGISTERED");

            const result = await driver.run({ intent, signature });

            const finalEntry = await this.ledger.log({
                ...intent,
                external_id: result.external_id,
                status: "EXECUTED"
            });

            return finalEntry;
        } catch (err) {
            throw err;
        } finally {
            this.inFlight.delete(intent.decision_id);
        }
    }
}

module.exports = DecisionBus;
/**
 * ========================================
 * SPIRAL OS
 * Worker Contract v1.0
 * ========================================
 *
 * Todo Worker da Spiral OS deve implementar:
 *
 * boot(context)
 * run(context)
 * shutdown(context)
 *
 * Opcional:
 *
 * health()
 * version()
 * name()
 *
 * ========================================
 */

class WorkerContract {

    boot(context) {
        throw new Error("boot() não implementado.");
    }

    async run(context) {
        throw new Error("run() não implementado.");
    }

    shutdown(context) {
        throw new Error("shutdown() não implementado.");
    }

    health() {
        return {
            status: "unknown"
        };
    }

    version() {
        return "1.0.0";
    }

    name() {
        return this.constructor.name;
    }

}

module.exports = WorkerContract;
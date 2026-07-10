"use strict";

const WorkerContract = require("../contracts/workercontract.js");

class GmailDriver extends WorkerContract {
    constructor(deps = {}) {
        super();
        this.user = deps.user || process.env.GMAIL_USER || null;
        this.pass = deps.pass || process.env.GMAIL_APP_PASSWORD || null;
        this._nodemailer = deps.nodemailer || require("nodemailer");
        this._transport = deps.transport || null;
    }

    boot(context) {
        return this._getTransport();
    }

    async run(context) {
        return await this._publish(context.intent);
    }

    shutdown(context) {
        this._transport = null;
    }

    _getTransport() {
        if (this._transport) return this._transport;
        if (!this.user || !this.pass) throw new Error("CREDENTIALS_MISSING");
        this._transport = this._nodemailer.createTransport({
            service: "gmail",
            auth: { user: this.user, pass: this.pass }
        });
        return this._transport;
    }

    async _publish(intent) {
        const transport = this._getTransport();
        const msg = {
            from: this.user,
            to: intent.to,
            subject: intent.subject || "Spiral Update",
            text: intent.content
        };
        const info = await transport.sendMail(msg);
        return { external_id: `gmail:${info.messageId}` };
    }
}

module.exports = GmailDriver;
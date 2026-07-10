class EventPayload {
    constructor(data) { Object.assign(this, data); }
    validate() { 
        if (!this.decision_id || !this.state) throw new Error("Payload Inválido");
        return true; 
    }
}
module.exports = EventPayload;
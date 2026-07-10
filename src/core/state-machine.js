const STATES = Object.freeze({
    PENDING_AUTH: "PENDING_AUTH", VALIDATED: "VALIDATED", REJECTED: "REJECTED",
    DISPATCHED: "DISPATCHED", EXECUTED: "EXECUTED", FAILED: "FAILED",
    AUDITED: "AUDITED", CLOSED: "CLOSED"
});

function can_transition(source, target, has_sig = false) {
    const rules = {
        [STATES.PENDING_AUTH]: [STATES.VALIDATED, STATES.REJECTED],
        [STATES.VALIDATED]: [STATES.DISPATCHED],
        [STATES.DISPATCHED]: [STATES.EXECUTED, STATES.FAILED],
        [STATES.EXECUTED]: [STATES.AUDITED],
        [STATES.FAILED]: [STATES.AUDITED],
        [STATES.AUDITED]: [STATES.CLOSED]
    };
    
    if (source === STATES.PENDING_AUTH && target === STATES.VALIDATED && !has_sig) 
        return { allowed: false, message: "Assinatura obrigatória" };

    const allowed = rules[source] && rules[source].includes(target);
    return allowed ? { allowed: true } : { allowed: false, message: "Violação de Fluxo" };
}

module.exports = { STATES, can_transition };
module.exports = {
    sign: (intent, privKey) => {
        return "SIG_" + Buffer.from(intent.decision_id).toString('base64');
    }
};
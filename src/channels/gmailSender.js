const { google } = require("googleapis");

async function sendEmail(auth, { to, subject, text }) {

    const gmail = google.gmail({
        version: "v1",
        auth
    });

    const email = [
        `To: ${to}`,
        "Content-Type: text/plain; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${subject}`,
        "",
        text
    ].join("\n");

    const encodedMessage = Buffer
        .from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });

    console.log("====================================");
    console.log("EMAIL ENVIADO COM SUCESSO");
    console.log("====================================");
    console.log(result.data.id);

    return result.data;
}

module.exports = sendEmail;
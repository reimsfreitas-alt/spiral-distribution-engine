const { google } = require("googleapis");
const { authorize } = require("./src/channels/gmail");
const sendEmail = require("./src/channels/gmailSender");

(async () => {

    const auth = await authorize();
    await auth.getRequestHeaders().then(console.log);	

    console.log("CLIENT TYPE:", auth.constructor.name);

    const token = await auth.getAccessToken();

    console.log("TOKEN:");
    console.log(token);

    await sendEmail(auth, {
        to: "reimsfreitas@gmail.com",
        subject: "Teste Gmail API",
        text: "Funcionou!"
    });

})();

"use strict";

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const PAGE_ID = "1256709417514738";

const ACCESS_TOKEN = "EAASZBw8yjfRwBR5bi0y9kNbP1PJ3jH3IhDyVwiBJ58slHEZBfp5EFhHWzZCbWjIPkCmcDYKSE34iC9lthvct2OfQuU5wKd259jxJ8BuHoqVV0bzonFuQcmPtk8fACQIHZAkOnZBxfQ3IWUPjGBUE4PjkPrOvZBp8Dvf0iC3vbUR9Xj6gLuleHSZBPwrFTlcuoE3REelsMypXIarXZBtjudcqfQsAPk2BwQv1OzJOBfl7opRw5DeGN8tzxK1RZCrx1cFndIowZCwAOZB6iJpG7wKcXFRf9sM78eUWfIx1zh3R74vZBnLnTeD9lqy8Umr1Ll8W9ggEpZAavScIY4WLZCQQZDZD";

const IMAGE = path.join(__dirname, "assets", "SpiralWealth.png");

async function publish() {

    const form = new FormData();

    form.append("message",
`A maioria das pessoas acredita que problemas financeiros começam no dinheiro.

Nós acreditamos que eles começam nas decisões.

Spiral Codes.

#SpiralCodes #SpiralWealth`);

    form.append("source", fs.createReadStream(IMAGE));

    form.append("access_token", ACCESS_TOKEN);

    const url = `https://graph.facebook.com/v25.0/${PAGE_ID}/photos`;

    const response = await axios.post(
        url,
        form,
        {
            headers: form.getHeaders()
        }
    );

    console.log(response.data);
}

publish().catch(console.error);
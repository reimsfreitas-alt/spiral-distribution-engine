const http = require("http");
const { URL } = require("url");

function waitForAuthorizationCode(port = 3000) {

    return new Promise((resolve) => {

        const server = http.createServer((req, res) => {

            const url = new URL(req.url, `http://localhost:${port}`);

            if (url.pathname !== "/linkedin/callback") {

                res.writeHead(404);

                res.end();

                return;

            }

            const code = url.searchParams.get("code");

            const state = url.searchParams.get("state");

            res.writeHead(200, {

                "Content-Type": "text/html"

            });

            res.end(`

<h2>LinkedIn autenticado com sucesso.</h2>

Pode fechar esta janela.

`);

            server.close();

            resolve({

                code,

                state

            });

        });

        server.listen(port);

    });

}

module.exports = {

    waitForAuthorizationCode

};
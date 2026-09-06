const http = require("http");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = Number(process.env.PORT) || 10000;

const players = new Map();

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === "/") {
        res.writeHead(200);
        res.end(JSON.stringify({
            game: "Bomb City",
            status: "online",
            players: players.size
        }));
        return;
    }

    if (req.method === "GET" && req.url === "/players") {
        res.writeHead(200);
        res.end(JSON.stringify(
            Array.from(players.entries()).map(([name, data]) => ({
                name: name,
                coins: data.coins
            }))
        ));
        return;
    }

    if (req.method === "POST" && req.url === "/players") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const name = String(data.name || "").trim();

                if (!name) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: "Name is required"
                    }));
                    return;
                }

                players.set(name, {
                    coins: 0
                });

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    name: name,
                    coins: 0
                }));
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));
            }
        });

        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({
        error: "Not found"
    }));
});

const wss = new WebSocketServer({
    server: server
});

wss.on("connection", (ws) => {

    console.log("WebSocket player connected");

    ws.send(JSON.stringify({
        type: "connected",
        message: "Bomb City online"
    }));

    ws.on("message", (raw) => {

        try {

            const data = JSON.parse(
                raw.toString()
            );

            if (data.type === "message") {

                const name = String(
                    data.name || ""
                ).trim();

                const text = String(
                    data.text || ""
                ).trim();

                if (!name || !text) {
                    return;
                }

                const payload = JSON.stringify({
                    type: "message",
                    name: name,
                    text: text
                });

                wss.clients.forEach((client) => {

                    if (
                        client.readyState
                        === WebSocket.OPEN
                    ) {
                        client.send(payload);
                    }

                });
            }

        } catch (e) {

            console.log(
                "Invalid WebSocket message"
            );

        }

    });

    ws.on("close", () => {

        console.log(
            "WebSocket player disconnected"
        );

    });

});

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Bomb City server running on port ${PORT}`
        );

    }
);

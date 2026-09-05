const http = require("http");

const PORT = Number(process.env.PORT) || 10000;

const players = new Map();

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.url === "/") {
        res.writeHead(200);
        res.end(JSON.stringify({
            game: "Bomb City",
            status: "online",
            players: players.size
        }));
        return;
    }

    if (req.url === "/players") {
        res.writeHead(200);
        res.end(JSON.stringify(
            Array.from(players.entries()).map(([name, data]) => ({
                name: name,
                coins: data.coins
            }))
        ));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({
        error: "Not found"
    }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Bomb City server running on port ${PORT}`);
});

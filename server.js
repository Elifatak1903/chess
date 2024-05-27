const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

///////

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("Received message:", data);
    if (data.type === "move") {
      handlePlayerMove2(data.move);
    }
    if (data.type === "message") {
      handleSendMessageToAllPlayer(data.message);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
function handleSendMessageToAllPlayer(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log("Broadcasting message:", message);
      client.send(
        JSON.stringify({
          type: "message",
          message: message,
        })
      );
    }
  });
}
function handlePlayerMove2(move) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log("Broadcasting move:", move);
      client.send(
        JSON.stringify({
          type: "move",
          move: move,
        })
      );
    }
  });
}

/////////

let waitingPlayer = null;
const games = new Map();

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      handlePlayerJoin(ws);
    } else if (data.type === "move") {
      handlePlayerMove(ws, data.move);
    }
  });

  ws.on("close", () => {
    handlePlayerDisconnect(ws);
  });
});

function handlePlayerJoin(ws) {
  if (waitingPlayer) {
    const gameId = generateGameId();
    const game = {
      gameId,
      players: [waitingPlayer, ws],
      status: "ongoing",
      moves: [],
    };

    games.set(gameId, game);

    waitingPlayer = null;

    game.players.forEach((player, index) => {
      player.send(
        JSON.stringify({
          type: "start",
          color: index === 0 ? "white" : "black",
          gameId: gameId,
        })
      );
    });
  } else {
    waitingPlayer = ws;
    ws.send(JSON.stringify({ type: "waiting" }));
  }
}

function handlePlayerMove(ws, move) {
  const game = Array.from(games.values()).find((g) => g.players.includes(ws));
  if (game) {
    game.moves.push(move);
    game.players.forEach((player) => {
      player.send(
        JSON.stringify({
          type: "move",
          move: move,
        })
      );
    });
    checkGameStatus(game);
  }
}

function checkGameStatus(game) {
  // Here you can implement the logic to check game status (e.g., checkmate, draw)
}

function handlePlayerDisconnect(ws) {
  const game = Array.from(games.values()).find((g) => g.players.includes(ws));
  if (game) {
    game.players.forEach((player) => {
      if (player !== ws) {
        player.send(JSON.stringify({ type: "opponentDisconnected" }));
      }
    });
    games.delete(game.gameId);
  } else if (waitingPlayer === ws) {
    waitingPlayer = null;
  }
}

function generateGameId() {
  return Math.random().toString(36).substr(2, 9);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
//hhhhhhh

const ws = new WebSocket("ws://localhost:3000");

let gameId;
let playerColor;

const statusElement = document.getElementById("status");

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "join" }));
};

ws.onmessage = (message) => {
  const data = JSON.parse(message.data);

  if (data.type === "waiting") {
    statusElement.innerText = "Waiting for an opponent...";
  } else if (data.type === "start") {
    gameId = data.gameId;
    playerColor = data.color;
    statusElement.innerText = `Game started! You are playing as ${playerColor}.`;
  } else if (data.type === "move") {
  } else if (data.type === "gameOver") {
    statusElement.innerText = `Game over: ${data.status}`;
  } else if (data.type === "invalidMove") {
    statusElement.innerText = "Invalid move. Please try again.";
  } else if (data.type === "opponentDisconnected") {
    statusElement.innerText = "Your opponent has disconnected.";
  }
};

//
document.addEventListener("DOMContentLoaded", () => {
  const socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "chat") {
      displayChatMessage(data.message);
    }
  });

  // const chatInput = document.getElementById('chatInput');
  // const chatForm = document.getElementById('chatForm');

  // chatForm.addEventListener('submit', (event) => {
  //     event.preventDefault();
  //     const message = chatInput.value;

  //     if (message) {
  //         socket.send(JSON.stringify({ type: 'chat', message: message }));
  //         chatInput.value = '';
  //     }
  // });

  function displayChatMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
  }
});

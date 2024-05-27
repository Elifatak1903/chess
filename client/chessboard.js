document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chat-input");
  const chatBox = document.getElementById("chatbox");
  const chatSendButton = document.getElementById("chat-send-button");
  const chessboard = document.getElementById("chessboard");
  let doNotAdd = false;
  const initialBoard = [
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ];
  const messages = [];
  const socket = new WebSocket("ws://localhost:3000");
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log("Received message from server:", data);

    if (data.type === "move") {
      updateChessboard(data.move);
    }
    console.log("data");
    console.log(data);
    if (data.type === "message") {
      console.log("entered to messag et");
      if (!doNotAdd) {
        messages.push({
          source: "other",
          message: data.message,
        });
      }
      doNotAdd = false;
      updateChatBox();
    }
  });

  chatSendButton.addEventListener("click", (e) => {
    const inputValue = chatInput.value;
    console.log(inputValue);
    doNotAdd = true;
    if (!!inputValue) {
      socket.send(
        JSON.stringify({
          type: "message",
          message: inputValue,
        })
      );
      messages.push({
        source: "me",
        message: inputValue,
      });
      inputValue.value = "";
      updateChatBox();
    }
  });

  function updateChatBox() {
    chatBox.innerHTML = "";
    messages.forEach((el) => {
      const p = document.createElement("p");
      p.innerHTML = el.message;
      chatBox.appendChild(p);
    });
  }
  function createChessboard() {
    chessboard.innerHTML = ""; // Clear existing chessboard
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.dataset.row = row;
        square.dataset.col = col;
        if ((row + col) % 2 === 0) {
          square.classList.add("white");
        } else {
          square.classList.add("black");
        }

        const piece = initialBoard[row][col];
        if (piece) {
          const pieceElement = document.createElement("span");
          pieceElement.classList.add("piece");
          pieceElement.textContent = piece;
          pieceElement.draggable = true;
          pieceElement.addEventListener("dragstart", handleDragStart);
          square.appendChild(pieceElement);
        }

        square.addEventListener("dragover", handleDragOver);
        square.addEventListener("drop", handleDrop);

        chessboard.appendChild(square);
      }
    }
  }

  function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.textContent);
    event.dataTransfer.setData(
      "source",
      JSON.stringify({
        row: event.target.parentElement.dataset.row,
        col: event.target.parentElement.dataset.col,
      })
    );
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const piece = event.dataTransfer.getData("text/plain");
    const source = JSON.parse(event.dataTransfer.getData("source"));
    const target = event.target.closest(".square");

    // Remove piece from source square
    const sourceSquare = document.querySelector(
      `.square[data-row="${source.row}"][data-col="${source.col}"]`
    );
    sourceSquare.innerHTML = "";

    // Add piece to target square
    const pieceElement = document.createElement("span");
    pieceElement.classList.add("piece");
    pieceElement.textContent = piece;
    pieceElement.draggable = true;
    pieceElement.addEventListener("dragstart", handleDragStart);
    target.appendChild(pieceElement);

    // Send the update to the server
    const move = {
      piece: piece,
      source: source,
      target: { row: target.dataset.row, col: target.dataset.col },
    };
    console.log("Sending move to server:", move);
    socket.send(JSON.stringify({ type: "move", move: move }));
  }

  function updateChessboard(move) {
    console.log("Updating chessboard with move:", move);

    // Remove piece from source square
    const sourceSquare = document.querySelector(
      `.square[data-row="${move.source.row}"][data-col="${move.source.col}"]`
    );
    sourceSquare.innerHTML = "";

    // Add piece to target square
    const targetSquare = document.querySelector(
      `.square[data-row="${move.target.row}"][data-col="${move.target.col}"]`
    );
    const pieceElement = document.createElement("span");
    pieceElement.classList.add("piece");
    pieceElement.textContent = move.piece;
    pieceElement.draggable = true;
    pieceElement.addEventListener("dragstart", handleDragStart);
    targetSquare.appendChild(pieceElement);
  }

  createChessboard();
});
/////5

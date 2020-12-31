const mainPage = document.getElementById("main-page");
const gamePage = document.getElementById("game-page");
const createGameButton = document.getElementById("new-button");
const playerOne = document.getElementById("new-game-playername");
const joinGameButton = document.getElementById("join-button");
const gameIdField = document.getElementById("game-id-field");
const playerTwo = document.getElementById("join-game-playername");
const playerOneName = document.getElementById("player-one-name");
const playerTwoName = document.getElementById("player-two-name");
const gameId = document.getElementById("game-id");

const socket = io();

createGameButton.addEventListener("click", handleCreateGame);
joinGameButton.addEventListener("click", handleJoinGame);

gamePage.style.display = "none";

function handleCreateGame(e) {
	e.preventDefault();
	if (!playerOne.value) return;
	mainPage.style.display = "none";
	gamePage.style.display = "grid";
	playerOneName.innerText = playerOne.value;
	playerTwoName.innerText = "Waiting...";
	socket.emit("newGame", playerOne.value);
}

function handleJoinGame(e) {
	e.preventDefault();
	if (!playerTwo.value || !gameIdField.value) return;
	mainPage.style.display = "none";
	gamePage.style.display = "grid";
	gameId.style.display = "none";

	socket.emit("joinGame", gameIdField.value, playerTwo.value);
}
const cells = document.querySelectorAll(".cell");
cells.forEach((cell) => cell.addEventListener("click", handleClick));

function handleClick(e) {
	// const [a, b] = JSON.parse(e.target.id);
	// console.log(a, b);
	if (e.target.innerText) return;
	socket.emit("clicked", e.target.id);
}
console.log("cells", cells);
socket.on("update", (id, currentPlayer) => {
	// cells[id - 1].innerText = "X";
	Array.from(cells).find((x) => x.id === id).innerText = currentPlayer;
});

socket.on("gameCode", (code) => {
	// document.querySelector("#title").innerText = `joined game ${code}`;
	gameId.innerText = `Game ID: ${code}`;
});

socket.on("playerName", (name) => {
	p.innerText = `${name} vs `;
});

socket.on("playerNames", (one, two) => {
	playerOneName.innerText = one;
	playerTwoName.innerText = two;
	gameId.style.display = "none";
});

socket.on("currentPlayer", (player) => {
	if (player === "X") {
		document.getElementById("player-one").style.color = "red";
		document.getElementById("player-two").style.color = "black";
	} else {
		document.getElementById("player-one").style.color = "black";
		document.getElementById("player-two").style.color = "red";
	}
});

socket.on("winner", (winner) => {
	document.getElementById("player-one").style.color = "black";
	document.getElementById("player-two").style.color = "black";
	const winnerName =
		winner === "X" ? playerOneName.innerText : playerTwoName.innerText;
	gameId.style.display = "grid";
	gameId.innerText = `${winnerName} wins!`;
});

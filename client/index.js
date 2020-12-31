const mainPage = document.getElementById("main-page");
const gamePage = document.getElementById("game-page");
const createGameButton = document.getElementById("new-button");
const playerOneName = document.getElementById("new-game-playername");
const joinGameButton = document.getElementById("join-button");
const gameIdField = document.getElementById("game-id-field");
const playerTwoName = document.getElementById("join-game-playername");
const playerOne = document.getElementById("player-one-name");
const playerTwo = document.getElementById("player-two-name");
const messageField = document.getElementById("message");
const cells = document.querySelectorAll(".cell");

const socket = io();

createGameButton.addEventListener("click", handleCreateGame);
joinGameButton.addEventListener("click", handleJoinGame);
cells.forEach((cell) => cell.addEventListener("click", handleClick));

gamePage.style.display = "none";

function handleCreateGame(e) {
	e.preventDefault();
	if (!playerOneName.value) return;
	mainPage.style.display = "none";
	gamePage.style.display = "grid";
	playerOne.innerText = playerOneName.value;
	playerTwo.innerText = "Waiting...";
	socket.emit("newgame", playerOneName.value);
}

function handleJoinGame(e) {
	e.preventDefault();
	if (!playerTwoName.value || !gameIdField.value) return;
	mainPage.style.display = "none";
	gamePage.style.display = "grid";
	messageField.style.display = "none";
	socket.emit("joingame", gameIdField.value, playerTwoName.value);
}

function handleClick(e) {
	if (e.target.innerText) return;
	socket.emit("cellclick", e.target.id);
}

socket.on("updatecell", (cellId, playerLetter) => {
	Array.from(cells).find(
		(cell) => cell.id === cellId
	).innerText = playerLetter;
});

socket.on("gameid", (code) => {
	messageField.innerText = `Game ID: ${code}`;
});

socket.on("playernames", (p1, p2) => {
	playerOne.innerText = p1;
	playerTwo.innerText = p2;
	messageField.style.display = "none";
});

socket.on("currentplayer", (playerLetter) => {
	if (playerLetter === "X") {
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
		winner === "X" ? playerOne.innerText : playerTwo.innerText;
	messageField.style.display = "grid";
	messageField.innerText = `${winnerName} wins!`;
});

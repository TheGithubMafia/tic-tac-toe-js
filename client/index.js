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
	socket.emit("newgame", playerOne.value);
}

function handleJoinGame(e) {
	e.preventDefault();
	if (!playerTwo.value || !gameIdField.value) return;
	mainPage.style.display = "none";
	gamePage.style.display = "grid";
	gameId.style.display = "none";

	socket.emit("joingame", gameIdField.value, playerTwo.value);
}
const cells = document.querySelectorAll(".cell");
cells.forEach((cell) => cell.addEventListener("click", handleClick));

function handleClick(e) {
	// const [a, b] = JSON.parse(e.target.id);
	// console.log(a, b);
	if (e.target.innerText) return;
	socket.emit("cellclick", e.target.id);
}

socket.on("updatecell", (cellId, playerLetter) => {
	Array.from(cells).find(
		(cell) => cell.id === cellId
	).innerText = playerLetter;
});

socket.on("gameid", (code) => {
	// document.querySelector("#title").innerText = `joined game ${code}`;
	gameId.innerText = `Game ID: ${code}`;
});

socket.on("playernames", (playerOne, playerTwo) => {
	playerOneName.innerText = playerOne;
	playerTwoName.innerText = playerTwo;
	gameId.style.display = "none";
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
		winner === "X" ? playerOneName.innerText : playerTwoName.innerText;
	gameId.style.display = "grid";
	gameId.innerText = `${winnerName} wins!`;
});

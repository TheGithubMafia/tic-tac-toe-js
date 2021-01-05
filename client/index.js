const mainPage = document.getElementById("main-page");
const gamePage = document.getElementById("game-page");
const createGameButton = document.getElementById("new-button");
const playerOneName = document.getElementById("new-game-playername");
const joinGameButton = document.getElementById("join-button");
const gameIdField = document.getElementById("game-id-field");
const playerTwoName = document.getElementById("join-game-playername");
const playerOne = document.getElementById("player-one-name");
const playerTwo = document.getElementById("player-two-name");
const textField = document.getElementById("text-field");
const newGameButton = document.getElementById("new-game");
const cells = document.querySelectorAll(".cell");
const statusOne = document.getElementById("status-one");
const statusTwo = document.getElementById("status-two");
let gamesList = [];

const socket = io();

createGameButton.addEventListener("click", handleCreateGame);
joinGameButton.addEventListener("click", handleJoinGame);
cells.forEach((cell) => cell.addEventListener("click", handleClick));
newGameButton.addEventListener("click", handleNewGame);

gamePage.style.display = "none";
newGameButton.style.display = "none";

function handleCreateGame(e) {
	e.preventDefault();
	if (!playerOneName.value) {
		alert("Please enter your name");
		return;
	}
	mainPage.style.display = "none";
	gamePage.style.display = "grid";
	playerOne.innerText = playerOneName.value;
	statusOne.style.backgroundColor = "lime";
	playerTwo.innerText = "Waiting...";
	statusTwo.style.backgroundColor = "grey";
	socket.emit("newgame", playerOneName.value);
}

function handleJoinGame(e) {
	e.preventDefault();
	if (!playerTwoName.value || !gameIdField.value) {
		alert("Game ID and player name fields are required");
		return;
	}

	if (!gamesList.includes(gameIdField.value)) {
		alert("Invalid game ID");
		return;
	}
	mainPage.style.display = "none";
	gamePage.style.display = "grid";
	textField.style.display = "none";
	statusTwo.style.backgroundColor = "lime";
	socket.emit("joingame", gameIdField.value, playerTwoName.value);
}

function handleClick(e) {
	if (e.target.innerText) return;
	socket.emit("cellclick", e.target.id);
}

function handleNewGame() {
	newGameButton.style.display = "none";
	socket.emit("replay", sessionStorage.getItem("playerLetter"));
}

socket.on("games", (games) => {
	gamesList = games;
});

socket.on("updatecell", (cellId, playerLetter) => {
	Array.from(cells).find(
		(cell) => cell.id === cellId
	).innerText = playerLetter;
});

socket.on("gameid", (id) => {
	textField.innerText = `Game ID: ${id}`;
});

socket.on("playerletter", (letter) => {
	sessionStorage.setItem("playerLetter", letter);
});

socket.on("playernames", (p1, p2) => {
	playerOne.innerText = p1;
	playerTwo.innerText = p2;
	textField.style.display = "none";
	statusOne.style.backgroundColor = "lime";
	statusTwo.style.backgroundColor = "lime";
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

socket.on("gameover", (winner) => {
	document.getElementById("player-one").style.color = "black";
	document.getElementById("player-two").style.color = "black";
	newGameButton.style.display = "block";
	textField.style.display = "block";
	if (winner === "X") {
		textField.innerText = `${playerOne.innerText} wins!`;
	} else if (winner === "O") {
		textField.innerText = `${playerTwo.innerText} wins!`;
	} else {
		textField.innerText = winner;
	}
});

socket.on("restartgame", () => {
	textField.style.display = "none";
	newGameButton.style.display = "none";
	cells.forEach((cell) => (cell.innerText = ""));
});

socket.on("offline", (letter) => {
	if (letter === "X") {
		statusOne.style.backgroundColor = "grey";
	} else {
		statusTwo.style.backgroundColor = "grey";
	}
	cells.forEach((cell) => cell.removeEventListener("click", handleClick));
	newGameButton.removeEventListener("click", handleNewGame);
	document.getElementById("player-one").style.color = "black";
	document.getElementById("player-two").style.color = "black";
});

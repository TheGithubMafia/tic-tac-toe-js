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

const socket = io();

createGameButton.addEventListener("click", handleCreateGame);
joinGameButton.addEventListener("click", handleJoinGame);
cells.forEach((cell) => cell.addEventListener("click", handleClick));
newGameButton.addEventListener("click", handleNewGame);

gamePage.style.display = "none";
newGameButton.style.display = "none";

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
	textField.style.display = "none";
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
	let winnerName;
	if (winner === "X") {
		winnerName = playerOne.innerText;
		newGameButton.style.display = "block";
		textField.style.display = "block";
		textField.innerText = `${winnerName} wins!`;
	} else if (winner === "O") {
		winnerName = playerTwo.innerText;
		newGameButton.style.display = "block";
		textField.style.display = "block";
		textField.innerText = `${winnerName} wins!`;
	} else {
		newGameButton.style.display = "block";
		textField.style.display = "block";
		textField.innerText = winner;
	}
});

socket.on("restartgame", () => {
	textField.style.display = "none";
	newGameButton.style.display = "none";
	cells.forEach((cell) => (cell.innerText = ""));
});

socket.on("offline", (letter) => {
	if (letter === playerOne.innerText) {
		playerOne.innerText = "Offline";
	} else {
		playerTwo.innerText = "Offline";
	}
	cells.forEach((cell) => cell.removeEventListener("click", handleClick));
	newGameButton.removeEventListener("click", handleNewGame);
});

const socket = io();
const joinGameButton = document.getElementById("join");
const createGameButton = document.getElementById("create");
const gameId = document.getElementById('game-id');
const playerOne = document.getElementById('new-game-playername');
const playerTwo = document.getElementById('join-game-playername');
createGameButton.addEventListener("click", handleCreateGame);
joinGameButton.addEventListener("click", handleJoinGame);
const p = document.querySelector('p');


function handleCreateGame(e) {
	e.preventDefault();
	socket.emit("newGame", playerOne.value);
}

function handleJoinGame(e) {
	e.preventDefault();
	socket.emit("joinGame", gameId.value, playerTwo.value);
}
// socket.on('connection')
const cells = document.querySelectorAll(".cell");
cells.forEach((cell) => cell.addEventListener("click", handleClick));

function handleClick(e) {
	// const [a, b] = JSON.parse(e.target.id);
	// console.log(a, b);
	socket.emit("clicked", e.target.id);
}
console.log("cells", cells);
socket.on("update", (id, currentPlayer) => {
	// cells[id - 1].innerText = "X";
	Array.from(cells).find((x) => x.id === id).innerText = currentPlayer;
});

socket.on("gameCode", (code) => {
	document.querySelector("#title").innerText = `joined game ${code}`;
});

socket.on('playerName', (name) => {
	p.innerText = `${name} vs `
});

socket.on('playerNames', (one, two) => {
	p.innerText = `${one} vs ${two}`;
});
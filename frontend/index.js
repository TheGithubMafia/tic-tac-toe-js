const socket = io();
const joinGameButton = document.getElementById("join");
const createGameButton = document.getElementById("create");

createGameButton.addEventListener("click", handleCreateGame);
joinGameButton.addEventListener("click", handleJoinGame);

function handleCreateGame(e) {
	socket.emit("newGame");
}

function handleJoinGame(e) {
	e.preventDefault();
	console.log(document.querySelector("input").value);
	socket.emit("joinGame", document.querySelector("input").value);
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

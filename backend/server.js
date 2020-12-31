const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname, "/../frontend")));
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/../frontend/index.html"));
});
const rooms = {};
const state = {};

function findWinner(grid) {
	const [rowOne, rowTwo, rowThree] = grid;
	const colOne = [rowOne[0], rowTwo[0], rowThree[0]];
	const colTwo = [rowOne[1], rowTwo[1], rowThree[1]];
	const colThree = [rowOne[2], rowTwo[2], rowThree[2]];
	const diagonalOne = [rowOne[0], rowTwo[1], rowThree[2]];
	const diagonalTwo = [rowOne[2], rowTwo[1], rowThree[0]];

	if (
		rowOne.every((item) => item === "X") ||
		rowTwo.every((item) => item === "X") ||
		rowThree.every((item) => item === "X") ||
		colOne.every((item) => item === "X") ||
		colTwo.every((item) => item === "X") ||
		colThree.every((item) => item === "X") ||
		diagonalOne.every((item) => item === "X") ||
		diagonalTwo.every((item) => item === "X")
	) {
		return "X";
	} else if (
		rowOne.every((item) => item === "O") ||
		rowTwo.every((item) => item === "O") ||
		rowThree.every((item) => item === "O") ||
		colOne.every((item) => item === "O") ||
		colTwo.every((item) => item === "O") ||
		colThree.every((item) => item === "O") ||
		diagonalOne.every((item) => item === "O") ||
		diagonalTwo.every((item) => item === "O")
	) {
		return "O";
	} else {
		return false;
	}
}

io.on("connection", (client) => {
	client.on("clicked", (id) => {
		id = JSON.parse(id);
		const [x, y] = id;
		if (state[client.code].hasBeenWon) return;
		if (client.player === state[client.code].currentPlayer) {
			state[client.code][x][y] = client.player;
			io.to(client.code).emit("update", `[${x}, ${y}]`, client.player);
			if (
				rooms[client.code][0].player ===
				state[client.code].currentPlayer
			) {
				state[client.code].currentPlayer = rooms[client.code][1].player;
			} else {
				state[client.code].currentPlayer = rooms[client.code][0].player;
			}

			if (findWinner(state[client.code])) {
				io.to(client.code).emit(
					"winner",
					findWinner(state[client.code])
				);
				state[client.code].hasBeenWon = true;
			} else {
				io.to(client.code).emit(
					"currentPlayer",
					state[client.code].currentPlayer
				);
			}
		}

		// console.log(state[`${client.code}`][x][y]);
		// state[client.code][id - 1] = "X";
		// console.log(state[client.code]);
		// console.log(state[client.code][0]);
		console.log(state[client.code]);
	});
	client.on("newGame", (playerOne) => {
		const code = String(Math.round(Math.random() * 1000000));
		client.name = playerOne;
		client.join(code);
		client.player = "X";
		console.log(rooms);
		state[code] = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];

		// state[code].currentPlayer = client.id;
		console.log("current clientID", client.id);
		// ensure user hasn't joined other rooms
		client.code = code;
		client.emit("gameCode", code);
		state[code].playerOneName = playerOne;
		client.emit("playerName", playerOne);
		console.log(state[code]);
		rooms[code] = [client];
	});
	client.on("joinGame", (code, playerTwo) => {
		if (rooms[code].length === 2) return;
		// ensure room doesn't have more than 2 players
		client.join(code);
		console.log(rooms);
		client.code = code;
		client.name = playerTwo;
		state[code].playerTwoName = playerTwo;
		io.to(code).emit("playerNames", state[code].playerOneName, playerTwo);
		client.player = "O";
		state[code].currentPlayer = rooms[client.code][0].player;
		io.to(code).emit("currentPlayer", state[code].currentPlayer);
		rooms[code].push(client);
		client.emit("gameCode", code);
	});
});

server.listen(3000);

/* 
close connections and delete resources when connection is closed

determine winner after each move

refactor
*/

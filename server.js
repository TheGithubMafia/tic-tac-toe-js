const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;
const { generateId } = require("./utils.js");

const games = {};
const boardState = {};

app.use(express.static(path.join(__dirname, "./client")));

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
	client.on("newgame", (playerName) => {
		const gameId = generateId();
		client.join(gameId);
		client.playerLetter = "X";
		client.gameId = gameId;
		// initial board state for new game
		boardState[gameId] = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];
		boardState[gameId].playerOneName = playerName;
		games[gameId] = [client];
		client.emit("gameid", gameId);
		client.emit("playerletter", client.playerLetter);
	});

	client.on("joingame", (gameId, playerName) => {
		// ensure no more than 2 players can join a game
		if (games[gameId].length === 2) return;

		client.join(gameId);
		client.playerLetter = "O";
		client.gameId = gameId;
		boardState[gameId].playerTwoName = playerName;
		boardState[gameId].currentPlayer = games[client.gameId][0].playerLetter;
		games[gameId].push(client);
		io.to(gameId).emit(
			"playernames",
			boardState[gameId].playerOneName,
			playerName
		);
		client.emit("playerletter", client.playerLetter);
		io.to(gameId).emit("currentplayer", boardState[gameId].currentPlayer);
	});

	client.on("cellclick", (cellId) => {
		const [x, y] = JSON.parse(cellId);
		if (boardState[client.gameId].hasBeenWon) return;

		if (client.playerLetter === boardState[client.gameId].currentPlayer) {
			boardState[client.gameId][x][y] = client.playerLetter;

			io.to(client.gameId).emit(
				"updatecell",
				`[${x}, ${y}]`,
				client.playerLetter
			);

			// determine whose turn it is next
			if (
				games[client.gameId][0].playerLetter ===
				boardState[client.gameId].currentPlayer
			) {
				boardState[client.gameId].currentPlayer =
					games[client.gameId][1].playerLetter;
			} else {
				boardState[client.gameId].currentPlayer =
					games[client.gameId][0].playerLetter;
			}

			// check if there's a winner
			if (findWinner(boardState[client.gameId])) {
				io.to(client.gameId).emit(
					"winner",
					findWinner(boardState[client.gameId])
				);
				boardState[client.gameId].hasBeenWon = true;
			} else {
				io.to(client.gameId).emit(
					"currentplayer",
					boardState[client.gameId].currentPlayer
				);
			}
		}
	});

	client.on("replay", (playerLetter) => {
		boardState[client.gameId] = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];
		delete boardState[client.gameId].hasBeenWon;
		boardState[client.gameId].currentPlayer = playerLetter;
		io.to(client.gameId).emit(
			"currentplayer",
			boardState[client.gameId].currentPlayer
		);
		io.to(client.gameId).emit("restartgame");
	});
});

server.listen(PORT);

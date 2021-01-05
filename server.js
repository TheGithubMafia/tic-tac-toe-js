const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;
const { generateId, findWinner } = require("./utils.js");

const games = {};
const boardState = {};
let gamesList = Object.keys(games);

app.use(express.static(path.join(__dirname, "./client")));

io.on("connection", (client) => {
	gamesList = gamesList.filter((game) => games[game].length < 2);

	io.emit("games", gamesList);

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
		gamesList = Object.keys(games).filter((game) => games[game].length < 2);
		io.emit("games", gamesList);
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
		gamesList = Object.keys(games).filter((game) => games[game].length < 2);
		io.emit("games", gamesList);
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
					"gameover",
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

	client.on("disconnect", () => {
		io.to(client.gameId).emit("offline", client.playerLetter);
		delete boardState[client.gameId];
		delete games[client.gameId];
		gamesList = Object.keys(games).filter((game) => games[game].length < 2);

		io.emit("games", gamesList);
	});
});

server.listen(PORT);

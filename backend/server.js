const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname, "/../frontend")));
// app.get("/", (req, res) => {
// 	res.sendFile(path.join(__dirname, "/../frontend/index.html"));
// });
const rooms = {};
const state = {};

io.on("connection", (client) => {
	client.on("clicked", (id) => {
		id = JSON.parse(id);
		const [x, y] = id;
		if (client.id === state[client.code].currentPlayer) {
		state[client.code][x][y] = client.player;
		// console.log("rooms: ", rooms);
			io.to(client.code).emit("update", `[${x}, ${y}]`, client.player);
			if (rooms[client.code][0] === state[client.code].currentPlayer) {
				state[client.code].currentPlayer = rooms[client.code][1]
			} else {
				state[client.code].currentPlayer = rooms[client.code][0]
			}
		}

		// console.log(state[`${client.code}`][x][y]);
		// state[client.code][id - 1] = "X";
		// console.log(state[client.code]);
		// console.log(state[client.code][0]);
		console.log(state[client.code]);
	});
	client.on("newGame", () => {
		const code = String(Math.round(Math.random() * 1000000));
		client.join(code);
		rooms[code] = [client.id];
		console.log(rooms);
		client.player = "X";
		state[code] = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];
		
		// state[code].currentPlayer = client.id;
		console.log("current clientID", client.id)
		// ensure user hasn't joined other rooms
		client.code = code;
		client.emit("gameCode", code);
		console.log(state[code])
	});
	client.on("joinGame", (code) => {
		if (rooms[code].length === 2) return;
		client.join(code);
		rooms[code].push(client.id);
		console.log(rooms);
		client.code = code;
		client.player = "O";
		state[code].currentPlayer = rooms[client.code][0];

		client.emit("gameCode", code);
	});
});

server.listen(3000);

/* 
close connections and delete resources when connection is closed

add player names

refactor
*/

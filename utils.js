const generateId = () => Math.random().toString(16).slice(10);

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
	} else if (grid.every((row) => row.every((item) => item !== null))) {
		return "It's a draw!";
	} else {
		return false;
	}
}

module.exports = { generateId, findWinner };

const gameController = (function() {
    let board;
    let startingPlayer;
    let otherPlayer;

    function start(gameBoard, player1, player2) {

        if (!gameBoard || !player1 || !player2) {
            throw new TypeError('You must specify a board and 2 players.');
        }

        board = gameBoard;
        startingPlayer = player1;
        otherPlayer = player2;

        board.clear();
    }

    return {
        start,
    };
})();

const board = (function() {
    const grid = createGrid(3);

    function createGrid(length) {
        return Array.from({ length }, () =>
            Array.from({ length }, () => createCell())
        );
    }

    function clear() {
        grid.forEach(row => row.forEach(cell => cell.clear()));
    }

    function getCell(row, column) {
        return grid[row][column];
    }

    return {
        clear,
        getCell,
    };
})();

function createCell(value = 0) {

    function getValue() {
        return value;
    }

    function setValue(newValue) {
        value = newValue;
    }

    function clear() {
        setValue(0);
    }

    return {
        getValue,
        setValue,
        clear,
    };
}

function createPlayer(name) {
    return {
        getName: () => name,
    };
}

const player1 = createPlayer('Player 1');
const player2 = createPlayer('Player 2');

gameController.start(board, player1, player2);

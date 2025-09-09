const gameController = (function() {
    let board;
    let startingPlayer;
    let otherPlayer;

    function start(gameBoard, player1, player2) {

        if (!gameBoard || !player1 || !player2) {
            console.log(gameBoard, player1, player2);
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
    const grid = [
        ['X', 'O', 'X'],
        ['X', 'X', 'O'],
        ['X', 'O', 'O'],
    ];

    function clear() {
        for (const row in grid) {
            for (const column in grid[row]) {
                grid[row][column] = '';
            }
        }
    }

    function getCell(row, column) {
        return grid[row][column];
    }

    function updateCell(symbol, row, column) {
        grid[row][column] = symbol;
    }

    return {
        clear,
        getCell,
        updateCell,
    };
})();

function createCell(value = 0) {

    function getValue() {
        return value;
    }

    function setValue(newValue) {
        value = newValue;
    }

    return {
        getValue,
        setValue,
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

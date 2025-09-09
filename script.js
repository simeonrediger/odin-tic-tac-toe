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
    const cells = [
        ['X', 'O', 'X'],
        ['X', 'X', 'O'],
        ['X', 'O', 'O'],
    ];

    function clear() {
        for (const row in cells) {
            for (const column in cells[row]) {
                cells[row][column] = '';
            }
        }
    }

    function getCell(row, column) {
        return cells[row][column];
    }

    function updateCell(symbol, row, column) {
        cells[row][column] = symbol;
    }

    return {
        clear,
        getCell,
        updateCell,
    };
})();

function createPlayer(name) {
    return {
        getName: () => name,
    };
}

const player1 = createPlayer('Player 1');
const player2 = createPlayer('Player 2');

gameController.start(board, player1, player2);

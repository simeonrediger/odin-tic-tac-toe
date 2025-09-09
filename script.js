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
    const squares = [
        ['X', 'O', 'X'],
        ['X', 'X', 'O'],
        ['X', 'O', 'O'],
    ];

    function clear() {
        for (const row in squares) {
            for (const column in squares[row]) {
                squares[row][column] = '';
            }
        }
    }

    function getSquare(row, column) {
        return squares[row][column];
    }

    function markSquare(symbol, row, column) {
        squares[row][column] = symbol;
    }

    return {
        clear,
        getSquare,
        markSquare,
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

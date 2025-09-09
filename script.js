const gameController = (function() {
    let board;
    let startingPlayer;
    let otherPlayer;
    let turn = 0;

    function start(gameBoard, player1, player2) {

        if (!gameBoard || !player1 || !player2) {
            throw new TypeError('You must specify a board and 2 players.');
        }

        board = gameBoard;
        startingPlayer = player1;
        otherPlayer = player2;

        startingPlayer.setPlayerNumber(1);
        otherPlayer.setPlayerNumber(2);
        board.clear();
        board.print();  // Demo only

        // Demo only
        playRound(1, 1);
        playRound(1, 2);
        playRound(2, 1);
        playRound(0, 1);
        playRound(2, 0);
        playRound(0, 2);
        playRound(2, 2);
    }

    function playRound(row, column) {
        const activePlayer = ++turn % 2 === 1 ? startingPlayer : otherPlayer;
        board.getCell(row, column).setValue(activePlayer.getPlayerNumber());
        board.print();  // Demo only
    }

    return {
        start,
        playRound,
    };
})();

const board = (function() {
    const size = 3;
    const grid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => createCell())
    );

    function print() {  // Demo only
        const gridValues = Array.from(grid).map(row =>
            row.map(cell => cell.getValue())
        );

        const gridString = gridValues.map(row => row.join(' ')).join('\n');
        console.log(gridString);
    }

    function isFull() {
        return grid.every(row => row.every(cell => cell.getValue() !== 0));
    }

    return {
        clear: () => grid.forEach(row => row.forEach(cell => cell.clear())),
        getCell: (row, column) => grid[row][column],
        isFull,
        print,  // Demo only
    };
})();

function createCell(value = 0) {

    function setValue(newValue) {
        value = newValue;
    }

    return {
        setValue,
        getValue: () => value,
        clear: () => setValue(0),
    };
}

function createPlayer(name) {
    let playerNumber;

    return {
        getName: () => name,
        getPlayerNumber: () => playerNumber,
        setPlayerNumber: number => playerNumber = number,
    };
}

const player1 = createPlayer('Player 1');
const player2 = createPlayer('Player 2');

gameController.start(board, player1, player2);

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

        startingPlayer.setPlayerNumber(1);
        otherPlayer.setPlayerNumber(2);
        board.clear();
        board.print();  // Demo only
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

    function print() {  // Demo only
        const gridValues = Array.from(grid).map(row =>
            row.map(cell => cell.getValue())
        );

        const gridString = gridValues.map(row => row.join(' ')).join('\n');
        console.log(gridString);
    }

    return {
        clear: () => grid.forEach(row =>
            row.forEach(cell => cell.clear())
        ),
        getCell: (row, column) => grid[row][column],
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

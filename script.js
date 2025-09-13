(function () {

    const gameController = (function () {
        let board;
        let startingPlayer;
        let otherPlayer;
        let turn = 0;

        const winningSequences = Object.freeze([
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]],
        ]);

        function start(gameBoard) {

            if (!gameBoard) {
                throw new TypeError('You must specify a board.');
            }

            board = gameBoard;
            startingPlayer = createPlayer('Player 1');
            otherPlayer = createPlayer('Player 2');
            startingPlayer.setPlayerNumber(1);
            otherPlayer.setPlayerNumber(2);
            board.clear();
            board.print(); // Demo
            promptPlayer(startingPlayer);
        }

        function playRound(row, column) {
            const activePlayer = ++turn % 2 === 1 ? startingPlayer : otherPlayer;
            board.getCell(row, column).setValue(activePlayer.getPlayerNumber());
            board.print(); // Demo
            const winner = determineWinner();

            if (winner) {
                declareWinner(winner);
            } else if (board.isFull()) {
                declareTie();
            } else {
                promptPlayer(getNextPlayer(activePlayer));
            }
        }

        function promptPlayer(player) {
            console.log(`It's ${player.getName()}'s turn.`); // Demo
        }

        function determineWinner() {
            for (const sequence of winningSequences) {
                if (sequenceHasWinner(sequence)) {
                    const firstCell = board.getCell(...sequence[0]);
                    const winnerNumber = firstCell.getValue();
                    const winner = getPlayerByNumber(winnerNumber);
                    return winner;
                }
            }
        }

        function sequenceHasWinner(sequence) {
            const firstCellValue = board.getCell(...sequence[0]).getValue();

            if (firstCellValue === 0) {
                return false;
            }

            const allSequenceValuesMatch = sequence.every(coordinates =>
                board.getCell(...coordinates).getValue() === firstCellValue
            );

            return allSequenceValuesMatch;
        }

        function declareWinner(player) {
            console.log(`${player.getName()} wins!`); // Demo
        }

        function getPlayerByNumber(number) {
            switch (number) {
                case 1:
                    return startingPlayer;
                case 2:
                    return otherPlayer;
                default:
                    throw new TypeError(`Invalid player number: ${number}`);
            }
        }

        function getNextPlayer(activePlayer) {
            return activePlayer === startingPlayer ? otherPlayer : startingPlayer;
        }

        return {
            start,
            playRound,
        };
    })();

    const board = (function () {
        const size = 3;
        const grid = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => createCell())
        );

        function print() { // Demo
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
            print, // Demo
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

    gameController.start(board, player1, player2);

})();

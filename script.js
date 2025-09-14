(function () {

    const board = (function () {
        const size = 3;
        const grid = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => createCell())
        );

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

        function getCell(row, column) {
            return grid[row][column];
        }

        function isFull() {
            return grid.every(row => row.every(cell => cell.getValue() !== 0));
        }

        return {
            clear: () => grid.forEach(row => row.forEach(cell => cell.clear())),
            getCellValue: (row, column) => getCell(row, column).getValue(),
            setCellValue: (row, column, value) =>
                getCell(row, column).setValue(value),
            isFull,
        };
    })();

    const gameController = (function () {
        let gameHasStarted = false;
        let startingPlayer;
        let otherPlayer;
        let activePlayer;

        const winningSequences = Object.freeze([
            [[0, 0], [0, 1], [0, 2]],  // top row
            [[1, 0], [1, 1], [1, 2]],  // middle row
            [[2, 0], [2, 1], [2, 2]],  // bottom row

            [[0, 0], [1, 0], [2, 0]],  // left column
            [[0, 1], [1, 1], [2, 1]],  // middle column
            [[0, 2], [1, 2], [2, 2]],  // right column

            [[0, 0], [1, 1], [2, 2]],  // top-left-to-bottom-right diagonal
            [[0, 2], [1, 1], [2, 0]],  // top-right-to-bottom-left diagnoal
        ]);

        function start() {
            startingPlayer = createPlayer('Player 1');
            otherPlayer = createPlayer('Player 2');
            startingPlayer.setPlayerNumber(1);
            otherPlayer.setPlayerNumber(2);

            gameHasStarted = true;
            activePlayer = startingPlayer;
            promptPlayer(startingPlayer);
        }

        function reset() {
            board.clear();
            gameHasStarted = false;
        }

        function createPlayer(name) {
            let playerNumber;

            return {
                getName: () => name,
                getPlayerNumber: () => playerNumber,
                setPlayerNumber: number => playerNumber = number,
            };
        }

        function playRound(row, column) {
            board.setCellValue(row, column, getActivePlayerNumber());
            switchActivePlayer();
            const winner = determineWinner();
            const gameIsWon = Boolean(winner);
            const gameIsTied = !gameIsWon && board.isFull();

            if (gameIsWon || gameIsTied) {
                gameHasStarted = false;
                displayController.disableBoardInteractionCues();
            }

            if (gameIsWon) {
                declareWinner(winner);
            } else if (gameIsTied) {
                declareTie();
            } else {
                promptPlayer();
            }
        }

        function promptPlayer() {
            console.log(`It's ${activePlayer.getName()}'s turn.`); // Demo
        }

        function switchActivePlayer() {

            if (activePlayer === startingPlayer) {
                activePlayer = otherPlayer;
            } else {
                activePlayer = startingPlayer;
            }
        }

        function getActivePlayerNumber() {
            return activePlayer.getPlayerNumber();
        }

        function determineWinner() {
            for (const sequence of winningSequences) {
                if (sequenceHasWinner(sequence)) {
                    const winnerNumber = board.getCellValue(...sequence[0]);
                    const winner = getPlayerByNumber(winnerNumber);
                    return winner;
                }
            }
        }

        function sequenceHasWinner(sequence) {
            const firstCellValue = board.getCellValue(...sequence[0]);

            if (firstCellValue === 0) {
                return false;
            }

            const allSequenceValuesMatch = sequence.every(coordinates =>
                board.getCellValue(...coordinates) === firstCellValue
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

        return {
            gameHasStarted: () => gameHasStarted,
            start,
            reset,
            playRound,
            getActivePlayerNumber,
        };
    })();

    const displayController = (function () {

        const elements = {
            board: document.querySelector('#board'),
            announcements: document.querySelector('#announcements'),
            playerNameInputs: document.querySelector('#player-name-inputs'),
            startingPlayerNameInput: document.querySelector(
                '#starting-player-name'
            ),
            otherPlayerNameInput: document.querySelector('#other-player-name'),
            startButton: document.querySelector('#start-button'),
            startingPlayerTokenTemplate: document.querySelector('template')
                .content.querySelector('#starting-player-token'),
            otherPlayerTokenTemplate: document.querySelector('template')
                .content.querySelector('#other-player-token'),
        };

        const startTextPrompt = elements.startButton.textContent;
        const resetTextPrompt = 'Reset';

        bindEvents();
        renderBoard();

        function bindEvents() {
            elements.board.addEventListener('click', handleBoardClick);
            elements.startButton.addEventListener('click',
                handleStartButtonClick
            );
        }

        function handleBoardClick(event) {
            const cellClicked = event.target.classList.contains('cell');

            if (!cellClicked || !gameController.gameHasStarted()) {
                return;
            }

            const cellElement = event.target;
            const row = cellElement.dataset.row;
            const column = cellElement.dataset.column;

            addTokenToCell(row, column, gameController.getActivePlayerNumber());
            gameController.playRound(row, column);
        }

        function handleStartButtonClick() {

            if (boardHasTokens()) {
                clearTokens();
                gameController.reset();
            } else {
                gameController.start();
            }

            toggleBoardInteractionCues(gameIsBeingStarted);
            toggleStartButtonAppearance();
        }

        function boardHasTokens() {
            return Boolean(elements.board.querySelector('.token'));
        }

        function renderBoard() {
            const boardSize = 3;

            for (let row = 0; row < boardSize; row++) {

                for (let column = 0; column < boardSize; column++) {
                    const cellElement = createCellElement(row, column);
                    elements.board.append(cellElement);
                }
            }
        }

        function createCellElement(row, column) {
            const cellElement = document.createElement('button');
            cellElement.classList.add('cell');
            cellElement.dataset.row = row;
            cellElement.dataset.column = column;
            cellElement.ariaLabel = `Play row ${row}, column ${column}`;
            return cellElement;
        }

        function toggleBoardInteractionCues(enabled) {
            elements.board.classList[enabled ? 'add' : 'remove']('in-play');
        }

        function toggleStartButtonAppearance() {
            elements.startButton.classList.toggle('reset');

            if (elements.startButton.textContent === startTextPrompt) {
                elements.startButton.textContent = resetTextPrompt;
            } else {
                elements.startButton.textContent = startTextPrompt;
            }
        }

        function addTokenToCell(row, column, playerNumber) {
            let tokenTemplate;

            switch (playerNumber) {
                case 1:
                    tokenTemplate = elements.startingPlayerTokenTemplate;
                    break;
                case 2:
                    tokenTemplate = elements.otherPlayerTokenTemplate;
                    break;
                default:
                    throw new TypeError(`Invalid player number: ${number}`);
            }

            const token = tokenTemplate.cloneNode(true);
            const cellElement = elements.board.querySelector(
                `[data-row='${row}'][data-column='${column}']`
            );
            cellElement.append(token);
        }

        function clearTokens() {
            elements.board.querySelectorAll('.token').forEach(token =>
                token.remove()
            );
        }

        return {
            disableBoardInteractionCues: () =>
                toggleBoardInteractionCues(false),
        }
    })();
})();

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
        let gameIsOngoing = false;
        let startingPlayer;
        let otherPlayer;
        let activePlayer;

        const roundResults = Object.freeze({
            CONTINUE: Symbol('continue'),
            WIN: Symbol('win'),
            TIE: Symbol('tie'),
        });

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

        function start(startingPlayerName, otherPlayerName) {
            startingPlayer = createPlayer(1, startingPlayerName);
            otherPlayer = createPlayer(2, otherPlayerName);

            gameIsOngoing = true;
            activePlayer = startingPlayer;
            displayController.promptPlayer(activePlayer.name);
        }

        function reset() {
            board.clear();
            gameIsOngoing = false;
        }

        function createPlayer(number, name) {

            return Object.freeze({
                name,
                number,
            });
        }

        function playRound(row, column) {
            board.setCellValue(row, column, activePlayer.number);

            const {
                roundResult,
                winnerName,
                winningSequence,
            } = determineRoundResult();

            if (roundResult !== roundResults.CONTINUE) {
                gameIsOngoing = false;
                displayController.disableBoardInteractionCues();
            }

            switch (roundResult) {

                case roundResults.CONTINUE:
                    switchActivePlayer();
                    displayController.promptPlayer(activePlayer.name);
                    break;

                case roundResults.WIN:
                    displayController.indicateWin(winnerName, winningSequence);
                    break;

                case roundResults.TIE:
                    displayController.indicateTie();
                    break;
            }
        }

        function switchActivePlayer() {
            activePlayer = activePlayer === startingPlayer
                ? otherPlayer : startingPlayer;
        }

        function determineRoundResult() {
            let roundResult;
            let winnerName = null;
            let winningSequence = null;

            for (const sequence of winningSequences) {
                if (sequenceHasWinner(sequence)) {
                    const winnerNumber = board.getCellValue(...sequence[0]);
                    winnerName = getPlayerByNumber(winnerNumber).name;
                    winningSequence = sequence;
                    break;
                }
            }

            if (Boolean(winnerName)) {
                roundResult = roundResults.WIN;
            } else if (board.isFull()) {
                roundResult = roundResults.TIE;
            } else {
                roundResult = roundResults.CONTINUE;
            }

            return {
                roundResult,
                winnerName,
                winningSequence,
            };
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
            gameIsOngoing: () => gameIsOngoing,
            start,
            reset,
            playRound,
            getActivePlayerNumber: () => activePlayer.number,
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
            const cellElement = event.target.closest('.cell');
            const containsToken = Boolean(cellElement.querySelector('.token'));

            if (
                !cellElement
                || containsToken
                || !gameController.gameIsOngoing()
            ) {
                return;
            }

            const row = cellElement.dataset.row;
            const column = cellElement.dataset.column;

            addTokenToCell(row, column, gameController.getActivePlayerNumber());
            gameController.playRound(row, column);
        }

        function handleStartButtonClick() {

            if (boardHasTokens()) {
                clearTokens();
            }

            const gameIsBeingStarted = !elements.startButton.classList
                .contains('reset');

            if (gameIsBeingStarted) {
                gameController.start(
                    getInputValue(elements.startingPlayerNameInput),
                    getInputValue(elements.otherPlayerNameInput),
                );
            } else {
                gameController.reset();
                removeTokenHighlighting();
            }

            toggleBoardInteractionCues(gameIsBeingStarted);
            toggleElementVisibility(elements.announcements);
            toggleElementVisibility(elements.playerNameInputs);
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

        function getInputValue(input) {

            if (input.value.trim() === '') {
                return input.placeholder;
            } else {
                return input.value;
            }
        }

        function promptPlayer(playerName) {
            elements.announcements.textContent =
                `${playerName}'s turn to play`;
        }

        function indicateWin(winnerName, winningSequence) {
            elements.announcements.textContent = `${winnerName} wins!`;
            highlightTokensInSequence(winningSequence);
        }

        function indicateTie() {
            elements.announcements.textContent = `It's a tie!`;
        }

        function highlightTokensInSequence(sequence) {

            for (const [row, column] of sequence) {
                elements.board.querySelector(
                    `[data-row='${row}'][data-column='${column}'] .token`
                ).classList.add('highlighted');
            }
        }

        function removeTokenHighlighting() {
            document.querySelectorAll('.token.highlighted').forEach(token =>
                token.classList.remove('highlighted')
            );
        }

        function toggleBoardInteractionCues(enabled) {
            elements.board.classList[
                enabled ? 'add' : 'remove'
            ]('interactable');
        }

        function toggleElementVisibility(element) {
            element.classList.toggle('hidden');
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
            promptPlayer,
            indicateWin,
            indicateTie,
            disableBoardInteractionCues: () =>
                toggleBoardInteractionCues(false),
        }
    })();
})();

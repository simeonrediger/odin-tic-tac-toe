(function () {

    const board = (function () {
        const size = 3;
        const grid = Array.from({ length: size }, () =>
            new Array(size).fill(null)
        );

        function isFull() {
            return grid.every(row => row.every(cellValue => cellValue !== null));
        }

        return {
            clear: () => grid.forEach(row => row.fill(null)),
            getCellValue: (row, column) => grid[row][column],
            setCellValue: (row, column, value) => grid[row][column] = value,
            isFull,
        };
    })();

    const gameController = (function () {
        let gameIsOngoing = false;
        let startingPlayer;
        let otherPlayer;
        let activePlayer;

        const roundResults = Object.freeze({
            ONGOING: Symbol('continue'),
            WIN: Symbol('win'),
            TIE: Symbol('tie'),
        });

        const winnableSequences = Object.freeze([
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

            const report = {
                activePlayerName: activePlayer.name,
            };

            return report;
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
                wonSequences,
            } = determineRoundResult();

            gameIsOngoing = roundResult === roundResults.ONGOING;

            if (gameIsOngoing) {
                switchActivePlayer();
            }

            const report = {
                gameIsOngoing,
                gameIsWon: roundResult === roundResults.WIN,
                activePlayerName: gameIsOngoing ? activePlayer.name : null,
                winnerName,
                wonSequences,
            };

            return report;
        }

        function switchActivePlayer() {
            activePlayer = activePlayer === startingPlayer
                ? otherPlayer : startingPlayer;
        }

        function determineRoundResult() {
            let roundResult;
            let winnerName = null;
            let wonSequences = [];

            for (const sequence of winnableSequences) {

                if (!sequenceHasWinner(sequence)) {
                    continue;
                };

                const winnerNumber = board.getCellValue(...sequence[0]);
                winnerName = getPlayerByNumber(winnerNumber).name;
                wonSequences.push(sequence);

                if (wonSequences.length >= 2) {
                    break;
                }
            }

            if (Boolean(winnerName)) {
                roundResult = roundResults.WIN;
            } else if (board.isFull()) {
                roundResult = roundResults.TIE;
            } else {
                roundResult = roundResults.ONGOING;
            }

            return {
                roundResult,
                winnerName,
                wonSequences: wonSequences,
            };
        }

        function sequenceHasWinner(sequence) {
            const firstCellValue = board.getCellValue(...sequence[0]);

            if (firstCellValue === null) {
                return false;
            }

            const allSequenceValuesMatch = sequence.every(coordinates =>
                board.getCellValue(...coordinates) === firstCellValue
            );

            return allSequenceValuesMatch;
        }

        function getPlayerByNumber(number) {
            return number === 1 ? startingPlayer : otherPlayer;
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
            startingPlayerTokenTemplate: document.querySelector(
                '#starting-player-token'
            ).content,
            otherPlayerTokenTemplate: document.querySelector(
                '#other-player-token'
            ).content,
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

            const row = Number(cellElement.dataset.row);
            const column = Number(cellElement.dataset.column);

            addTokenToCell(row, column, gameController.getActivePlayerNumber());
            const report = gameController.playRound(row, column);

            if (report.gameIsOngoing) {
                promptPlayer(report.activePlayerName);
            } else {
                toggleBoardInteractionCues(false);

                if (report.gameIsWon) {
                    indicateWin(report.winnerName, report.wonSequences);
                } else {
                    indicateTie();
                }
            }
        }

        function handleStartButtonClick() {
            clearTokens();

            const gameIsBeingStarted = !elements.startButton.classList
                .contains('reset');

            if (gameIsBeingStarted) {

                const report = gameController.start(
                    getInputValue(elements.startingPlayerNameInput),
                    getInputValue(elements.otherPlayerNameInput),
                );

                promptPlayer(report.activePlayerName);

            } else {
                gameController.reset();
                removeTokenHighlighting();
            }

            toggleBoardInteractionCues(gameIsBeingStarted);
            toggleElementVisibility(elements.announcements);
            toggleElementVisibility(elements.playerNameInputs);
            toggleStartButtonAppearance();
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

        function indicateWin(winnerName, wonSequences) {
            elements.announcements.textContent = `${winnerName} wins!`;

            for (const sequence of wonSequences) {
                highlightTokensInSequence(sequence);
            }
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

            elements.startButton.textContent = (
                elements.startButton.classList.contains('reset')
                    ? resetTextPrompt
                    : startTextPrompt
            );
        }

        function addTokenToCell(row, column, playerNumber) {
            const tokenTemplate = playerNumber === 1 ?
                elements.startingPlayerTokenTemplate
                : elements.otherPlayerTokenTemplate;

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
    })();
})();

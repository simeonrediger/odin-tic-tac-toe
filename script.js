const gameBoard = (function() {
    const boardState = [
        ['X', 'O', 'X'],
        ['X', 'X', 'O'],
        ['X', 'O', 'O'],
    ];
})();

function createPlayer(name) {
    return {
        getName: () => name,
    };
}

const player1 = createPlayer('Player 1');
const player2 = createPlayer('Player 2');

const game = (function() {
    let startingPlayer;
    let otherPlayer;

    function start(player1, player2) {

        if (!player1 || !player2) {
            throw new TypeError('You must specify 2 players.');
        }

        startingPlayer = player1;
        otherPlayer = player2;
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
})();

function createPlayer(name) {
    return {
        getName: () => name,
    };
}

const player1 = createPlayer('Player 1');
const player2 = createPlayer('Player 2');

game.start(board, player1, player2);

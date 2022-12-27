export class CheckersGame {
    constructor() {
        this.players = ['white', 'black'];
    }

    init(gamePickables) {
        this.board = new Array(8);
        this.currentPlayer = this.players[0];

        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(8);
        }

    }
}
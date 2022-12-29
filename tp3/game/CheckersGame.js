import { Tile } from './Tile.js';
import { Checker } from './Checker.js';
import { Piece } from '../sceneObjects/Piece.js';
import { SceneComponent } from '../sceneObjects/SceneComponent.js';

const states = {
    initial: 'initial',
    playing: 'playing',
    checkerSelected: 'checkerSelected',
    targetChosen: 'targetChosen',
    finished: 'finished'
}

export class CheckersGame {
    constructor(graph) {
        this.players = ['white', 'black'];
        this.graph = graph;
        this.state = states.initial;
        this.selected = null;
    }

    init(gamePickables) {
        console.log(gamePickables)
        this.board = new Array(8);
        this.currentPlayer = this.players[0];
        for (const pickable of Object.values(gamePickables)) {
            const id = pickable.id;
            let match = id.match(/^piece([0-9]+)/)
            if ((match[1] >=1 && match[1] <= 12) || (match[1] >= 21 && match[1] <= 32)){
                this.graph.components[id].children.push({ id: id + "_checker", type: "component"})
                this.graph.primitives[id + "_checker"] = new Piece(
                    this.graph.scene,
                    id + "_checker",
                    pickable
                );

                this.graph.components[id + "_checker"] = new SceneComponent(
                    id + "_checker",
                    mat4.create(), 
                    [], "none", 
                    [{id: id + "_checker", type: "primitive"}], 
                    false
                );
            }
            if (match[1] >= 1 && match[1] <= 12)
                this.graph.components[id + "_checker"].materials = ["checker"]
            else if (match[1] >= 21 && match[1] <= 32)
                this.graph.components[id + "_checker"].materials = ["checker_white"]
            
        }
        let counter = 1;
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(8);
            for (let j = 0; j < this.board.length; j+=2) {
                let col = i%2 == 1 ? j : j+1;
                if (counter <= 12)
                    this.board[i][col] = new Checker('black', i, col, gamePickables["piece" + counter++]);
                else if (counter >= 21)
                    this.board[i][col] = new Checker('white', i, col, gamePickables["piece" + counter++]);
                else
                    this.board[i][col] = new Tile(i, col, gamePickables["piece" + counter++]);
            }
        }
        console.log(this.board)

    }

    getAvailableMoves(checker) {
        const isWhite = checker.color === 'white'; 

        const moves = [[(isWhite ? 1 : -1), -1], [(isWhite ? 1 : -1), 1]]
        if (checker.isKing())
            moves.push([(isWhite ? -1 : 1), -1], [(isWhite ? -1 : 1), 1]);
        
        const possibleMoves = []
        for (const move of [forwardLeftPos, forwardRightPos]) {
            const pos = this.board[checker.row + move[0]][checker.column + move[1]];
            if (!pos.isChecker()) 
                possibleMoves.push(pos);
            else if (pos.color !== checker.color) {
                const jump = this.board[pos.row + move[0]][pos.column + move[1]];
                if (!jump.isChecker())
                    possibleMoves.push(jump);
            }
        }

        return possibleMoves
    }

    move(checker, tile) {
        const moves = this.getAvailableMoves(checker);
        if (moves.includes(tile)) {
            this.board[checker.row][checker.column] = new Tile(checker.row, checker.column);
            checker.row = tile.row;
            checker.column = tile.column;
            this.board[tile.row][tile.column] = checker;
            if (Math.abs(checker.row - tile.row) === 2) {
                const jumpedChecker = this.board[(checker.row + tile.row) / 2][(checker.column + tile.column) / 2];
                this.board[jumpedChecker.row][jumpedChecker.column] = new Tile(jumpedChecker.row, jumpedChecker.column);
                
            } else this.currentPlayer = this.players[(this.players.indexOf(this.currentPlayer) + 1) % 2];
        }
    }

    play(selected) {
        if ((this.state === states.initial) || (this.state === states.finished))
            return
        
        if (this.state === states.playing) {
            if (this.selected.isChecker() && this.selected.color === this.currentPlayer) {
                this.state = states.checkerSelected;
                this.selected = selected;
                this.selected.select();
                // highlight available moves
                const moves = this.getAvailableMoves(this.selected);
                for (const move of moves) {
                    move.highlight();
                }
            }
        } else if (this.state === states.checkerSelected) { 
            if (this.selected.isChecker() && this.selected.color === this.currentPlayer) {
                this.state = states.playing;
                this.play(selected);
            } else {
                const moves = this.getAvailableMoves(this.selected);
                if (moves.includes(selected)) {
                    this.state = states.targetChosen;
                    this.move(this.selected, selected);
                    this.selectedChecker.deselect();
                    this.state = states.playing;
                    this.selected = selected;
                }   
            }
        }
        

    }

}
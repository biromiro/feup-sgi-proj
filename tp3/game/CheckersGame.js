import { Tile } from './Tile.js';
import { Checker } from './Checker.js';
import { Piece } from '../sceneObjects/Piece.js';
import { SceneComponent } from '../sceneObjects/SceneComponent.js';

const states = {
    initial: 'initial',
    playing: 'playing',
    checkerSelected: 'checkerSelected',
    animating: 'animating',
    finished: 'finished'
}

export class CheckersGame {
    constructor(graph) {
        this.players = ['black', 'white'];
        this.graph = graph;
        this.state = states.initial;
        this.selectedTile = null;
        this.componentToTile = {}
    }

    init(gamePickables) {
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

                this.graph.primitives[id + "_king"] = new Piece(
                    this.graph.scene,
                    id + "_king",
                    pickable,
                    true
                );

                this.graph.components[id + "_checker"] = new SceneComponent(
                    id + "_checker",
                    mat4.create(), 
                    [], "none", 
                    [{id: id + "_checker", type: "primitive"}], 
                    false
                );

                this.graph.components[id + "_king"] = new SceneComponent(
                    id + "_king",
                    mat4.create(), 
                    [], "none", 
                    [{id: id + "_king", type: "primitive"}], 
                    false
                );
            }
            if (match[1] >= 1 && match[1] <= 12)
                this.graph.components[id + "_checker"].materials = ["checker_black"]
            else if (match[1] >= 21 && match[1] <= 32)
                this.graph.components[id + "_checker"].materials = ["checker_white"]
        }

        let counter = 1;
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(8);
            for (let j = 0; j < this.board.length; j+=2) {
                let col = i%2 == 0 ? j : j+1;
                const pickable = this.graph.components["piece" + counter];
                if (counter <= 12){
                    const checker = this.graph.components[pickable.id + "_checker"];
                    this.board[i][col] = new Checker('black', i, col, pickable, checker);
                }
                else if (counter >= 21){
                    const checker = this.graph.components[pickable.id + "_checker"];
                    this.board[i][col] = new Checker('white', i, col, pickable, checker);
                }
                else {
                    this.board[i][col] = new Tile(i, col, pickable);
                }
                this.componentToTile["piece" + counter++] = [i, col]
            }
        }

        console.log(this.board)
        this.state = states.playing;

    }

    getTile(row, column) {
        if (row < 0 || row > 7 || column < 0 || column > 7) return undefined;
        return this.board[row][column];
    }
    
    getAvailableCheckers() {
        const checkers = []
        const jumpCheckers = []
        for (const row of this.board)
            for (const tile of row)
                if (tile && tile.isChecker() && tile.color === this.currentPlayer){
                    // if there are jumping moves, only those are available
                    const moves = this.getAvailableMoves(tile);
                    if (moves.type === 'jump') jumpCheckers.push(tile);
                    else if (moves.moves.length > 0) checkers.push(tile);
                }
        return jumpCheckers.length == 0 ? checkers : jumpCheckers;
    }

    getAvailableMoves(checker) {
        const isBlack = checker.color === 'black'; 

        const moves = [[(isBlack ? 1 : -1), -1], [(isBlack ? 1 : -1), 1]]
        if (checker.isKing()){
            console.log("Is king, adding moves")
            moves.push([(isBlack ? -1 : 1), -1]);
            moves.push([(isBlack ? -1 : 1), 1]);
        }
        console.log(moves)
        const possibleMoves = []
        const jumpingMoves = []
        for (const move of moves) {
            const pos = this.getTile(checker.row + move[0],checker.column + move[1]);
            if (!pos) continue
            if (!pos.isChecker()) 
                possibleMoves.push(pos);
            else if (pos.color !== checker.color) {
                const jump = this.getTile(pos.row + move[0],pos.column + move[1]);
                if (jump && !jump.isChecker())
                    jumpingMoves.push(jump);
            }
        }
        console.log(possibleMoves, jumpingMoves)
        return jumpingMoves.length == 0 ? {moves: possibleMoves, type: 'move'} : {moves: jumpingMoves, type: 'jump'};
    }

    async move(checker, tile) {
        const checkerObject = checker.checkerObject;
        const checkerPickable = checker.clickableObject;
        const tilePickable = tile.clickableObject;

        // remove checker from checkerPickable and add it to tilePickable
        checkerPickable.children = checkerPickable.children.filter(child => child.id !== checkerObject.id);
        tilePickable.children.push({id: checkerObject.id, type: "component"});
        
        this.board[checker.row][checker.column] = new Tile(checker.row, checker.column, checkerPickable);
        const newChecker = new Checker(checker.color, tile.row, tile.column, tilePickable, checkerObject, checker.king);
        this.board[tile.row][tile.column] = newChecker;
        if (Math.abs(checker.row - tile.row) === 2) {
            const jumpedChecker = this.board[(checker.row + tile.row) / 2][(checker.column + tile.column) / 2];
            const jumpedCheckerPickable = jumpedChecker.clickableObject;
            jumpedCheckerPickable.children = jumpedCheckerPickable.children.filter(child => child.id !== jumpedChecker.checkerObject.id);
            this.board[jumpedChecker.row][jumpedChecker.column] = new Tile(jumpedChecker.row, jumpedChecker.column, jumpedCheckerPickable);
        }

        // if checker reached the other side, make it a king
        if (newChecker.color === 'black' && newChecker.row === 7)
            newChecker.setKing();
        else if (newChecker.color === 'white' && newChecker.row === 0)
            newChecker.setKing();

        return newChecker;
    }

    async play(selected) {
        if ((this.state === states.initial) || (this.state === states.finished) || (this.state === states.animating))
            return
        
        const tile = this.componentToTile[selected];
        const selectedTile = this.board[tile[0]][tile[1]];
        
        if (this.state === states.playing) {
            if (selectedTile.isChecker() && selectedTile.color === this.currentPlayer) {
                const availableCheckers = this.getAvailableCheckers();
                if (availableCheckers.indexOf(selectedTile) === -1){
                    for (const checker of availableCheckers){
                        checker.warn();
                        setTimeout(() => checker.unwarn(), 1000);
                    }
                    return;
                }
                this.state = states.checkerSelected;
                const moves = this.getAvailableMoves(selectedTile);
                if (moves.moves.length === 0) {
                    this.state = states.playing;
                    return;
                }

                this.selectedTile = selectedTile;
                this.selectedTile.select();
                for (const move of moves.moves) {
                    move.highlight();
                }
            }
        } else if (this.state === states.checkerSelected) {
            const moves = this.getAvailableMoves(this.selectedTile);
            for (const move of moves.moves) {
                move.unhighlight();
            }
            this.selectedTile.deselect();
            if (selectedTile.isChecker() && selectedTile.color === this.currentPlayer) {
                this.state = states.playing;
                this.play(selected);
            } else {
                if (moves.moves.includes(selectedTile)) {
                    this.state = states.targetChosen;
                    this.selectedTile.deselect();
                    this.selectedTile = await this.move(this.selectedTile, selectedTile);
                    if (moves.type === 'jump') {
                        console.log("It was a jump, checking for chained jumps")
                        const moves = this.getAvailableMoves(this.selectedTile);
                        if (moves.type === 'jump' && moves.moves.length > 0) {
                            this.state = states.checkerSelected;
                            this.selectedTile.select();
                            for (const move of moves.moves) {
                                move.highlight();
                            }
                            return
                        }
                    }
                    this.state = states.playing;
                    this.selectedTile = undefined;
                    this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
                }   
            }
        }

        const availableCheckers = this.getAvailableCheckers();
        if (availableCheckers.length === 0) {
            this.state = states.finished;
            console.log("Game finished, no checkers available, player " + this.currentPlayer === 'black' ? 'white' : 'black' + " wins")
        }
        

    }

}
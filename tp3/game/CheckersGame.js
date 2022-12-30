import { Tile } from './Tile.js';
import { Checker } from './Checker.js';
import { Piece } from '../sceneObjects/Piece.js';
import { SceneComponent } from '../sceneObjects/SceneComponent.js';
import { MyKeyframe } from '../animations/MyKeyframe.js';
import { MyKeyframeAnimation } from '../animations/MyKeyframeAnimation.js';

const states = {
    initial: 'initial',
    playing: 'playing',
    checkerSelected: 'checkerSelected',
    onCombo: 'onCombo',
    canLock: 'canLock',
    animating: 'animating',
    finished: 'finished'
}

export class CheckersGame {
    constructor(graph) {
        this.players = ['black', 'white'];
        this.cameras = {'black': 'player1', 'white':'player2'};
        this.graph = graph;
        this.state = states.initial;
        this.selectedTile = null;
        this.componentToTile = {}
        this.timeout = 700;
        this.animTime = 0.5;
        this.turnTime = 30;
        this.fullTime = 180;
        this.gameInfo = {
            'black': {
                'turn': this.turnTime,
                'full': this.fullTime,
                'queens': 0,
                'taken': 0
            },
            'white': {
                'turn': this.turnTime,
                'full': this.fullTime,
                'queens': 0,
                'taken': 0
            }
        }
    }

    switchPlayers() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.gameInfo[this.currentPlayer].turn = this.turnTime;

        const midAnim = this.graph.camAnimations['overviewGame']
        const targetAnim = this.graph.camAnimations[this.cameras[this.currentPlayer]]
        midAnim.start(this.graph.scene.animTime)
        targetAnim.start(this.graph.scene.animTime + midAnim.duration + this.animTime)

        setTimeout(() => {
            this.state = states.playing;
        }, (midAnim.duration + targetAnim.duration + this.animTime) * 1000);

    }

    update() {
        if (this.state === states.initial || this.state === states.finished || this.state === states.animating) return;
        this.gameInfo[this.currentPlayer].turn -= 1;
        this.gameInfo[this.currentPlayer].full -= 1;
        if (this.gameInfo[this.currentPlayer].turn <= 0) {
            this.state = states.finished;
            this.graph.gameOver(this.currentPlayer === 'black' ? 'white' : 'black');
        }
        if (this.gameInfo[this.currentPlayer].full <= 0) {
            this.state = states.finished;
            this.graph.gameOver(this.currentPlayer === 'black' ? 'white' : 'black');
        }


    }

    getTime(seconds) {
        const date = new Date(seconds * 1000);
        return date.toISOString().slice(14, 19);
    }

    pad(d) {
        return (d < 10) ? '0' + d.toString() : d.toString();
    }

    getInfo(player) {
        const info = this.gameInfo[player];
        return {
            'turn': this.getTime(info.turn),
            'full': this.getTime(info.full),
            'queens': this.pad(info.queens),
            'taken': this.pad(info.taken)
        };
    }

    init(gamePickables) {
        this.board = new Array(8);
        this.currentPlayer = this.players[0];

        for (const pickable of Object.values(gamePickables)) {
            const id = pickable.id;
            let match = id.match(/^piece([0-9]+)/)
            if (!match) continue;
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
            moves.push([(isBlack ? -1 : 1), -1]);
            moves.push([(isBlack ? -1 : 1), 1]);
        }
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
        return jumpingMoves.length == 0 ? {moves: possibleMoves, type: 'move'} : {moves: jumpingMoves, type: 'jump'};
    }

    easeInCubic(x){
        return x * x * x;
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    getLerp(start, end, p, ease) {
        const x = start[0] + (end[0] - start[0]) * p;
        const y = start[1] + (end[1] - start[1]) * (ease == 'in' ? this.easeInCubic(p) : this.easeOutCubic(p));
        const z = start[2] + (end[2] - start[2]) * p;
        return vec3.fromValues(x, y, z);
    }

    genAnimation(checker, targetTile, jump) {
        const checkerObject = checker.checkerObject;
        const target = targetTile.clickableObject;
        const orig = checker.clickableObject;
        const time = this.animTime + (jump ? 0.1 : 0);
        const firstMatrix = orig.transformation, finalMatrix = target.transformation;
        let firstPosition = vec3.fromValues(firstMatrix[12], firstMatrix[13], firstMatrix[14]);
        let finalPosition = vec3.fromValues(finalMatrix[12], finalMatrix[13], finalMatrix[14]);
        let midPosition = vec3.fromValues(
            (firstPosition[0] + finalPosition[0])/2, 
            (firstPosition[1] + finalPosition[1])/2 + (jump ? 0.05 : 0),
            (firstPosition[2] + finalPosition[2])/2
        );
        const diff = vec3.subtract(vec3.create(), firstPosition, finalPosition);
        const currAnimTime = this.graph.scene.animTime;
        
        const targetTime = currAnimTime + time;
        const keyframes = []
        
        let matrix = mat4.create(); 
        matrix = mat4.translate(matrix, matrix, diff);
        keyframes.push(new MyKeyframe(currAnimTime, matrix));

        for (let i = 1; i <= 3; i++) {
            let matrix_ = mat4.translate(mat4.create(), mat4.create(), diff)
            const vec = this.getLerp(firstPosition, midPosition, i/3, 'out');
            const diff_ = vec3.subtract(vec3.create(), vec, firstPosition);
            matrix_ = mat4.translate(matrix_, matrix_, diff_);
            keyframes.push(new MyKeyframe(currAnimTime + (time * i) / 7, matrix_));
        }

        for (let i = 1; i <= 3; i++) {
            let matrix_ = mat4.translate(mat4.create(), mat4.create(), diff)
            const vec = this.getLerp(midPosition, finalPosition, i/3, 'in');
            const diff_ = vec3.subtract(vec3.create(), vec, firstPosition);
            matrix_ = mat4.translate(matrix_, matrix_, diff_);
            keyframes.push(new MyKeyframe(currAnimTime + (time * (i+3)) / 7, matrix_));
        }

        keyframes.push(new MyKeyframe(targetTime, mat4.create()));

        this.graph.animations["checker" + checkerObject.id] = new MyKeyframeAnimation(this.graph.scene, keyframes)
        checkerObject.animation = "checker" + checkerObject.id;
        return "checker" + checkerObject.id;
    }

    async move(checker, tile) {
        const checkerObject = checker.checkerObject;
        const checkerPickable = checker.clickableObject;
        const tilePickable = tile.clickableObject;

        // remove checker from checkerPickable and add it to tilePickable
        checkerPickable.children = checkerPickable.children.filter(child => child.id !== checkerObject.id);
        tilePickable.children.push({id: checkerObject.id, type: "component"});
        
        this.board[checker.row][checker.column] = new Tile(checker.row, checker.column, checkerPickable);
       
        if (Math.abs(checker.row - tile.row) === 2) {
            const jumpedChecker = this.board[(checker.row + tile.row) / 2][(checker.column + tile.column) / 2];
            const jumpedCheckerPickable = jumpedChecker.clickableObject;
            jumpedCheckerPickable.children = jumpedCheckerPickable.children.filter(child => child.id !== jumpedChecker.checkerObject.id);
            this.board[jumpedChecker.row][jumpedChecker.column] = new Tile(jumpedChecker.row, jumpedChecker.column, jumpedCheckerPickable);
            checker.addAnimation(this.genAnimation(checker, tile, true));
            this.gameInfo[this.currentPlayer].taken++;
            if (jumpedChecker.isKing()) this.gameInfo[this.currentPlayer === "black" ? "white" : "black"].queens--;
        } else {
            checker.addAnimation(this.genAnimation(checker, tile, false));
        }

        const newChecker = new Checker(checker.color, tile.row, tile.column, tilePickable, checkerObject, checker.king);
        this.board[tile.row][tile.column] = newChecker;

        // if checker reached the other side, make it a king
        if (newChecker.color === 'black' && newChecker.row === 7){
            newChecker.setKing();
            this.gameInfo['black'].queens++;
        }
        else if (newChecker.color === 'white' && newChecker.row === 0){
            newChecker.setKing();
            this.gameInfo['black'].queens++;
        }

        return newChecker;
    }

    undo(player) {
        if (this.currentPlayer !== player) return
    }

    lock(player) {
        if (this.currentPlayer !== player) return
        setTimeout(() => {
            this.selectedTile.removeAnimation();
            this.selectedTile = undefined;
            this.switchPlayers()
        }, this.timeout);
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
                    this.state = states.animating;
                    if (moves.type === 'jump') {
                        console.log("It was a jump, checking for chained jumps")
                        const moves = this.getAvailableMoves(this.selectedTile);
                        if (moves.type === 'jump' && moves.moves.length > 0) {
                            setTimeout(() => {
                                this.state = states.onCombo;
                                this.selectedTile.select();
                                this.selectedTile.removeAnimation();
                                for (const move of moves.moves) {
                                    move.highlight();
                                }
                            }, this.timeout);
                            return
                        }
                    }
                    this.state = states.canLock;
                }   
            }
        } else if (this.state === states.onCombo) {
            const moves = this.getAvailableMoves(this.selectedTile);
            if (moves.moves.includes(selectedTile)) {
                for (const move of moves.moves) {
                    move.unhighlight();
                }
                this.selectedTile.deselect();
                this.selectedTile = await this.move(this.selectedTile, selectedTile);
                if (moves.type === 'jump') {
                    console.log("It was a jump, checking for chained jumps")
                    const moves = this.getAvailableMoves(this.selectedTile);
                    if (moves.type === 'jump' && moves.moves.length > 0) {
                        setTimeout(() => {
                            this.state = states.onCombo;
                            this.selectedTile.select();
                            this.selectedTile.removeAnimation();
                            for (const move of moves.moves) {
                                move.highlight();
                            }
                        }, this.timeout);
                        return
                    }
                }
                this.state = states.canLock;
            }   
        }

        const availableCheckers = this.getAvailableCheckers();
        if (availableCheckers.length === 0) {
            this.state = states.finished;
            this.graph.gameOver(this.currentPlayer === 'black' ? 'white' : 'black');
        }
        

    }

}
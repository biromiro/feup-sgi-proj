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
        this.gamePickables = undefined
        this.graph = graph;
        this.state = states.initial;
        this.selectedTile = null;
        this.componentToTile = {}
        this.timeout = 700;
        this.animTime = 0.5;
        this.turnTime = 45;
        this.fullTime = 300;
        this.currBoard = undefined;
        this.changedObjects = [];
        this.turnMoves = [];
        this.gameMoves = [];
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

        const midAnim = this.graph.camAnimations['overviewGame']
        const targetAnim = this.graph.camAnimations[this.cameras[this.currentPlayer]]
        midAnim.start(this.graph.scene.animTime)
        targetAnim.start(this.graph.scene.animTime + midAnim.duration + this.animTime)
        this.currBoard = undefined
        this.changedObjects = []

        setTimeout(() => {
            this.state = states.playing;
            this.gameInfo[this.currentPlayer].turn = this.turnTime;
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
        this.gamePickables = gamePickables;
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

                this.graph.primitives[id + "_queen"] = new Piece(
                    this.graph.scene,
                    id + "_queen",
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

                this.graph.components[id + "_queen"] = new SceneComponent(
                    id + "_queen",
                    mat4.create(), 
                    [], "none", 
                    [{id: id + "_queen", type: "primitive"}], 
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
    }

    start() {
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
        if (checker.isQueen()){
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

    genClick(object) {
        const clickedObject = this.graph.components[object];
        const keyframes = []
        const currAnimTime = this.graph.scene.animTime;
        keyframes.push(new MyKeyframe(currAnimTime - 1 , mat4.create()));
        keyframes.push(new MyKeyframe(currAnimTime, mat4.create()));
        keyframes.push(new MyKeyframe(currAnimTime + 0.1, mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, -0.0025, 0))));
        keyframes.push(new MyKeyframe(currAnimTime + 0.2, mat4.create()));
        this.graph.animations["button" + clickedObject.id] = new MyKeyframeAnimation(this.graph.scene, keyframes)
        clickedObject.animation = "button" + clickedObject.id;
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

    move(checker, tile) {
        const checkerObject = checker.checkerObject;
        const checkerPickable = checker.clickableObject;
        const tilePickable = tile.clickableObject;

        // remove checker from checkerPickable and add it to tilePickable
        checkerPickable.children = checkerPickable.children.filter(child => child.id !== checkerObject.id);
        tilePickable.children.push({id: checkerObject.id, type: "component"});

        this.changedObjects.unshift({
            type: 'move',
            from: checkerPickable,
            to: tilePickable,
            checker: checkerObject.id
        })
        
        this.board[checker.row][checker.column] = new Tile(checker.row, checker.column, checkerPickable);
       
        if (Math.abs(checker.row - tile.row) === 2) {
            const jumpedChecker = this.board[(checker.row + tile.row) / 2][(checker.column + tile.column) / 2];
            const jumpedCheckerPickable = jumpedChecker.clickableObject;

            jumpedCheckerPickable.children = jumpedCheckerPickable.children.filter(child => child.id !== jumpedChecker.checkerObject.id);
            
            this.changedObjects.unshift({
                from: jumpedCheckerPickable,
                to: null,
                checker: jumpedChecker.checkerObject.id
            })
            
            this.board[jumpedChecker.row][jumpedChecker.column] = new Tile(jumpedChecker.row, jumpedChecker.column, jumpedCheckerPickable);
            checker.addAnimation(this.genAnimation(checker, tile, true));

            this.gameInfo[this.currentPlayer].taken++;
            if (jumpedChecker.isQueen()) this.gameInfo[this.currentPlayer === "black" ? "white" : "black"].queens--;
        } else {
            checker.addAnimation(this.genAnimation(checker, tile, false));
        }

        this.turnMoves.push({
            from: [checker.row, checker.column],
            to: [tile.row, tile.column],
        })

        const newChecker = new Checker(checker.color, tile.row, tile.column, tilePickable, checkerObject, checker.queen);
        this.board[tile.row][tile.column] = newChecker;

        // if checker reached the other side, make it a queen
        if (newChecker.color === 'black' && newChecker.row === 7){
            this.changedObjects.push({
                type: 'queen',
                target: checkerObject
            })
            newChecker.setQueen();
            this.gameInfo['black'].queens++;
        }
        else if (newChecker.color === 'white' && newChecker.row === 0){
            this.changedObjects.push({
                type: 'queen',
                target: checkerObject
            })
            newChecker.setQueen();
            this.gameInfo['black'].queens++;
        }

        return newChecker;
    }

    verifyGameInfo() {
        // checks if the game info is correct and if not, corrects it
        let blackTaken = 12;
        let whiteTaken = 12;
        let blackQueens = 0;
        let whiteQueens = 0;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const tile = this.board[i][j];
                if (tile?.isChecker()) {
                    if (tile.color === "black") {
                        blackTaken--;
                        if (tile.isQueen()) blackQueens++;
                    } else {
                        whiteTaken--;
                        if (tile.isQueen()) whiteQueens++;
                    }
                }
            }
        }

        if (blackTaken !== this.gameInfo.black.taken) this.gameInfo.black.taken = blackTaken;
        if (whiteTaken !== this.gameInfo.white.taken) this.gameInfo.white.taken = whiteTaken;
        if (blackQueens !== this.gameInfo.black.queens) this.gameInfo.black.queens = blackQueens;
        if (whiteQueens !== this.gameInfo.white.queens) this.gameInfo.white.queens = whiteQueens;
    }

    undo(player) {
        this.genClick(`undoButton${player}`)
        if (this.currentPlayer !== player.toLowerCase()) return
        if (!this.currBoard) return
        if (this.state === states.canLock || this.state === states.onCombo) {
            // undo last move
            this.board = this.currBoard;
            this.currBoard = undefined;

            this.changedObjects.forEach(obj => {
                if (obj.type === 'queen') {
                    obj.target.children = [{id: obj.target.id, type: 'primitive'}];
                }
                else if (obj.to) {
                    obj.from.children.push({id: obj.checker, type: "component"});
                    obj.to.children = obj.to.children.filter(child => child.id !== obj.checker);
                } else {
                    obj.from.children.push({id: obj.checker, type: "component"});
                }
            })
            this.changedObjects = [];

            for (let i=0; i<8; i++){
                for (let j=0; j<8; j++){
                    const tile = this.board[i][j];
                    if (!tile) continue;
                    if (tile.isChecker())
                        tile.deselect();
                    else tile.unhighlight();
                }
            }

            this.verifyGameInfo();
            this.selectedTile.removeAnimation();
            this.selectedTile = undefined;
            this.state = states.playing;
        }
    }

    lock(player) {
        this.genClick(`lockButton${player}`)
        if (this.currentPlayer !== player.toLowerCase()) return
        if (this.state === states.canLock || this.state === states.onCombo) {
            setTimeout(() => {
                this.selectedTile.removeAnimation();
                this.selectedTile = undefined;
                this.switchPlayers()
            }, this.timeout);

            for (let i=0; i<8; i++){
                for (let j=0; j<8; j++){
                    const tile = this.board[i][j];
                    if (!tile) continue;
                    if (tile.isChecker())
                        tile.deselect();
                    else tile.unhighlight();
                }
            }

            this.state = states.animating;
            this.gameMoves.push(...this.turnMoves);
        }
    }

    async getGameMovie() {
        if (this.state === states.animating) return;
        const currentState = this.state;
        this.state = states.animating;
        this.init(this.gamePickables);
        await new Promise(resolve => setTimeout(resolve, 2000));
        for (const move of this.gameMoves) {
            console.log("moving" + move)
            const from = this.board[move.from[0]][move.from[1]];
            const to = this.board[move.to[0]][move.to[1]];
            this.move(from, to);
            await new Promise(resolve => setTimeout(resolve, this.animTime * 1000 + 100));
        }
        this.state = currentState;
    }

    play(selected) {
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
                    this.currBoard = this.board.map(row => row?.map(tile => tile?.clone()));
                    this.selectedTile = this.move(this.selectedTile, selectedTile);
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
                this.selectedTile = this.move(this.selectedTile, selectedTile);
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
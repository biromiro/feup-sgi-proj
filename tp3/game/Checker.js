import { Tile } from './Tile.js';

export class Checker extends Tile {
    constructor(color, row, column, clickableObject, checkerObject, queen = false) {
        super(row, column, clickableObject);
        this.color = color;
        this.queen = queen;
        this.checkerObject = checkerObject;
        console.log(this.checkerObject)
    }

    isQueen() {
        return this.queen;
    }

    setQueen() {
        this.queen = true;
        this.checkerObject.children = [{id: this.checkerObject.id.slice(0, -8) + '_queen', type: 'primitive'}];
    }

    isChecker() {
        return true;
    }

    clone() {
        return new Checker(this.color, this.row, this.column, this.clickableObject, this.checkerObject, this.queen);
    }

    select() {
        //this.checkerObject.isHighlighted = true;
        //this.checkerObject.highlighted = {color: [1,0.06,0.02], scale_h: 0}
        this.checkerObject.materials = ['highlighted']
    }

    deselect() {
        //this.checkerObject.isHighlighted = false;
        //this.checkerObject.highlighted = {color: [0.15,0.06,0.02], scale_h: 0}
        this.checkerObject.materials = ['checker_' + this.color]
    }

    warn() {
        this.checkerObject.materials = ['warning']
    }

    unwarn() {
        this.checkerObject.materials = ['checker_' + this.color]
    }

    addAnimation(animation) {
        this.checkerObject.animation = animation
        this.checkerObject.isTargetForLight = true
    }

    removeAnimation() {
        this.checkerObject.animation = undefined
        this.checkerObject.isTargetForLight = undefined
    }
}
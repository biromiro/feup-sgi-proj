import { Tile } from './Tile.js';

export class Checker extends Tile {
    constructor(color, row, column, clickableObject, checkerObject, king = false) {
        super(row, column, clickableObject);
        this.color = color;
        this.king = king;
        this.checkerObject = checkerObject;
    }

    isKing() {
        return this.king;
    }

    setKing() {
        this.king = true;
        this.checkerObject.children = [{id: this.clickableObject.id + '_king', type: 'component'}];
    }

    isChecker() {
        return true;
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

    removeAnimation() {
        this.checkerObject.animation = undefined
    }
}
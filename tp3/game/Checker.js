import { Tile } from './Tile.js';

export class Checker extends Tile {
    constructor(color, row, column, clickableObject, checkerObject) {
        super(row, column, clickableObject);
        this.color = color;
        this.king = false;
        this.checkerObject = checkerObject;
    }

    isKing() {
        return this.king;
    }

    setKing() {
        this.king = true;
    }

    isChecker() {
        return true;
    }

    select() {
        //this.checkerObject.isHighlighted = true;
        //this.checkerObject.highlighted = {color: [1,0.06,0.02], scale_h: 0}
        this.checkerObject.materials = ['highlighted']
    }

    unselect() {
        //this.checkerObject.isHighlighted = false;
        //this.checkerObject.highlighted = {color: [0.15,0.06,0.02], scale_h: 0}
        this.checkerObject.materials = ['checker_' + this.color]
    }
}
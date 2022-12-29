import { Tile } from './Tile.js';

export class Checker extends Tile {
    constructor(color, row, column, clickableObject) {
        super(row, column, clickableObject);
        this.color = color;
        this.king = false;
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
}
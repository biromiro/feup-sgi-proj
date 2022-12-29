export class Tile {
    constructor(row, column, clickableObject) {
        this.row = row;
        this.column = column;
        this.clickableObject = clickableObject;
    }

    isChecker() {
        return false;
    }
}
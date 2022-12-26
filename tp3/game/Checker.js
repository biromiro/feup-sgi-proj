export class Checker {
    constructor(color, row, column) {
        this.color = color;
        this.row = row;
        this.column = column;
        this.king = false;
    }

    isKing() {
        return this.king;
    }

    setKing() {
        this.king = true;
    }
}
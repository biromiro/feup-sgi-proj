export class AuxBoard {
    constructor(clickableObject) {
        this.clickableObject = clickableObject;
        this.pieces = 0;
    }

    clone() {
        return new AuxBoard(this.clickableObject);
    }

}
export class Tile {
    constructor(row, column, clickableObject) {
        this.row = row;
        this.column = column;
        this.clickableObject = clickableObject;
    }

    isChecker() {
        return false;
    }

    highlight() {
        //this.clickableObject.isHighlighted = true;
        //this.clickableObject.highlighted = {color: [0.15,0.06,0.02], scale_h: 0}
        this.clickableObject.materials = ['highlighted']
    }

    unhighlight() {
        //this.clickableObject.isHighlighted = false;
        //this.clickableObject.highlighted = {color: [0.15,0.06,0.02], scale_h: 0}
        this.clickableObject.materials = ['checker']
    }
}
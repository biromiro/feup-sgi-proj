/**
* SceneCamera class, containing camera information
*/

export class SceneCamera {
    constructor(attributes, type, isDefault = false) {
        this.id = attributes.id.value;
        this.type = type;
        this.isDefault = isDefault;
        this.near = attributes.near.value;
        this.far = attributes.far.value;
        this.from = attributes.from;
        this.to = attributes.to;
        
        if (this.type === "perspective") {
            this.angle = attributes.angle.value;   
        } else {
            this.left = attributes.left.value;
            this.right = attributes.right.value;
            this.top = attributes.top.value;
            this.bottom = attributes.bottom.value;
            this.up = attributes.up;
        }
    }
}
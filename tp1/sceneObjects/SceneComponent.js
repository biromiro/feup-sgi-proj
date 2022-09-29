/**
* SceneComponent class, containing component information
*/

export class SceneComponent {

    constructor(id, transformation, materials, texture, children) {
        this.id = id;
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.isNode = true;
    }
}
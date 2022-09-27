/**
* SceneComponent class, containing component information
*/

export class SceneComponent {

    constructor(id, transformations, materials, texture, children) {
        this.id = id;
        this.transformations = transformations;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
    }
}
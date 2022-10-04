/**
* SceneComponent class, containing component information
*/

export class SceneComponent {

    constructor(id, transformation, materials, texture, children) {
        this.id = id;
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture.id;
        this.length_u = texture?.length_u;
        this.length_v = texture?.length_v;
        this.children = children;
        this.isNode = true;
    }
}
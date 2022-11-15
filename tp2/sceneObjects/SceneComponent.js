/**
* SceneComponent class, containing component information
*/

export class SceneComponent {

    constructor(id, transformation, materials, texture, children, highlighted, animation) {
        this.id = id;
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture.id;
        this.length_s = texture?.length_s;
        this.length_t = texture?.length_t;
        this.children = children;
        this.isNode = true;
        this.materialIndex = 0;
        this.highlighted = highlighted;
        this.isHighlighted = false;
        this.animation = animation;
    }

}
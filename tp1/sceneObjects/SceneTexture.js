/**
* SceneTexture class, containing texture information
*/

export class SceneTexture {

    constructor(attributes, img) {
        this.id = attributes.id.value;
        this.texPath =  attributes.file.value;
        this.img = img;
    }
}
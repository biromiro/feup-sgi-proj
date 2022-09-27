/**
* SceneTexture class, containing texture information
*/

export class SceneTexture {

    constructor(id, attributes = {}, img = undefined) {
        this.id = id;
        this.texPath =  attributes.file?.value;
        this.img = img;
    }
}
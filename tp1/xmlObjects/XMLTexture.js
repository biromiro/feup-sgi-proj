/**
* XMLTexture class, containing texture information
*/

export class XMLTexture {

    constructor(attributes, img) {
        this.id = attributes.id.value;
        this.texPath =  attributes.file.value;
        this.img = img;
    }
}
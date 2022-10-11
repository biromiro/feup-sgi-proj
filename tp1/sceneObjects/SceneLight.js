/**
* SceneLight class, containing light information
*/

export class SceneLight {

    constructor(id, type, isEnabled, typeInfo) {
        this.id = id;
        this.isEnabled = isEnabled;
        this.type = type;
        this.typeInfo = typeInfo;
    }

    updateLight() {
        if (this.isEnabled)
            this.light.enable();
        else
            this.light.disable();
        this.light.update();
    }
}
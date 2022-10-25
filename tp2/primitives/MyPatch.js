import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from '../../lib/CGF.js';

export class MyPatch extends CGFobject {
    constructor(scene, degreeU, partsU, degreeV, partsV, controlPoints) {
		super(scene);
        this.nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlPoints);
        this.nurbsObject = new CGFnurbsObject(scene, partsU, partsV, this.nurbsSurface);
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(length_s, length_t) {
        return
	}

    display() {
        this.nurbsObject.display()
    }
}
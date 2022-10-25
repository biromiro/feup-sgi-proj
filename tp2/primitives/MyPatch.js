import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from '../../lib/CGF.js';

export class MyPatch extends CGFobject {
    constructor(scene, degreeU, partsU, degreeV, partsV, controlPoints) {
        this.nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, controlPoints);
        this.nurbsObject = new CGFnurbsObject(scene, partsU, partsV, this.nurbsSurface);
    }
}
/**
* CGFOBJModel
* @constructor
* Basic support for OBJ models. 
* Loads a set of faces defined by vertices positions, texture coordinates and normals.
* Supports triangles and quads.
* Does not support loading materials, or individual meshes/groups (contributions welcome).
*
* based on snippet from https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
* and optimized to reduce vertex duplication
*/

import {CGFOBJModel} from "../CGFOBJModel.js";


export class Piece extends CGFOBJModel {

	constructor(scene, id, parentComponent, queen = false) 
	{
        super(scene, "models/piece.obj");
        this.scene = scene;
        this.id = id;
        this.parentComponent = parentComponent;
        this.queen = queen;
	};

    display() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0.13, 0);
        this.scene.scale(0.018, this.queen ? 0.04 : 0.018, 0.018);
        super.display();
        this.scene.popMatrix();
    }

}
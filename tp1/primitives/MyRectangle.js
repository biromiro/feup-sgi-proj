import { CGFobject } from '../../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2, doubleSided = false) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.doubleSided = doubleSided;
		this.initBuffers();
	}
	
	initBuffers() {
		if (this.doubleSided) {
			this.vertices = [
				this.x1, this.y1, 0,	//0
				this.x2, this.y1, 0,	//1
				this.x1, this.y2, 0,	//2
				this.x2, this.y2, 0,	//3
				this.x1, this.y1, 0,	//4
				this.x2, this.y1, 0,	//5
				this.x1, this.y2, 0,	//6
				this.x2, this.y2, 0		//7
			];

			//Counter-clockwise reference of vertices
			this.indices = [
				0, 1, 2,
				1, 3, 2,
				4, 6, 5,
				5, 6, 7
			];

			//Facing Z positive
			this.normals = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, -1,
				0, 0, -1,
				0, 0, -1,
				0, 0, -1
			];


		} else {
			this.vertices = [
				this.x1, this.y1, 0,	//0
				this.x2, this.y1, 0,	//1
				this.x1, this.y2, 0,	//2
				this.x2, this.y2, 0		//3
			]

			//Counter-clockwise reference of vertices
			this.indices = [
				0, 1, 2,
				1, 3, 2
			];

			//Facing Z positive
			this.normals = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1
			];

		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
     updateTexCoords(length_u, length_v) {

        if (this.doubleSided) {
			this.texCoords = [
				0, length_v,
				length_u, length_v,
				0, 0,
				length_u, 0,
				0, length_v,
				length_u, length_v,
				0, 0,
				length_u, 0
			]
		} else {
			this.texCoords = [
				0, length_v,
				length_u, length_v,
				0, 0,
				length_u, 0
			]
		}

		this.updateTexCoordsGLBuffers();
	}
}


import { CGFobject } from '../../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene);
		this.id = id;
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.initBuffers();
	}

	copy () {
        return new MyRectangle(this.scene, this.id, this.x1, this.x2, this.y1, this.y2, this.doubleSided)
    }
	
	initBuffers() {

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

		

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
     updateTexCoords(length_s, length_t) {

		const x_diff = this.x2 - this.x1;
		const y_diff = this.y2 - this.y1;

		this.texCoords = [
			0, y_diff / length_t,
			x_diff / length_s, y_diff / length_t,
			0, 0,
			x_diff / length_s, 0
		]

		this.updateTexCoordsGLBuffers();
	}
}

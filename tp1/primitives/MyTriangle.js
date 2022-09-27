import { CGFobject } from '../../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
        this.x3 = x3;
		this.y1 = y1;
		this.y2 = y2;
        this.y3 = y3;
        this.z1 = z1;
        this.z2 = z2;
        this.z3 = z3;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
            this.x1, this.y1, this.z1,	//3
			this.x2, this.y2, this.z2,	//4
			this.x3, this.y3, this.z3,	//5
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
            2, 1, 0
		];

        // cross([a1,a2,a3], [b1,b2,b3]) =  [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1]
        const v1 = [this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1]
        const v2 = [this.x2 - this.x3, this.y2 - this.y3, this.z2 - this.z3]
        const normal =  [v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]]

           // normalization
        let nsize = Math.sqrt(
            normal[0] * normal[0] +
            normal[1] * normal[1] +
            normal[2] * normal[2]
        );

        normal[0] /= nsize;
        normal[1] /= nsize;
        normal[2] /= nsize;

        const negNormal = normal.map((val) => -val);

        this.normals = [
            ...normal,
            ...normal,
            ...normal,
            ...negNormal,
            ...negNormal,
            ...negNormal
        ]
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		/*this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		]*/
        this.enableNormalViz();
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
        console.log(this.normals);
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

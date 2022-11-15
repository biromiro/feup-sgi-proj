import {CGFobject} from '../../lib/CGF.js';

export class MySphere extends CGFobject {
  /**
   * @method constructor
   * @param  {CGFscene} scene - MyScene object
   * @param  {integer} slices - number of slices around Y axis
   * @param  {integer} stacks - number of stacks along Y axis, from the center to the poles (half of sphere)
   */
  constructor(scene, radius, slices, stacks) {
    super(scene);
    this.radius = radius
    this.latDivs = stacks * 2;
    this.longDivs = slices;

    this.initBuffers();
  }

  /**
   * @method initBuffers
   * Initializes the sphere buffers
   */
  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    let phi = 0;
    const phiInc = Math.PI / this.latDivs;
    const thetaInc = (2 * Math.PI) / this.longDivs;
    const latVertices = this.longDivs + 1;

    // build an all-around stack at a time, starting on "north pole" and proceeding "south"
    for (let latitude = 0; latitude <= this.latDivs; latitude++) {
      let sinPhi = Math.sin(phi);
      let cosPhi = Math.cos(phi);

      // in each stack, build all the slices around, starting on longitude 0
      let theta = 0;
      for (let longitude = 0; longitude <= this.longDivs; longitude++) {
        //--- Vertices coordinates
        const x = Math.cos(theta) * sinPhi * this.radius;
        const y = cosPhi * this.radius;
        const z = Math.sin(-theta) * sinPhi * this.radius;
        this.vertices.push(x, y, z);

        //--- Indices
        if (latitude < this.latDivs && longitude < this.longDivs) {
          const current = latitude * latVertices + longitude;
          const next = current + latVertices;
          // pushing two triangles using indices from this round (current, current+1)
          // and the ones directly south (next, next+1)
          // (i.e. one full round of slices ahead)

          this.indices.push( current + 1, current, next);
          this.indices.push( current + 1, next, next +1);
        }

        //--- Normals
        // at each vertex, the direction of the normal is equal to
        // the vector from the center of the sphere to the vertex.
        // in a sphere of radius equal to one, the vector length is one.
        // therefore, the value of the normal is equal to the position vector

        let normal = [x, y, z];

        // normalization
        var nsize = Math.sqrt(
          normal[0] * normal[0] +
          normal[1] * normal[1] +
          normal[2] * normal[2]
        );

        normal[0] /= nsize;
        normal[1] /= nsize;
        normal[2] /= nsize;

        this.normals.push(...normal);
        theta += thetaInc;

        //--- Texture Coordinates
        this.texCoords.push(longitude / this.longDivs, latitude / this.latDivs);

      }
      phi += phiInc;
    }


    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  
	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(length_s, length_t) {
    return
	}
}

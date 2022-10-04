import { CGFobject } from '../../lib/CGF.js';

export class MyTorus extends CGFobject {
    constructor(scene, id, radius, innerRadius, slices, loops) {
        super(scene);
        this.radius = radius
        this.innerRadius = innerRadius
        this.slices = slices;
        this.loops = loops;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        //Parametric equations
        //x(ang,outerAng)= (radius + inner_radius*cos(outerAng)) cos(ang)
        //y(ang,outerAng)= (radius + inner_radius*cos(outerAng)) sin(ang)
        //z(ang,outerAng)= inner_radius * sin(outerAng)

        let ang = 0, outerAng = 0;
        const alphaAng = 2 * Math.PI / this.slices;
        const outerAlphaAng = 2 * Math.PI / this.loops;

        for (let loop = 0; loop <= this.loops; ++loop) {
            const s = loop / this.loops;
            ang = 0

            for (let innerSlice = 0; innerSlice <= this.slices; ++innerSlice) {
                const t = innerSlice / this.slices;

                const x = (this.radius + this.innerRadius * Math.cos(outerAng)) * Math.cos(ang);
                const y = (this.radius + this.innerRadius * Math.cos(outerAng)) * Math.sin(ang);
                const z = this.innerRadius * Math.sin(outerAng);

                this.vertices.push(x, y, z);

            
                let normal = [
                    x - (this.radius) * Math.cos(ang),
                    y - (this.radius) * Math.sin(ang),
                    z
                ];
                
                const nsize = Math.sqrt(
                    normal[0] * normal[0] +
                    normal[1] * normal[1] +
                    normal[2] * normal[2]
                );

                normal[0] /= nsize;
                normal[1] /= nsize;
                normal[2] /= nsize;

                this.normals.push(...normal);

                this.texCoords.push(t);
                this.texCoords.push(s);

                if (loop != this.loops && innerSlice != this.slices) {
                    this.indices.push(loop * (this.slices + 1) + innerSlice);
                    this.indices.push(loop * (this.slices + 1) + innerSlice + 1);
                    this.indices.push(((loop + 1) * (this.slices + 1) + innerSlice));

                    this.indices.push(((loop + 1) * (this.slices + 1) + innerSlice));
                    this.indices.push(loop * (this.slices + 1) + innerSlice + 1);
                    this.indices.push((loop + 1) * (this.slices + 1) + innerSlice + 1);
                }

                ang += alphaAng
            }
            outerAng += outerAlphaAng
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
		this.updateTexCoordsGLBuffers();
	}
}

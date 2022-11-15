import { CGFobject } from '../../lib/CGF.js';

export class MyCylinder extends CGFobject {
    constructor(scene, id, baseRadius, upperRadius, height, slices, stacks) {
        super(scene);
        this.baseRadius = baseRadius;
        this.upperRadius = upperRadius;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.id = id;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let radiusDiff = (this.upperRadius - this.baseRadius) / this.stacks;
        let currentRadius = this.baseRadius;
        for (var stack = 0; stack < this.stacks; stack++) {
        
            var ang = 0;
            var alphaAng = 2 * Math.PI / this.slices;
            const lowerStackBound = (2 * this.slices + 2) * stack;

            const nextStackRadius = currentRadius + radiusDiff;
            var ta = Math.atan((this.baseRadius - this.upperRadius) / this.height)

            for (var slice = 0; slice < this.slices; slice++) {
                // All vertices have to be declared for a given face
                // even if they are shared with others, as the normals 
                // in each face will be different
    
                var sa = Math.sin(ang);
                var ca = Math.cos(ang);
    
                this.vertices.push(currentRadius * ca, -currentRadius * sa, stack * (this.height / this.stacks));
                this.vertices.push(nextStackRadius * ca, -nextStackRadius * sa, (stack + 1) * (this.height / this.stacks));
                // triangle normal computed by cross product of two edges
                var normal = [
                    ca, -sa, ta, 
                ];
    
                // normalization
                var nsize = Math.sqrt(
                    normal[0] * normal[0] +
                    normal[1] * normal[1] +
                    normal[2] * normal[2]
                );

                normal[0] /= nsize;
                normal[1] /= nsize;
                normal[2] /= nsize;
    
                // push normal once for each vertex of this triangle
                this.normals.push(...normal);
                this.normals.push(...normal);

                this.indices.push(0 + 2 * slice + lowerStackBound, 1 + 2 * slice + lowerStackBound, 2 + 2 * slice + lowerStackBound)
                this.indices.push(1 + 2 * slice + lowerStackBound, 3 + 2 * slice + lowerStackBound, 2 + 2 * slice + lowerStackBound)
                    
                this.texCoords.push(1 - slice / this.slices, 1 - stack / this.stacks)
                this.texCoords.push(1 - slice / this.slices, 1 - (stack + 1) / this.stacks)


                ang += alphaAng;
            }
            this.vertices.push(currentRadius , 0, stack * (this.height / this.stacks));
            this.vertices.push(nextStackRadius, 0, (stack + 1) * (this.height / this.stacks));

            //this.indices.push(0 + 2 * this.slices + lowerStackBound, 1 + 2 * this.slices + lowerStackBound, 2 + 2 * this.slices + lowerStackBound)
            //this.indices.push(1 + 2 * this.slices + lowerStackBound, 3 + 2 * this.slices + lowerStackBound, 2 + 2 * this.slices + lowerStackBound)

            // push normal once for each vertex of this triangle
            this.normals.push(...[1, ta, 0]);
            this.normals.push(...[1, ta, 0]);

            this.texCoords.push(0, 1 - stack / this.stacks)
            this.texCoords.push(0, 1 - (stack + 1) / this.stacks)


            currentRadius += radiusDiff;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    /**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - changes number of slices
     */
    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
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

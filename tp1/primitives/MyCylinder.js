import { CGFobject } from '../../lib/CGF.js';

export class MyCylinder extends CGFobject {
    constructor(scene, id, baseRadius, upperRadius, height, slices, stacks) {
        super(scene);
        this.baseRadius = baseRadius;
        this.upperRadius = upperRadius;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
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
            const lowerStackBound = (2 * this.slices) * stack;

            const nextStackRadius = currentRadius + radiusDiff;

            for (var i = 0; i < this.slices; i++) {
                // All vertices have to be declared for a given face
                // even if they are shared with others, as the normals 
                // in each face will be different
    
                var sa = Math.sin(ang);
                var ca = Math.cos(ang);
                var ta = Math.atan((this.baseRadius - this.upperRadius) / this.height)
    
                this.vertices.push(currentRadius * ca, -currentRadius * sa, stack * (this.height / this.stacks));
                this.vertices.push(nextStackRadius * ca, -nextStackRadius * sa, (stack + 1) * (this.height / this.stacks));
                // triangle normal computed by cross product of two edges
                var normal = [
                    ca, -sa, ta
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

                if (i == this.slices - 1) continue;

                this.indices.push(0 + 2 * i + lowerStackBound, 1 + 2 * i + lowerStackBound, 2 + 2 * i + lowerStackBound)
                this.indices.push(1 + 2 * i + lowerStackBound, 3 + 2 * i + lowerStackBound, 2 + 2 * i + lowerStackBound)
    
                ang += alphaAng;

            }

            this.indices.push(2 * (this.slices - 1) + lowerStackBound, 1 + 2 * (this.slices - 1) + lowerStackBound, lowerStackBound)
            this.indices.push(1 + 2 * (this.slices - 1) + lowerStackBound, 1 + lowerStackBound, lowerStackBound)

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
     updateTexCoords(length_u, length_v) {
        for (var stack = 0; stack < this.stacks; stack++) {
            for (var i = 0; i < this.slices; i++) {
                this.texCoords.push(i / (this.slices * length_u), stack / (this.stacks * length_v))
                this.texCoords.push(i / (this.slices * length_u), 0)
            }
        }

		this.updateTexCoordsGLBuffers();
	}
}

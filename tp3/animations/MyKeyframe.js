/**
* MyKeyframe class, containing keyframe information
*/

export class MyKeyframe {

    constructor(instant, transfMatrix) {
        this.instant = instant;
        this.transfMatrix = transfMatrix;
        this.rotationQuat = this.getRotation(transfMatrix);
        this.scalingVec3 = this.getScaling(transfMatrix);
        this.translationVec3 = this.getTranslation(transfMatrix);
    }

    getTranslation(mat) {
        const out = vec3.create();
        out[0] = mat[12];
        out[1] = mat[13];
        out[2] = mat[14];
        return out;
    }

    getScaling(mat) {
        const out = vec3.create();

        let m11 = mat[0];
        let m12 = mat[1];
        let m13 = mat[2];
        let m21 = mat[4];
        let m22 = mat[5];
        let m23 = mat[6];
        let m31 = mat[8];
        let m32 = mat[9];
        let m33 = mat[10];

        out[0] = Math.hypot(m11, m12, m13);
        out[1] = Math.hypot(m21, m22, m23);
        out[2] = Math.hypot(m31, m32, m33);

        return out;
    }

    getRotation(mat) {
        const out = quat.create();
        const scaling = this.getScaling(mat);

        const is1 = 1 / scaling[0];
        const is2 = 1 / scaling[1];
        const is3 = 1 / scaling[2];

        const sm11 = mat[0] * is1;
        const sm12 = mat[1] * is2;
        const sm13 = mat[2] * is3;
        const sm21 = mat[4] * is1;
        const sm22 = mat[5] * is2;
        const sm23 = mat[6] * is3;
        const sm31 = mat[8] * is1;
        const sm32 = mat[9] * is2;
        const sm33 = mat[10] * is3;

        const trace = sm11 + sm22 + sm33;
        let S = 0;

        if (trace > 0) {

            S = Math.sqrt(trace + 1.0) * 2;
            out[3] = 0.25 * S;
            out[0] = (sm23 - sm32) / S;
            out[1] = (sm31 - sm13) / S;
            out[2] = (sm12 - sm21) / S;

        } else if (sm11 > sm22 && sm11 > sm33) {

            S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
            out[3] = (sm23 - sm32) / S;
            out[0] = 0.25 * S;
            out[1] = (sm12 + sm21) / S;
            out[2] = (sm31 + sm13) / S;

        } else if (sm22 > sm33) {

            S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
            out[3] = (sm31 - sm13) / S;
            out[0] = (sm12 + sm21) / S;
            out[1] = 0.25 * S;
            out[2] = (sm23 + sm32) / S;

        } else {

            S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
            out[3] = (sm12 - sm21) / S;
            out[0] = (sm31 + sm13) / S;
            out[1] = (sm23 + sm32) / S;
            out[2] = 0.25 * S;
        }

        return out;
    }

    fromRotationTranslationScale(q, v, s) {

        const out = mat4.create();
        let x = q[0],
            y = q[1],
            z = q[2],
            w = q[3];

        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;
        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;

        let sx = s[0];
        let sy = s[1];
        let sz = s[2];

        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;
        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;
        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;

        return out;

    }

    getTransformationMatrix(prevKeyframe, t_percentage) {
        let rotationPrevQuat = this.getRotation(mat4.create());
        let scalingPrevVec3 = this.getScaling(mat4.create());
        let translationPrevVec3 = this.getTranslation(mat4.create());

        if (prevKeyframe) {
            rotationPrevQuat = prevKeyframe.rotationQuat;
            scalingPrevVec3 = prevKeyframe.scalingVec3;
            translationPrevVec3 = prevKeyframe.translationVec3;
        }

        let currentRotationQuat = quat.create(), currentScalingVec3 = vec3.create(), currentTranslationVec3 = vec3.create();
        quat.slerp(currentRotationQuat, rotationPrevQuat, this.rotationQuat, t_percentage);
        vec3.lerp(currentScalingVec3, scalingPrevVec3, this.scalingVec3, t_percentage);
        vec3.lerp(currentTranslationVec3, translationPrevVec3, this.translationVec3, t_percentage);
        return this.fromRotationTranslationScale(currentRotationQuat, currentTranslationVec3, currentScalingVec3);
    }

}
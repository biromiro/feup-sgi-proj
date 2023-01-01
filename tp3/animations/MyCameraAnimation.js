/**
* MyCameraAnimation class, containing camera animation information
*/

import { MyAnimation } from "./MyAnimation.js";
import { MyKeyframe } from "./MyKeyframe.js"

export class MyCameraAnimation extends MyAnimation {

    constructor(scene, camera, targetCamera, duration) {
        super(scene);
        this.currCamera = camera;
        this.targetCamera = targetCamera;
        this.duration = duration;
        this.ongoing = false;
        console.log(this.currCamera)

    }

    start(currTime) {
        this.startTime = currTime;
        this.endTime = currTime + this.duration;
        this.currPosition = this.currCamera.position;
    }

    update(t) {
        if (t > this.endTime && this.ongoing) {
            this.currCamera.setPosition(this.targetCamera.position);
            this.ongoing = false;
            return;
        }

        if (!this.startTime || t < this.startTime || t > this.endTime){
            this.ongoing = false;
            return
        }

        let delta = (t - this.startTime) / (this.endTime - this.startTime);

        let pos = this.currCamera.position;
        let newPos = this.targetCamera.position;

        let x = pos[0] + (newPos[0] - pos[0]) * delta;
        let y = pos[1] + (newPos[1] - pos[1]) * delta;
        let z = pos[2] + (newPos[2] - pos[2]) * delta;
        
        this.currPosition = [x, y, z];

        let target = this.currCamera.target;
        let newTarget = this.targetCamera.target;

        let xT = target[0] + (newTarget[0] - target[0]) * delta;
        let yT = target[1] + (newTarget[1] - target[1]) * delta;
        let zT = target[2] + (newTarget[2] - target[2]) * delta;

        this.currTarget = [xT, yT, zT];

        let up = this.currCamera._up;
        let newUp = this.targetCamera._up;

        let xU = up[0] + (newUp[0] - up[0]) * delta;
        let yU = up[1] + (newUp[1] - up[1]) * delta;
        let zU = up[2] + (newUp[2] - up[2]) * delta;

        this._currUp = [xU, yU, zU];

        this.currFov = this.currCamera.fov + (this.targetCamera.fov - this.currCamera.fov) * delta;
        this.currNear = this.currCamera.near + (this.targetCamera.near - this.currCamera.near) * delta;
        this.currFar = this.currCamera.far + (this.targetCamera.far - this.currCamera.far) * delta;

        this.ongoing = true;
    }

    apply() {
        if (!this.ongoing) return;

        this.currCamera.fov = this.currFov;
        this.currCamera.near = this.currNear;
        this.currCamera.far = this.currFar;
        this.currCamera._up = this._currUp;
        this.currCamera.setTarget(vec3.fromValues(...this.currTarget));
        this.currCamera.setPosition(vec3.fromValues(...this.currPosition));

    }
}
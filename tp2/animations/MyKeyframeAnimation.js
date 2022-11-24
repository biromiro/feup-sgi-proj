/**
* MyKeyframeAnimation class, containing keyframe animation information
*/

import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {

    constructor(scene, keyframes) {
        super(scene);
        this.keyframes = keyframes;
        this.instants = this.keyframes.map(keyframe => keyframe.instant);
        this.currentTime = 0;
        this.prevKeyframeInitialTime = 0;
        this.currentIndex = 0;
        this.isActive = false;
    }

    update(t) {
        if (this.currentTime >= this.instants.at(-1)) return;

        if (!this.isActive && t > this.instants.at(0))
            this.isActive = true;

        while (this.instants[this.currentIndex] < t && this.currentIndex < this.instants.length) {
            this.prevKeyframeInitialTime = this.instants[this.currentIndex++]
        }
        this.currentTime = t;
    }

    apply(scene) {
        let percentage = 1;

        if (this.currentTime < this.instants.at(-1)) {
            percentage =
                (this.currentTime - this.prevKeyframeInitialTime) /
                (this.instants[this.currentIndex] - this.prevKeyframeInitialTime);
        }

        const prevKeyframe = this.keyframes[this.currentIndex - 1]
        const transfMatrix = this.keyframes[this.currentIndex].getTransformationMatrix(prevKeyframe, percentage)
        scene.multMatrix(transfMatrix)
    }
}
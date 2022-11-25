/**
* MyKeyframeAnimation class, containing keyframe animation information
*/

import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {

    constructor(scene, keyframes, loop = false) {
        super(scene);
        this.keyframes = keyframes;
        this.loop = loop;
        this.loops = 0;
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
        if (t / this.instants.at(-1) >= this.loops) {
            this.loops++;
            this.currentIndex = 0;
        }
        let t_ = this.loop ? t % this.instants.at(-1) : t;
        console.log(t_, this.currentIndex)
        while (this.instants[this.currentIndex] < t_ && this.currentIndex < this.instants.length) {
            this.prevKeyframeInitialTime = this.instants[this.currentIndex++]
        }

        this.currentTime = t_;
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
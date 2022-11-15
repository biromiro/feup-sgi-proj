/**
* MyKeyframeAnimation class, containing keyframe animation information
*/

import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {

    constructor(scene, keyframes) {
        super(scene);
        this.keyframes = keyframes;
        this.instants = this.keyframes.map(keyframe => keyframe.instant);
    }

    update(t) {

    }

    apply() {

    }
}
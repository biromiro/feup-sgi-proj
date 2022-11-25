import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';
import { SceneLight } from './sceneObjects/SceneLight.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();

        return true;
    }

    setCameraDropdown() {
        this.gui.add(this.scene.graph, 'currentView', Object.keys(this.scene.graph.views)).name('Camera').onChange(this.scene.graph.updateCamera.bind(this.scene.graph));
    }

    setLightCheckboxes() {

        let f0 = this.gui.addFolder('Lights')
        for (let lightID in this.scene.graph.lights) {
            let light = this.scene.graph.lights[lightID];
            f0.add(light, 'isEnabled').name(lightID).onChange(light.updateLight.bind(light));
        }
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}
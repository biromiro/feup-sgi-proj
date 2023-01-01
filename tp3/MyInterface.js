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
        this.lockedLights = ['trackingLight'];
        this.lockedCameras = ['player1', 'player2', 'overviewGame'];
        return true;
    }

    setCameraDropdown() {
        this.gui.add(this.scene.graph, 'currentView', Object.keys(this.scene.graph.views).filter(
            view => !this.lockedCameras.includes(view)
        )).name('Camera').onChange(this.scene.graph.updateCamera.bind(this.scene.graph));
    }

    setGameMovie() {
        this.gui.add(this.scene.graph.game, 'getGameMovie').name('Watch Game Movie')
    }

    setLightCheckboxes() {

        let f0 = this.gui.addFolder('Lights')
        for (let lightID in this.scene.graph.lights) {
            if (this.lockedLights.includes(lightID)) continue
            let light = this.scene.graph.lights[lightID];
            const field = f0.add(light, 'isEnabled').name(lightID);
            field.onChange(() => {
                light.updateLight.bind(light);
                light.updateLight();
                this.scene.setShaderLights.bind(this.scene);
                this.scene.setShaderLights();
            });
        }
    }

    setShaderCheckboxes() {
        let f0 = this.gui.addFolder('Highlighted Components');
        for (let componentID of this.scene.graph.highlightedComponents) {
            let component = this.scene.graph.components[componentID];
            f0.add(component, 'isHighlighted').name(componentID);
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
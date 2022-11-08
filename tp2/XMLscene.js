import { CGFscene, CGFshader } from '../lib/CGF.js';
import { CGFaxis, CGFcamera } from '../lib/CGF.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();
        this.nightMode = false;
        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        this.shader = new CGFshader(this.gl, "shaders/pulse.vert", "shaders/pulse.frag");

        this.shader.setUniformsValues({ timeFactor: 0, normScale: 1 });

        this.setUpdatePeriod(50);
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        let i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (let key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            let light = this.graph.lights[key];

            this.lights[i].setPosition(...light.typeInfo.location);
            this.lights[i].setAmbient(...light.typeInfo.ambient);
            this.lights[i].setDiffuse(...light.typeInfo.diffuse);
            this.lights[i].setSpecular(...light.typeInfo.specular);

            if (light.type == "spot") {
                this.lights[i].isSpot = true;
                this.lights[i].setSpotCutOff(light.typeInfo.angle);
                this.lights[i].setSpotExponent(light.typeInfo.exponent);

                let x1, x2, y1, y2, z1, z2, dx, dy, dz;
                [x1, y1, z1] = light.typeInfo.location;
                [x2, y2, z2] = light.typeInfo.targetLight;
                [dx, dy, dz] = [x2 - x1, y2 - y1, z2 - z1];

                const norm = Math.sqrt(dx * dx + dy * dy + dz * dz);
                this.lights[i].setSpotDirection(dx / norm, dy / norm, dz / norm);
            } else this.lights[i].isSpot = false;

            if (light.typeInfo.attenuation != undefined) {
                const { constant, linear, quadratic } = light.typeInfo.attenuation

                this.lights[i].setConstantAttenuation(constant)
                this.lights[i].setLinearAttenuation(linear)
                this.lights[i].setQuadraticAttenuation(quadratic)

            }
            console.log(this.lights[i])

            this.lights[i].setVisible(true);
            if (light.isEnabled) {
                this.lights[i].enable();
            } else
                this.lights[i].disable();

            this.lights[i].update();
            light.light = this.lights[i];
            i++;
        }


        this.interface.setLightCheckboxes();
        this.setShaderLights();
    }

    setShaderLights() {
        console.log('changing lights', !this.lights[0].enabled)

        const lights = [];

        for (let i = 0; i < 8; i++) {

            const light = {
                isDisabled: !this.lights[i].enabled,
                isSpot: this.lights[i].isSpot,
                ambient: vec4.fromValues(...this.lights[i].ambient),
                diffuse: vec4.fromValues(...this.lights[i].diffuse),
                specular: vec4.fromValues(...this.lights[i].specular),
                position: vec3.fromValues(...this.lights[i].position),
                direction: vec3.fromValues(...this.lights[i].spot_direction),
                constant: this.lights[i].constant_attenuation,
                linear: this.lights[i].linear_attenuation,
                quadratic: this.lights[i].quadratic_attenuation
            }

            lights.push(light);
        }

        this.shader.setUniformsValues({
            "lights": lights
        });
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.sceneInited = true;
    }

    update(t) {
        // Dividing the time by 100 "slows down" the variation (i.e. in 100 ms timeFactor increases 1 unit).
        // Doing the modulus (%) by 100 makes the timeFactor loop between 0 and 99
        // ( so the loop period of timeFactor is 100 times 100 ms = 10s ; the actual animation loop depends on how timeFactor is used in the shader )
        this.shader.setUniformsValues({ timeFactor: t / 250 % 157 });
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        if (this.camera) {
            this.updateProjectionMatrix();
            this.loadIdentity();

            // Apply transformations corresponding to the camera position relative to the origin
            this.applyViewMatrix();
        }

        this.pushMatrix();
        //this.axis.display();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(false);
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}
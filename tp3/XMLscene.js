import { CGFscene, CGFshader, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { CGFaxis, CGFcamera } from '../lib/CGF.js';
import { MyRectangle } from './primitives/MyRectangle.js';
import { MySphere } from './primitives/MySphere.js';
import { MyPatch } from './primitives/MyPatch.js';

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

        this.texture = null;
		this.appearance = null;
		this.textShader = null;
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
        this.updatePeriod = 50;
        this.setUpdatePeriod(this.updatePeriod);
        this.instant = 0;
        this.startTime = null;
        this.count = 0;
        this.setPickEnabled(true);

        this.appearance = new CGFappearance(this);

		// font texture: 16 x 16 characters
		// http://jens.ayton.se/oolite/files/font-tests/rgba/oolite-font.png
		this.fontTexture = new CGFtexture(this, "scenes/images/font_spritesheet.png");
		this.appearance.setTexture(this.fontTexture);
		
		// instatiate text shader (used to simplify access via row/column coordinates)
		// check the two files to see how it is done
		this.textShader=new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");

		// set number of rows and columns in font texture
		this.textShader.setUniformsValues({'dims': [16, 16]});

        this.charMap = {
            ' ': [0, 2],
            '!': [1, 2],
            '"': [2, 2],
            '#': [3, 2],
            '$': [4, 2],
            '%': [5, 2],
            '&': [6, 2],
            '\'': [7, 2],
            '(': [8, 2],
            ')': [9, 2],
            '*': [10, 2],
            '+': [11, 2],
            ',': [12, 2],
            '-': [13, 2],
            '.': [14, 2],
            '/': [15, 2],
            '0': [0, 3],
            '1': [1, 3],
            '2': [2, 3],
            '3': [3, 3],
            '4': [4, 3],
            '5': [5, 3],
            '6': [6, 3],
            '7': [7, 3],
            '8': [8, 3],
            '9': [9, 3],
            ':': [10, 3],
            ';': [11, 3],
            '<': [12, 3],
            '=': [13, 3],
            '>': [14, 3],
            '?': [15, 3],
            '@': [0, 4],
            'A': [1, 4],
            'B': [2, 4],
            'C': [3, 4],
            'D': [4, 4],
            'E': [5, 4],
            'F': [6, 4],
            'G': [7, 4],
            'H': [8, 4],
            'I': [9, 4],
            'J': [10, 4],
            'K': [11, 4],
            'L': [12, 4],
            'M': [13, 4],
            'N': [14, 4],
            'O': [15, 4],
            'P': [0, 5],
            'Q': [1, 5],
            'R': [2, 5],
            'S': [3, 5],
            'T': [4, 5],
            'U': [5, 5],
            'V': [6, 5],
            'W': [7, 5],
            'X': [8, 5],
            'Y': [9, 5],
            'Z': [10, 5],
            '[': [11, 5],
            '\\': [12, 5],
            ']': [13, 5],
            '^': [14, 5],
            '_': [15, 5],
            '`': [0, 6],
            'a': [1, 6],
            'b': [2, 6],
            'c': [3, 6],
            'd': [4, 6],
            'e': [5, 6],
            'f': [6, 6],
            'g': [7, 6],
            'h': [8, 6],
            'i': [9, 6],
            'j': [10, 6],
            'k': [11, 6],
            'l': [12, 6],
            'm': [13, 6],
            'n': [14, 6],
            'o': [15, 6],
            'p': [0, 7],
            'q': [1, 7],
            'r': [2, 7],
            's': [3, 7],
            't': [4, 7],
            'u': [5, 7],
            'v': [6, 7],
            'w': [7, 7],
            'x': [8, 7],
            'y': [9, 7],
            'z': [10, 7],
            '{': [11, 7],
            '|': [12, 7],
            '}': [13, 7],
            '~': [14, 7]
        };

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

            if (key == "trackingLight") this.trackingLight = this.lights[i];

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

        const lights = [];

        for (let i = 0; i < 8; i++) {

            const light = {
                position: this.lights[i].position,
                enabled: this.lights[i].enabled,
                ambient: vec4.fromValues(...this.lights[i].ambient),
                diffuse: vec4.fromValues(...this.lights[i].diffuse),
                specular: vec4.fromValues(...this.lights[i].specular),
                spot_direction: vec3.fromValues(...this.lights[i].spot_direction),
                spot_exponent: this.lights[i].spot_exponent,
                spot_cutoff: this.lights[i].spot_cutoff,
                constant_attenuation: this.lights[i].constant_attenuation,
                linear_attenuation: this.lights[i].linear_attenuation,
                quadratic_attenuation: this.lights[i].quadratic_attenuation
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
        if (this.sceneInited) {

            if (this.startTime == null)
                this.startTime = t;


            let t_sine = ((t - this.startTime) / 10) % 314;
            const timeFactor = (1.0 + Math.sin(2.0 * t_sine * 0.02)) / 2.0;
            this.shader.setUniformsValues({ timeFactor: timeFactor });
            this.instant += this.updatePeriod;
            this.animTime = this.instant * 0.001;
            this.graph.updateAnimations(this.animTime);

            this.count++
            if (this.count == 20) {
                this.count = 0
                this.graph.game.update()
            }
            
        }

    }

    drawText() {
        this.appearance.apply();

        		// activate shader for rendering text characters
        this.setActiveShader(this.textShader);

        this.pushMatrix();

        // 	Reset transf. matrix to draw independent of camera
            this.loadIdentity();

            this.rotate(-Math.PI, 0, 0, 1);
            // transform as needed to place on screen
            this.translate(-4,1,-5);

            // set character to display to be in the Nth column, Mth line (0-based)
            // the shader will take care of computing the correct texture coordinates 
            // of that character inside the font texture (check shaders/font.vert )
            // Homework: This should be wrapped in a function/class for displaying a full string

            this.activeShader.setUniformsValues({'charCoords': this.charMap['B']});	// S
            this.graph?.primitives['letter'].display();

            this.translate(1,0,0);
            this.activeShader.setUniformsValues({'charCoords': [7,4]});	// G
            this.graph?.primitives['letter'].display();

            this.translate(1,0,0);
            this.activeShader.setUniformsValues({'charCoords': [9,4]}); // I
            this.graph?.primitives['letter'].display();
    
        this.popMatrix()
        this.setActiveShader(this.defaultShader);



    }

    /**
     * Displays the scene.
     */
    display() {
        this.graph.logPicking();

		// this resets the picking buffer (association between objects and ids)
		this.clearPickRegistration();

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
            
            //this.drawText();
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
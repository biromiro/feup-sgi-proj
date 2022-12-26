import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { MyCylinder } from './primitives/MyCylinder.js';
import { MyRectangle } from './primitives/MyRectangle.js';
import { MySphere } from './primitives/MySphere.js';
import { MyTorus } from './primitives/MyTorus.js';
import { MyTriangle } from './primitives/MyTriangle.js';
import { SceneComponent } from './sceneObjects/SceneComponent.js';
import { SceneLight } from './sceneObjects/SceneLight.js';

const DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
const SCENE_INDEX = 0;
const VIEWS_INDEX = 1;
const AMBIENT_INDEX = 2;
const LIGHTS_INDEX = 3;
const TEXTURES_INDEX = 4;
const MATERIALS_INDEX = 5;
const TRANSFORMATIONS_INDEX = 6;
const PRIMITIVES_INDEX = 7;
const COMPONENTS_INDEX = 8;

// Possible primitive types.
const POSSIBLE_PRIMITIVES = ['rectangle', 'triangle', 'cylinder', 'sphere', 'torus'];

// Possible image types.
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const axisCoords = {x : [1, 0, 0], y : [0, 1, 0], z : [0, 0, 1]};

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        // File reading 
        this.reader = new CGFXMLreader();

        this.changingMaterials = false;

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        const rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        const error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        const nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        const nodeNames = [];

        for (const node of nodes) {
            nodeNames.push(node.nodeName);
        }

        // Processes each node, verifying errors.
        
        let index;
        let error;

        // <scene>
        
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        const root = this.reader.getString(sceneNode, 'root');
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        const axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        this.views = {};
        const views = viewsNode.children;
        this.defaultView = viewsNode.attributes.default.value;
        
        if (!this.defaultView)
            this.defaultView = views[0].attributes.id;

        this.currentView = this.defaultView;

        for (const view of views) {
            if (view.nodeName !== "perspective" && view.nodeName !== "ortho") {
                this.onXMLMinorError("unknown tag <" + view.nodeName + ">");
                continue;
            }
            
            const attributes = view.attributes;
            
            if (attributes.id.value == null)
                return "no ID defined for view";
            
            if (attributes.id.value == "inherit" || attributes.id.value == "none")
                return "ID for texture conflicts with keyword: " + attributes.id.value;

            if (this.views[attributes.id.value] != null)
                return "ID must be unique for each view (conflict: ID = " + attributes.id.value + ")";
            
            if (attributes.near == null)
                return "'near' attribute not defined for view " + attributes.id.value
            
            if (attributes.far == null)
                return "'far' attribute not defined for view " + attributes.id.value
            
            const positions = view.children;

            for (const position of positions) {
                
                const coords = this.parseCoordinates3DVec(position, position.nodeName + ' for view ' + attributes.id.value);

                if (position.nodeName === "from")
                    attributes.from = coords
                
                else if (position.nodeName === "to")
                    attributes.to = coords
                
                else if (position.nodeName === "up")
                    attributes.up = coords
                
                else this.onXMLMinorError("unknown tag <" + position.nodeName + ">");
            }

            if (attributes.from == null || attributes.to == null) 
                return "view " + attributes.id + " does not have necessary 'from' and ' to' attributes"

            if (view.nodeName === "perspective") {
                if (attributes.angle == null)
                    return "perspective view " + attributes.id + " does not have necessary 'angle' attribute"
                
                this.views[attributes.id.value] = new CGFcamera(
                     attributes.angle.value * DEGREE_TO_RAD,
                     parseFloat(attributes.near.value),
                     parseFloat(attributes.far.value),
                     attributes.from,
                     attributes.to);

            }
            else {
                if (attributes.left == null || attributes.right == null || attributes.top == null || attributes.bottom == null)
                    return "ortho view " + attributes.id + " does not have necessary 'left', 'right', 'top' and 'bottom' attributes"

                this.views[attributes.id.value] = new CGFcameraOrtho(
                    parseFloat(attributes.left.value),
                    parseFloat(attributes.right.value),
                    parseFloat(attributes.bottom.value),
                    parseFloat(attributes.top.value),
                    parseFloat(attributes.near.value),
                    parseFloat(attributes.far.value),
                    attributes.from,
                    attributes.to,
                    attributes.up ? attributes.up : vec3.fromValues(0, 1, 0));
            }
            

        }

        if (Object.keys(this.views).length === 0) {
            return "at least one view must be defined";
        }
        
        this.updateCamera(this.defaultView);
        this.scene.interface.setCameraDropdown();


        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        const children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        const nodeNames = [];

        for (const node of children) {
            nodeNames.push(node.nodeName);
        }

        const ambientIndex = nodeNames.indexOf("ambient");
        const backgroundIndex = nodeNames.indexOf("background");

        let color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        const children = lightsNode.children;

        this.lights = {};
        let numLights = 0;
        this.currentLight = children[0].attributes.id.value;
        // Any number of lights.
        for (const light of children) {

            // Storing light information
            const lightInfo = {}
            const attributeNames = [];
            const attributeTypes = [];

            //Check type of light
            if (light.nodeName != "omni" && light.nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + light.nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "target"]);
                attributeTypes.push(...["position4d", "color", "color", "color", "position3d"]);
            }

            // Get id of the current light.
            const lightId = this.reader.getString(light, 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            let enableLight = true;
            let aux = this.reader.getBoolean(light, 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false))) {
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
                enableLight = 1;
            } else enableLight = aux;

            //Add enabled boolean and type name to light info
            //global.push(light.nodeName);

            const attributes = light.children;
            // Specifications for the current light.

            const nodeNames = [];
            for (const attribute of attributes) {
                nodeNames.push(attribute.nodeName);
            }

            for (const attribute of nodeNames) {
                const attributeIndex = attributeNames.indexOf(attribute);
                const attributeIndexName = nodeNames.indexOf(attribute);

                if (attributeIndex != -1) {
                    
                    if (attributeTypes[attributeIndex] == "position4d")
                        aux = this.parseCoordinates4D(attributes[attributeIndexName], "light position for ID " + lightId);
                    else if (attributeTypes[attributeIndex] == "position3d")
                        aux = this.parseCoordinates3D(attributes[attributeIndexName], "light target for ID " + lightId);
                    else
                        aux = this.parseColor(attributes[attributeIndexName], attribute + " illumination for ID " + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    lightInfo[attribute] = aux;
                } else if (attribute == "attenuation") {

                    const constant = this.reader.getFloat(attributes[attributeIndexName], 'constant') || 0, 
                    linear = this.reader.getFloat(attributes[attributeIndexName], 'linear') || 0, 
                    quadratic = this.reader.getFloat(attributes[attributeIndexName], 'quadratic') || 0

                    if ((constant && !linear && !quadratic) || (!constant && linear && !quadratic) || (!constant && !linear && quadratic)) {
                        lightInfo[attribute] = {
                            constant,
                            linear,
                            quadratic
                        }
                    } else {
                        this.onXMLMinorError("'attenuation' field for ID = " + lightId + " should have one and only one of constant, linear or quadratic set to 1");
                    }


                } else
                    return "light " + attribute + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (light.nodeName == "spot") {
                const angle = this.reader.getFloat(light, 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                const exponent = this.reader.getFloat(light, 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                const targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                let targetLight = [];
                if (targetIndex != -1) {
                    aux = this.parseCoordinates3D(attributes[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                lightInfo.angle = angle;
                lightInfo.exponent = exponent;
                lightInfo.targetLight = targetLight;
            }

            this.lights[lightId] = new SceneLight(lightId, light.nodeName, enableLight, lightInfo);
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        const textures = texturesNode.children;

        this.textures = {};

        for (const texture of textures) {
            if (texture.nodeName !== "texture") {
                this.onXMLMinorError("unknown tag <" + texture.nodeName + ">");
                continue;
            }
            
            const attributes = texture.attributes;
            if (attributes.id.value == null)
                return "no ID defined for texture";
            
            if (this.textures[attributes.id.value] != null)
                return "ID must be unique for each texture (conflict: ID = " + attributes.id.value + ")";
            
            if (attributes.file == null)
                return "'file' attribute not defined for texture " + attributes.id.value

            const img = new Image();

            // get the image
            img.src = attributes.file.value;
            img.scene = this;
            img.texID = attributes.id.value;
            //img.texture = new SceneTexture(img.texID, attributes, img)
            // get height and width
            img.onload = function() {
                if (Math.log2(this.width * this.height) % 1 !== 0)
                    this.scene.onXMLMinorError("img dimensions are not power of 2 in texture" + this.texID);
            }

            img.onerror = function() {
                this.scene.onXMLMinorError("'file' does not exist or has invalid extension (only .jpg or .png allowed) in texture" + this.texID);
            }

            this.textures[img.texID] = new CGFtexture(this.scene, img.src);

        }

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        const materials = materialsNode.children;

        this.materials = {};
        // Any number of materials.
        for (const material of materials) {
            if (material.nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + material.nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(material, 'id');
            if (materialID == null)
                return "no ID defined for material";

            if (materialID == "inherit")
                return "ID for material conflicts with keyword: inherit";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            const attributes = material.attributes;
            
            if (attributes.shininess == null)
                return "'shininess' attribute not defined for material " + materialID
            
            const attrs = material.children;
            let emission, ambient, diffuse, specular;

            for (const attr of attrs) {
                const type = attr.nodeName;                    
                const color = this.parseColor(attr, 'invalid colors for ' + type + ' in material with ID ' + materialID)
                if (type == 'emission') emission = color;
                else if (type == 'ambient') ambient = color;
                else if (type == 'diffuse') diffuse = color;
                else if (type == 'specular') specular = color;
                else this.onXMLMinorError("unknown tag <" + type + ">");

            }

            if (emission == null || ambient == null || diffuse == null || specular == null) 
                return "material " + materialID + " does not have necessary 'emission', 'ambient', 'diffuse' and 'specular' attributes"
            
            const appearance = new CGFappearance(this.scene);
            appearance.setAmbient(...ambient);
            appearance.setEmission(...emission);
            appearance.setDiffuse(...diffuse);
            appearance.setSpecular(...specular);
            
            this.materials[materialID] = appearance;
        }

        if (this.materials.length == 0)
            return "there must be at least one material in the materials block"

        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        const transformations = transformationsNode.children;

        this.transformations = {};

        // Any number of transformations.
        for (const transformation of transformations) {

            if (transformation.nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + transformation.nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            const transformationID = this.reader.getString(transformation, 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";
            
            const transfMatrix = this.parseTransformationDef(transformation, transformationID);
            
            if (typeof transfMatrix === 'string')
                return transfMatrix;

            this.transformations[transformationID] = transfMatrix;
        }

        if (Object.keys(this.transformations).length === 0) {
            return "at least one transformation must be defined";
        }

        return null;
    }

    parseTransformationDef(transformationNode, id) {
        const transfMatrix = this.parseTransformation(transformationNode);
        
        if (transfMatrix === mat4.create()) {
            return "at least one valid element must be defined for transformation with ID " + id;
        }
        return transfMatrix;
    }

    parseTransformation(transformationNode) {
        const transfTypes = transformationNode.children;
        
        let transfMatrix = mat4.create();

        for (const type of transfTypes) {
            switch (type.nodeName) {
                case 'translate':
                    const translation = this.parseCoordinates3D(type, "translate transformation");

                    if (typeof translation === 'string')
                        return translation;

                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, translation);
                    break;
                case 'scale':                        
                    const scaling = this.parseCoordinates3D(type, "scale transformation");
                    
                    if (typeof scaling === 'string')
                        return scaling;
                        
                    transfMatrix = mat4.scale(transfMatrix, transfMatrix, scaling);
                    break;
                case 'rotate':
                    const rotation = this.parseRotate(type);
                    
                    if (typeof rotation === 'string')
                        return rotation;
                    
                    const angle = rotation[0];
                    const axis = rotation[1];

                    transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle, axisCoords[axis]);
                    break;
                default:
                    this.onXMLMinorError("ignoring unknown transformation type " + type.nodeName);
                    break;
            }
        }

        return transfMatrix;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        const primitives = primitivesNode.children;

        this.primitives = {};

        // Any number of primitives.
        for (const primitive of primitives) {

            if (primitive.nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + primitive.nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            const primitiveId = this.reader.getString(primitive, 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            const type = primitive.children[0];
            const typeName = type.nodeName;

            if (!POSSIBLE_PRIMITIVES.includes(typeName)) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)";
            }            

            // Retrieves the primitive coordinates.
            if (typeName == 'rectangle') {
                const rect = [];
                for (const [index, param] of ['x1', 'x2', 'y1', 'y2'].entries()) {
                    rect[index] = this.reader.getFloat(type, param);
                    if (rect[index] == null || isNaN(rect[index]))
                        return "unable to parse " + param + " of the primitive coordinates for ID = " + primitiveId;
                }

                const rectangle = new MyRectangle(this.scene, primitiveId, ...rect);
                this.primitives[primitiveId] = rectangle;
            } else if (typeName == 'triangle'){
                const tri = [];
                for (const [index, param] of ['x1', 'x2', 'x3', 'y1', 'y2', 'y3', 'z1', 'z2', 'z3'].entries()) {
                    tri[index] = this.reader.getFloat(type, param);
                    if (tri[index] == null || isNaN(tri[index]))
                        return "unable to parse " + param + " of the primitive coordinates for ID = " + primitiveId;
                }

                const triangle = new MyTriangle(this.scene, primitiveId, ...tri);
                this.primitives[primitiveId] = triangle;
            } else if (typeName == 'cylinder') {
                const cyl = [];
                for (const [index, param] of ['base', 'top', 'height', 'slices', 'stacks'].entries()) {
                    cyl[index] = this.reader.getFloat(type, param);
                    if (cyl[index] == null || isNaN(cyl[index]))
                        return "unable to parse " + param + " of the primitive coordinates for ID = " + primitiveId;
                }

                const cylinder = new MyCylinder(this.scene, primitiveId, ...cyl);
                this.primitives[primitiveId] = cylinder;
            } else if (typeName == 'torus') {
                const tor = [];
                for (const [index, param] of ['outer', 'inner', 'slices', 'loops'].entries()) {
                    tor[index] = this.reader.getFloat(type, param);
                    if (tor[index] == null || isNaN(tor[index]))
                        return "unable to parse " + param + " of the primitive coordinates for ID = " + primitiveId;
                }

                if (tor[1] >= tor[0])
                    return "inner of primitive for ID = " + primitiveId + " cannot be equal to or greater than outer"

                const torus = new MyTorus(this.scene, primitiveId, ...tor);
                this.primitives[primitiveId] = torus;
            } else if (typeName == 'sphere') {
                const sph = [];
                for (const [index, param] of ['radius', 'slices', 'stacks'].entries()) {
                    sph[index] = this.reader.getFloat(type, param);
                    if (sph[index] == null || isNaN(sph[index]))
                        return "unable to parse " + param + " of the primitive coordinates for ID = " + primitiveId;
                }
                
                const sphere = new MySphere(this.scene, ...sph);
                this.primitives[primitiveId] = sphere;
            } else console.warn("To do: Parse other primitives.");
            
        }

        return null;
    }

    checkForCircularComponentDependency(info, visited) {
        visited = [...visited, info.id];

        for (let child of this.components[info.id].children) {
            if (child.type == 'primitive') continue;
            if (visited.includes(child.id))
                return 'Node ' + info.id + ' has a circular dependency with node ' + child.id;
            let circularDependency = ""
            if ((circularDependency = this.checkForCircularComponentDependency(child, visited)))
                return circularDependency;
        }
        return null;
    }

    multiplexComponentPrimitives() {

        const updatedPrimitives = {};
        const primitivesToUpdate = ['MyRectangle', 'MyTriangle']

        for (let [componentID, component] of Object.entries(this.components)) {
            const componentChildren = component.children
            const newComponentChildren = component.children
            for (let child of componentChildren) {
                if (child.type != 'primitive') continue

                if (child.id in updatedPrimitives) {
                    const origPrimitive = this.primitives[child.id]

                    if (!primitivesToUpdate.includes(origPrimitive.constructor.name)) continue

                    let newPrimitiveID;

                    for (let createdPrimitive of updatedPrimitives[child.id]) {
                        if (createdPrimitive.length_s === component.length_s && createdPrimitive.length_t === component.length_t) {
                            newPrimitiveID = createdPrimitive.primitiveID;
                            break;
                        }
                    }

                    if (!newPrimitiveID) {
                        newPrimitiveID = child.id
                        let count = 0;
                        while (newPrimitiveID in this.primitives) {
                            newPrimitiveID = `${child.id}-copy${count++}`
                        }
                        this.primitives[newPrimitiveID] = origPrimitive.copy()
                        this.primitives[newPrimitiveID].updateTexCoords(component.length_s || 1, component.length_t || 1);
                        updatedPrimitives[child.id].push({length_s: component.length_s, length_t: component.length_t, primitiveID: newPrimitiveID})
                    }

                    newComponentChildren.splice(newComponentChildren.indexOf(child), 1, {id: newPrimitiveID, type: 'primitive'});

                } else {
                    this.primitives[child.id].updateTexCoords(component.length_s || 1, component.length_t || 1);
                    updatedPrimitives[child.id] = [{length_s: component.length_s, length_t: component.length_t, primitiveID: child.id}];
                }
                
            }

            component.children = newComponentChildren
        }
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        const components = componentsNode.children;

        this.components = {};
        const componentIDs = [];
        for (const component of components) {
            if (component.nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + component.nodeName + ">");
                continue;
            }

            // Get id of the current component.
            const componentID = this.reader.getString(component, 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";
            
            componentIDs.push(componentID);
        }

        // Any number of components.
        for (const component of components) {

            
            const componentID = this.reader.getString(component, 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            const attributes = component.children;

            const nodeNames = [];
            for (const attribute of attributes) {
                nodeNames.push(attribute.nodeName);
            }

            const transformationIndex = nodeNames.indexOf("transformation");
            const materialsIndex = nodeNames.indexOf("materials");
            const textureIndex = nodeNames.indexOf("texture");
            const childrenIndex = nodeNames.indexOf("children");

            // Transformations

            if (transformationIndex == -1)
                return "component with ID "+ componentID + " does not have mandatory transformation block"
            
            const transformationBlock = component.children[transformationIndex];
            const transformationObj = transformationBlock.children;
            let sceneTransformation;
            

            if (transformationObj.length == 0) {
                sceneTransformation = mat4.create();
            // transformation by reference
            } else if (transformationObj[0].nodeName === 'transformationref') {
                const transformationID = this.reader.getString(transformationObj[0], 'id');
                sceneTransformation = this.transformations[transformationID];
            }
            else { // inline transformation
                sceneTransformation = this.parseTransformation(transformationBlock);
            }
            
        
            // Materials

            if (materialsIndex == -1)
                return "component with ID "+ componentID + " does not have mandatory materials block"

            const materialsObj = component.children[materialsIndex].children;
            const sceneMaterials = []

            for (const material of materialsObj) {
                const materialID = this.reader.getString(material, 'id');

                if (materialID == "inherit") {
                    sceneMaterials.push(materialID);
                    continue;
                }

                if (this.materials[materialID] == null)
                    return "no such material with ID " + materialID + " on component " + componentID
                
                sceneMaterials.push(materialID);
            }

            if (sceneMaterials.length == 0)
                return "no materials for component " + componentID

            // Texture

            if (textureIndex == -1)
                return "component with ID "+ componentID + " does not have mandatory texture block"

            const texture = component.children[textureIndex];
            let sceneTexture;

            const textureID = this.reader.getString(texture, 'id');
           

            if (textureID == "inherit" || textureID == "none") {
                sceneTexture = { 
                    id: textureID,
                };

            } else if (this.textures[textureID] == null) 
                return "no such texture with ID " + textureID + " on component " + componentID
            
            
            if (textureID != "none") {

                let length_s = this.reader.getString(texture, 'length_s', false);
                if (length_s == null) length_s = (textureID == 'inherit' ? '-1' : '1')
                let length_t = this.reader.getString(texture, 'length_t', false);
                if (length_t == null) length_t = (textureID == 'inherit' ? '-1' : '1')
                
                sceneTexture = { 
                    id: textureID,
                    length_s: length_s,
                    length_t: length_t,
                };
            }
               

            // Children

            if (childrenIndex == -1)
                return "component with ID "+ componentID + " does not have mandatory children block"

            const childrenObj = component.children[childrenIndex].children;
            const childrenArr = []

            for (const child of childrenObj) {
                const childType = child.nodeName;
                
                if (!(childType == "componentref" || childType == "primitiveref")) {
                    this.onXMLMinorError("unknown tag <" + childType + ">");
                    continue;
                }

                const childID = this.reader.getString(child, 'id');
                let type;
                if (childType == "componentref") {
                    if (componentIDs.indexOf(childID) == -1)
                        return "no such component with ID " + childID + " to be child of component " + componentID
                    type = "component"
                } else {
                    if (this.primitives[childID] == null)
                        return "no such primitive with ID " + childID + " to be child of component " + componentID
                    type = "primitive"
                }
                childrenArr.push({id: childID, type: type});
            }

            this.components[componentID] = new SceneComponent(componentID, sceneTransformation, sceneMaterials, sceneTexture, childrenArr)
        }

        let circularDependency = "";
        if ((circularDependency = this.checkForCircularComponentDependency({id: this.idRoot, type: 'component'}, [])))
            return circularDependency

        this.multiplexComponentPrimitives();
        return null;

    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        // x
        const x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        const y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        const z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        const position = [x, y, z];

        return position;
    }

  /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
   parseCoordinates3DVec(node, messageError) {
    // x
    const x = this.reader.getFloat(node, 'x');
    if (!(x != null && !isNaN(x)))
        return "unable to parse x-coordinate of the " + messageError;

    // y
    const y = this.reader.getFloat(node, 'y');
    if (!(y != null && !isNaN(y)))
        return "unable to parse y-coordinate of the " + messageError;

    // z
    const z = this.reader.getFloat(node, 'z');
    if (!(z != null && !isNaN(z)))
        return "unable to parse z-coordinate of the " + messageError;

    const position = vec3.fromValues(x, y, z);

    return position;
}

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        //Get x, y, z
        const position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        const w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        // R
        const r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        const g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        const b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        const a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        const color = [r, g, b, a];

        return color;
    }

    parseRotate(node) {
        // angle
        const angle = this.reader.getFloat(node, 'angle');
        if (!(angle != null && !isNaN(angle)))
            return "unable to parse angle component of the rotation for transformation";
        
        // axis
        const axis = this.reader.getString(node, 'axis');
        if (!(axis != null && (axis === "x" || axis === "y" || axis === "z")))
            return "unable to parse axis component of the rotation for transformation";

        return [angle*DEGREE_TO_RAD, axis];
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    changeMaterial() {
        if (this.scene.gui.isKeyPressed("KeyM")) {
            if (this.changingMaterials) return false;
            else {
                this.changingMaterials = true;
                return true;
            }
        } else {
            this.changingMaterials = false;
        }
    }

    updateCamera(cam) {
        this.scene.camera = this.views[cam];

        this.scene.updateProjectionMatrix();
        this.scene.loadIdentity();

        this.scene.applyViewMatrix();

        this.scene.interface.setActiveCamera(this.scene.camera);
    
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //To do: Create display loop for transversing the scene graph

        if (this.changeMaterial()) {
            for (const component of Object.values(this.components)) {
                component.materialIndex = (component.materialIndex + 1) % component.materials.length;
            }
        }

        this.displayComponent({id: this.idRoot, type: 'component'}, {
            material: undefined,
            texture: undefined,
            length_s: undefined,
            length_t: undefined
        });

    }

    displayComponent(info, inheritance) {
        let {material, texture, length_s, length_t} = inheritance;
        if (info.type === 'component') {
            const component = this.components[info.id];
            this.scene.pushMatrix();
            this.scene.multMatrix(component.transformation);
            
            if (component.materials.length > 0) {

                const sceneMaterial = component.materials[component.materialIndex];
                if (sceneMaterial != "inherit") {
                    material = this.materials[sceneMaterial];
                }
                
                if (component.texture != 'inherit' && component.texture != 'none') {
                    texture = this.textures[component.texture];
                }

                if (component.texture == 'none') {
                    texture = undefined;
                } 
                
                material.setTexture(texture);
                material.setTextureWrap('MIRRORED_REPEAT', 'MIRRORED_REPEAT');
                material.apply();
            }
            
            length_s = component.length_s != -1 ? component.length_s : length_s;
            length_t = component.length_t != -1 ? component.length_s : length_s;
            
            for (const child of component.children) {
                this.displayComponent(child, {
                    material : material,
                    texture: texture,
                    length_s: length_s,
                    length_t: length_t
                });
            }
            
            this.scene.popMatrix();
        } else this.primitives[info.id].display();
    }
}
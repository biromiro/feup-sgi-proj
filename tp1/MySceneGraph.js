import { CGFXMLreader } from '../lib/CGF.js';
import { MyCylinder } from './primitives/MyCylinder.js';
import { MyRectangle } from './primitives/MyRectangle.js';
import { MyTorus } from './primitives/MyTorus.js';
import { MyTriangle } from './primitives/MyTriangle.js';
import { XMLCamera } from './xmlObjects/XMLCamera.js';
import { XMLTexture } from './xmlObjects/XMLTexture.js';

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
const POSSIBLE_PRIMITIVES = ['rectangle', 'triangle', 'cylinder', 'sphere', 'torus']

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

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

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
        this.log("all parsed");
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

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        this.views = {};
        const children = viewsNode.children;

        if (children.length == 0) 
            return "at least one view must be defined";

        let defaultNode = viewsNode.attributes.default.value;
        
        if (!defaultNode)
            defaultNode = children[0].attributes.id;

        for (const view of children) {
            if (view.nodeName !== "perspective" && view.nodeName !== "ortho") {
                this.onXMLMinorError("unknown tag <" + view.nodeName + ">");
                continue;
            }
            
            const attributes = view.attributes;
            if (attributes.id.value == null)
                return "no ID defined for view";
            
            if (this.views[attributes.id.value] != null)
                return "ID must be unique for each view (conflict: ID = " + attributes.id.value + ")";
            
            if (attributes.near == null)
                return "'near' attribute not defined for view " + attributes.id.value
            
            if (attributes.far == null)
                return "'far' attribute not defined for view " + attributes.id.value
            
            const sliders = view.children;

            for (const slider of sliders) {
                
                const sliderCoords = this.parseCoordinates3D(slider, slider.nodeName + ' for view ' + attributes.id.value);

                if (slider.nodeName === "from")
                    attributes.from = sliderCoords
                
                else if (slider.nodeName === "to")
                    attributes.to = sliderCoords
                
                else if (slider.nodeName === "up")
                    attributes.up = sliderCoords
                
                else this.onXMLMinorError("unknown tag <" + slider.nodeName + ">");
            }

            if (attributes.from == null || attributes.to == null) 
                return "view " + attributes.id + " does not have necessary 'from' and ' to' attributes"

            if (view.nodeName === "perspective") {
                if (attributes.angle == null)
                    return "perspective view " + attributes.id + " does not have necessary 'angle' attribute"
            } else {
                if (attributes.left == null || attributes.right == null || attributes.top == null || attributes.bottom == null)
                    return "ortho view " + attributes.id + " does not have necessary 'left', 'right', 'top' and 'bottom' attributes"
               
            }
            
            this.views[attributes.id.value] = new XMLCamera(attributes, view.nodeName, attributes.id.value === defaultNode);

        }

        console.log(this.views)
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

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        const children = lightsNode.children;

        this.lights = [];
        let numLights = 0;

        // Any number of lights.
        for (const light of children) {

            // Storing light information
            const global = [];
            const attributeNames = [];
            const attributeTypes = [];

            //Check type of light
            if (light.nodeName != "omni" && light.nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + light.nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
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
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(light.nodeName);

            const attributes = light.children;
            // Specifications for the current light.

            const nodeNames = [];
            for (const attribute of attributes) {
                nodeNames.push(attribute.nodeName);
            }

            for (const attribute of attributeNames) {
                const attributeIndex = nodeNames.indexOf(attribute);

                if (attributeIndex != -1) {
                    
                    if (attributeTypes[attributeIndex] == "position")
                        aux = this.parseCoordinates4D(attributes[attributeIndex], "light position for ID" + lightId);
                    else
                        aux = this.parseColor(attributes[attributeIndex], attribute + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
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

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        const textures = texturesNode.children;

        this.textures = {};
        
        const acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png']

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
            img.texture = new XMLTexture(attributes, img)
            img.texID = attributes.id.value;
            // get height and width
            img.onload = function() {
                if (Math.log2(this.width * this.height) % 1 !== 0)
                    this.scene.onXMLMinorError("img dimensions are not power of 2 in texture" + this.texID);
                
                img.scene.textures[img.texID] = img.texture;
            }

            img.onerror = function() {
                this.scene.onXMLMinorError("'file' does not exist or has invalid extension (only .jpg or .png allowed) in texture" + this.texID);
            }
        }

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        const materials = materialsNode.children;

        this.materials = [];

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

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            //Continue here
            this.onXMLMinorError("To do: Parse materials.");
        }

        //this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        const transformations = transformationsNode.children;

        this.transformations = [];

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

            const transfTypes = transformation.children;
            // Specifications for the current transformation.

            let transfMatrix = mat4.create();

            for (const type of transfTypes) {
                switch (type.nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(type, "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':                        
                        this.onXMLMinorError("To do: Parse scale transformations.");
                        break;
                    case 'rotate':
                        // angle
                        this.onXMLMinorError("To do: Parse rotate transformations.");
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        const primitives = primitivesNode.children;

        this.primitives = [];

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
                // x1
                const x1 = this.reader.getFloat(type, 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                const y1 = this.reader.getFloat(type, 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                const x2 = this.reader.getFloat(type, 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                const y2 = this.reader.getFloat(type, 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                const rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);
                this.primitives[primitiveId] = rect;
            } else if (typeName == 'triangle'){
                // x1
                const x1 = this.reader.getFloat(type, 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                const x2 = this.reader.getFloat(type, 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;
                
                // x3
                const x3 = this.reader.getFloat(type, 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y1
                const y1 = this.reader.getFloat(type, 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // y2
                const y2 = this.reader.getFloat(type, 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;
                
                // y3
                const y3 = this.reader.getFloat(type, 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                // z1
                const z1 = this.reader.getFloat(type, 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                // z2
                const z2 = this.reader.getFloat(type, 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;
                
                // z3
                const z3 = this.reader.getFloat(type, 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;
                

                const triangle = new MyTriangle(this.scene, primitiveId, x1, x2, x3, y1, y2, y3, z1, z2, z3);
                this.primitives[primitiveId] = triangle;
            } else if (typeName == 'cylinder') {
                // baseRadius
                const baseRadius = this.reader.getFloat(type, 'baseRadius');
                if (!(baseRadius != null && !isNaN(baseRadius)))
                    return "unable to parse baseRadius of the primitive for ID = " + primitiveId;

                // upperRadius
                const upperRadius = this.reader.getFloat(type, 'upperRadius');
                if (!(upperRadius != null && !isNaN(upperRadius)))
                    return "unable to parse upperRadius of the primitive for ID = " + primitiveId;

                // height
                const height = this.reader.getFloat(type, 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive for ID = " + primitiveId;
                    
                // slices
                const slices = this.reader.getFloat(type, 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive for ID = " + primitiveId;

                // stacks
                const stacks = this.reader.getFloat(type, 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive for ID = " + primitiveId;

                const cylinder = new MyCylinder(this.scene, primitiveId, baseRadius, upperRadius, height, slices, stacks);
                this.primitives[primitiveId] = cylinder;
                //const torus = new MyTorus(this.scene, 5, 2, 10, 20);
            } else if (typeName == 'torus') {

                // radius
                const radius = this.reader.getFloat(type, 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive for ID = " + primitiveId;

                // innerRadius
                const innerRadius = this.reader.getFloat(type, 'innerRadius');
                if (!(innerRadius != null && !isNaN(innerRadius)))
                    return "unable to parse innerRadius of the primitive for ID = " + primitiveId;

                if (innerRadius >= radius)
                    return "innerRadius of primitive for ID = " + primitiveId + " cannot be equal to or greater than radius"

                // slices
                const slices = this.reader.getFloat(type, 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive for ID = " + primitiveId;

                // loops
                const loops = this.reader.getFloat(type, 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive for ID = " + primitiveId;

                const torus = new MyTorus(this.scene, primitiveId, radius, innerRadius, slices, loops);
                this.primitives[primitiveId] = torus;
                //const torus = new MyTorus(this.scene, 5, 2, 10, 20);
            } else {
                console.warn("To do: Parse other primitives.");
            }
        }

        this.log("Parsed primitives");
        console.log(this.primitives)
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        const components = componentsNode.children;

        this.components = [];

        // Any number of components.
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

            const attributes = component.children;

            const nodeNames = [];
            for (const attribute of attributes) {
                nodeNames.push(attribute.nodeName);
            }

            const transformationIndex = nodeNames.indexOf("transformation");
            const materialsIndex = nodeNames.indexOf("materials");
            const textureIndex = nodeNames.indexOf("texture");
            const childrenIndex = nodeNames.indexOf("children");

            this.onXMLMinorError("To do: Parse components.");
            // Transformations

            // Materials

            // Texture

            // Children

        }
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

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //To do: Create display loop for transversing the scene graph

        //To test the parsing/creation of the primitives, call the display function directly
        this.primitives['demoTriangle'].display();
    }
}
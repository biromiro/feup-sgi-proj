# SGI 2022/2023

## Group T04G08

| Name             | Number    | E-Mail               |
| ---------------- | --------- | -------------------- |
| João Baltazar    | 201905616 | up201905616@fe.up.pt |
| Nuno Costa       | 201801011 | up201906272@fe.up.pt |

----

## Projects

### [TP1 - Scene Graph](tp1)

The scene portrays a low-poly outdoors playground. It has a marble platform supporting a sandbox, a bench, a slide, an up-and-down and a swing, as well as some decorative trees and rocks.

#### Strong Points

- Engaging visuals, with 3 different scene 'seasons'
- Randomly generated convex triangle spheres using our Python script allows for believable low-poly trees
- Uses a primitive multiplexer, allowing for no updates to texCoords to be made on display, which significantly improves performance when applying textures to primitives with different length_t and length_s parameters
- Takes special care of texture wrapping

----

### [TP2 - WebGL Advanced Techniques](tp2)

The scene extends tp1's scene. It adds a hammock between the back trees and a beehive with flying bees.
The sand is now NURBS-based (patch rectangle), highlighting the effect of the lights on its surface.
The hammock implements the NURBS tent with a camping rope texture.
The tree trunks, beehive, and bees are made out of NURBS barrels.
The swings, up-and-down, bouncers, beehive and bees are all animated and looping, enhancing the atmosphere.

#### Strong Points

- Improved engaging visuals, with appealing use of textures and animations
- Traverses the component tree twice to reduce the impact of applying the shader, by displaying non-shaded elements first and then all shaded elements, allowing for a single call to _setActiveShader_()
- Pulsar shader uses Phong's reflection model
- Animations accept any order of transformations and support looping
- Clean and refactored XML and code.

----

### [TP3 - Game Development](tp3)


The checkers game is played on tp2's scene. 
It adds all the game features and customizations, shared between the controls menu and the game table, where the game is being played.

### Strong Points

- Game is very well integrated visually on the scene, and very appealing
- The environments expand on the seasons and give them unique primitives, structures and vibe
- Environments are encapsulated on the main xml by a new parameter
- Another custom traversal of the component tree for performance optimization, this time in order to carry out the *spritesheets* technique
- Cubic easing on the pieces' movement animations
- Press-down animation on the undo/lock buttons
- Automatic highlighting of moved pieces

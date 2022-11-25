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
- Pulsar shader uses Phong's reflection model
- Animations accept any order of transformations and support looping
- Clean and refactored XML and code.

----

### [TP3 - ...](tp3)

- (items briefly describing main strong points)

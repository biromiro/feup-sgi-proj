# SGI 2022/2023 - TP2

## Group: T04G08

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| João Baltazar    | 201905616 | up201905616@up.pt  |
| Nuno Costa       | 201906272 | up201906272@up.pt  |


## Project information

The scene extends tp1's scene. It adds a hammock between the back trees and a beehive with flying bees. The sand is now NURBS-based (patch rectangle), highlighting the effect of the lights on its surface. The hammock implements the NURBS tent with a camping rope texture. The tree trunks, beehive, and bees are made out of NURBS barrels.
The swings, up-and-down, bouncers, beehive and bees are all animated and looping, enhancing the atmosphere.

### Strong Points
- Improved engaging visuals, with appealing use of textures and animations
- Randomly generated convex triangle spheres using our Python script allows for believable low-poly trees
- Uses a primitive multiplexer, allowing for no updates to texCoords to be made on display, which significantly improves performance when applying textures to primitives with different length_t and length_s parameters
- Takes special care of texture wraping
- 3 different scene 'seasons', each with its own personalized color pallete
- Scene composed by several different components, which make it quite complex and interesting
- Traverses the component tree twice to reduce the impact of applying the shader, by displaying non-shaded elements first and then all shaded elements, allowing for a single call to _setActiveShader_()
- Pulsar shader uses Phong's reflection model
- Animations accept any order of transformations and support looping
- Clean and refactored XML and code.

### Scene
- A marble platform
- A sandbox
- A bench
- A slide
- An up-and-down
- A swing
- 3 distinct trees
- Several decorative rocks
- A hammock
- A beehive
- Several bees
- 3 distinct seasons ([winter](screenshots/winter_moody.png), [spring](screenshots/spring_moody.png) and [autumn](screenshots/autumn_moody.png))
- Lights on the sandbox to give a [darker/night feel to the scene](screenshots/autumn_moody.png)

## Issues/Problems

- All requested features were properly implemented.
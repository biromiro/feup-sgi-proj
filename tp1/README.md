# SGI 2022/2023 - TP1

## Group: T04G08

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| João Baltazar    | 201905616 | up201905616@up.pt  |
| Nuno Costa       | 201906272 | up201906272@up.pt  |

## Project information

Our scene portrays a low-poly outdoors playground. It has a marble platform supporting a sandbox, a bench, a slide, an up-and-down and a swing, as well as some decorative trees and rocks.

### Strong Points
- Engaging visuals
- Randomly generated convex triangle spheres using our Python script allows for believable low-poly trees
- Uses a primitive multiplexer, allowing for no updates to texCoords to be made on display, which significantly improves performance when applying textures to primitives with different length_v and length_u parameters
- Takes special care of texture wraping
- 3 different scene 'seasons', each with its own personalized color pallete
- Scene composed by several different components, which make it quite complex and interesting

### Scene
- A marble platform
- A sandbox
- A bench
- A slide
- An up-and-down
- A swing
- 3 distinct trees
- Several decorative rocks
- 3 distinct seasons ([winter](screenshots/winter_defaultCamera.jpg), [spring](screenshots/spring_baseLightjpg.jpg) and [autumn](screenshots/autumn_day.png))
- Lights on the sandbox to give a [darker/night feel to the scene](screenshots/autumn_night.jpg)

## Issues/Problems

- All requested features were properly implemented.

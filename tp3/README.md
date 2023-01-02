# SGI 2022/2023 - TP3

## Group: T04G08

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| João Baltazar    | 201905616 | up201905616@up.pt  |
| Nuno Costa       | 201906272 | up201906272@up.pt  |

----

## Project information

The checkers game is played on tp2's scene. It adds all the game features and customizations, shared between the controls menu and the game table, where the game is being played.

### Strong Points

- Game is very well integrated visually on the scene, and very appealing
- The environments expand on the seasons and give them unique primitives, structures and vibe
- Environments are encapsulated on the main xml by a new parameter
- Another custom traversal of the component tree for performance optimization, this time in order to carry out the *spritesheets* technique
- Cubic easing on the pieces' movement animations
- Press-down animation on the undo/lock buttons
- Automatic highlighting of chained moves after the first one

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
- A game table
  - A checkers board
  - Auxiliary boards
  - Marker boards
- Wood posters announcing each player's victory
- 4 distinct seasons, with unique primitives, structures and vibe: [autumn](screenshots/SGI3_T4_G08_2.png), [winter](screenshots/SGI3_T4_G08_3.png), [spring](screenshots/SGI3_T4_G08_4.png) and [summer](screenshots/SGI3_T4_G08_5.png)
- Lights on the sandbox to give a [darker/night feel to the scene](screenshots/autumn_moody.png)

----

## Issues/Problems

- All requested features were properly implemented.

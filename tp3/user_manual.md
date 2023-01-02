# Park Checkers - User Manual

This CGF application consists of a checkers game you can play at the (virtual) park.

## Running the program

In order to get the app running, simply run a web server on the project folder (using VSCode's Live Server extension, for example).

## User instructions

Once you're greeted by the park scene, you may look around, explore, zoom in and out with the camera, and, at any time, engage with the game using the **menu** located on the top right corner.

### Menu

The menu is composed of various folders and options that can help you customize the scene to your liking and kickstart the checkers game, among other features.

#### Environment

In this section, you may pick from among four environments corresponding to the four seasons - *Autumn*, *Winter*, *Spring* and *Summer*, changing the look of the scene and the game.

#### Camera

This is where you may switch between different perspectives on the park at any time during your stay.
The *gameCamera* will be the main one used throughout play, as it navigates between the relevant angles for the current situation.
Choose *defaultCamera* and *orthoCamera* when you want to take a break and take in the environment all around you.
Any of the remaining ones will show you any one of the possible *gameCamera* shots throughout play.

#### Highlighted Components

If you so choose, tick any of the boxes in order to make some objects on the scene animated like a pulsar.

#### Lights

These options can be toggled on or off in order to give your scene different lighting profiles according to your liking.

#### Game

After choosing your favourite scene settings, you may run the game with the *Start/Restart* button, as well as restart it, as the name implies.
If, at some point during the game, you wish to look back at all the awesome plays that were made throughout the match, you may press the *Watch Movie* button and do just that.

### Game Table

The game table contains all the elements used during play - the **checkers board**, the **marker boards** and the **auxiliary boards**.

#### Checkers Board

This is the board on which the pieces move and capture throughout the game. The essential action you will perform here is a *move* (either capturing or non-capturing).

##### Making a move

1. Click on the piece you wish to move with. If it is not a valid piece to move right now, your options will be highlighted for you, and you should repeat step 1.
2. Pick a destination among those highlighted for you, and click on it.
3. If you've captured an opposing piece on 2. and can chain another capture right now, repeat step 2. Otherwise, you're done!

After you've performed a move, you may *lock* it if you're happy with your choice, or *undo* it and try another one. These actions are performed on your marker board.

#### Marker Board

Each player has one of these. They track important information and allow you to *lock* or *undo* a move you've made.

##### Display

The marker board has a text display, which shows how many pieces each player took, how many queens they have, and the time left to spend on the current turn and on all turns of the match. If any of the two timers run out, the other player automatically wins.

##### Lock and Undo

After a player has made their move, they may *lock* the move and commit it, ending their turn, or *undo* it, continuing their turn.

#### Auxiliary Board

Once a piece is captured, it jumps to the auxiliary board, where it remains dead.
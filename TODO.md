# Project directions
- Store gameboard as an array inside of a `Gameboard` object
- Store players in objects
- Control the flow of the game itself with an object
- Minimize global code
    - Tuck as much code into factories as possible
    - Singleton instances should use the module pattern
- Get the game working in the console first
    - Include checks for when the game is over
        - Check for all 3-in-a-rows and ties
    - Avoid thinking about the DOM until the game is working
    - Call functions and pass arguments to play the game
    - Don't worry about getting user input yet
- Create an object that will handle the display logic
    - Write a function to render the contents of the gameboard array to the page
        - You can fill the array with Xs and Os to see what's going on
- Write the functions that allow players to mark specific squares on the board
    - Prevent players from playing on taken squares
- Allow players to enter their names
- Include a button to start/restart the game
- Display the results when the game is finished

# Other

## Project: 横スクロールシューティングゲーム (Side-Scrolling Shooter)

This project is a web-based, side-scrolling shooting game created with HTML, CSS, and JavaScript.

### Core Components:

-   `index.html`: The main entry point and structure of the game.
-   `style.css`: Handles the visual styling, featuring a neon-on-black, outer-space theme.
-   `script.js`: Contains all the game logic, including player movement, shooting, enemy spawning, collision detection, scoring, and stage progression with boss battles.
-   `README.md`: Provides a user-facing overview of the game and instructions on how to play.

### Key Features Implemented:

-   **Player Control**: The player's ship is controlled with the arrow keys.
-   **Shooting**: Bullets are fired using the spacebar.
-   **Enemies**: Regular enemies spawn periodically from the right side of the screen and move leftwards.
-   **Scoring**: Points are awarded for destroying regular enemies.
-   **Boss Battles**: A major feature of the game.
    -   A boss battle is triggered every 100 points.
    -   During a boss battle, regular enemy spawning stops.
    -   The boss has its own HP, which is displayed as a health bar at the top of the screen.
    -   The boss moves around the screen and fires its own projectiles at the player.
-   **Stages & Difficulty Scaling**:
    -   The game is structured in stages. A stage is cleared by defeating its boss.
    -   **Enemy Scaling**: With each stage, regular enemies get faster and change color.
    -   **Boss Scaling**: The boss also becomes more powerful with each stage, featuring increased HP, faster movement, and a higher rate of fire.
-   **Visuals**: The game has a distinct neon aesthetic with a dark, starry background to simulate being in space.
-   **Game Over & Restart**: The game ends if the player collides with an enemy, a boss, or any of their projectiles. The player can restart the game by pressing the spacebar on the game-over screen.

### Development Notes & Bug Fixes:

-   Initially, the player could not fire during boss battles. This was fixed by adjusting the `keydown` event listener.
-   A bug caused the next stage's boss to appear immediately after defeating the previous one. This was due to a large score bonus for boss kills. The bonus was removed to ensure progression is based on defeating regular enemies.
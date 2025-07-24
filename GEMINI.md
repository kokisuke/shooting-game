## Project: Star Shooting

This project is a web-based shooting game created with HTML, CSS, and JavaScript, designed to be fully responsive and playable on both desktop and mobile devices.

### Core Components:

-   `index.html`: The main entry point, including the game canvas and on-screen controls for mobile.
-   `style.css`: Handles all visual styling and uses media queries to adapt the layout for different screen orientations (landscape vs. portrait).
-   `script.js`: Contains the entire game logic, which dynamically adjusts based on screen orientation.
-   `README.md`: Provides a user-facing overview of the game and instructions.

### Key Features Implemented:

-   **Responsive Gameplay Mode**:
    -   **Desktop (Landscape)**: Plays as a classic horizontal side-scroller.
    -   **Mobile (Portrait)**: Automatically switches to a vertical top-down shooter for a better mobile experience.
-   **Dual Control Scheme**:
    -   **Keyboard**: Arrow keys for movement and Spacebar for firing.
    -   **Touch**: On-screen D-pad for movement and a FIRE button for shooting.
-   **Ammunition & Reload System**:
    -   The player has a limited magazine of 20 bullets.
    -   Running out of ammo triggers an automatic reload sequence, during which the player cannot fire.
    -   A fire rate cooldown ensures bullets are fired as distinct shots rather than a continuous stream.
    -   UI displays current ammo count and reloading status.
-   **Progressive Difficulty & Boss Battles**:
    -   A boss battle is triggered every 100 points.
    -   Both regular enemies and bosses become stronger (faster, more frequent attacks, more HP) with each cleared stage.
-   **UI/HUD**: Displays score, stage, ammo count, and the boss's HP bar during battles.

### Development Notes & Bug Fixes:

-   **Cross-Platform Adaptation**: Significant logic was added to `script.js` to handle the two different gameplay modes (horizontal vs. vertical) based on `window.orientation`.
-   **Touch Control Reliability**: Initial touch controls were buggy. They were rewritten to correctly register `touchstart` and `touchend` events, ensuring consistent input. A bug where the FIRE button wouldn't restart the game on mobile was also fixed.
-   **Game Feel Adjustments**: Bullet speed and fire rate were tweaked based on user feedback to improve the gameplay experience.
-   **Score/Progression Bug**: A large score bonus for defeating a boss was removed, as it caused the next stage's boss to spawn immediately. Progression is now correctly tied to points from regular enemies.

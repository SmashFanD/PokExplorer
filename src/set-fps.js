import { draw } from '/PokExplorer.js';

export const FPS = 30;
export const FRAME_INTERVAL = 1000 / FPS;
export let lastTimestamp = 0;

export function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    
    // Calculate time since last frame
    const deltaTime = timestamp - lastTimestamp;
    
    // Only update if enough time has passed for one frame
    if (deltaTime >= FRAME_INTERVAL) {
        // Reset last timestamp, adjusting for any overshoot
        lastTimestamp = timestamp - (deltaTime % FRAME_INTERVAL);
        
        // Run your game update and render code here
        draw(); // Your game logic
        //render();     // Your drawing code
    }
}

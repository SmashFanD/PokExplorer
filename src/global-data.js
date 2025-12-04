//should i make this a class?

export const canvas = document.getElementById('PokExplorer');
export const context = canvas.getContext('2d');
export const CANVAS_WIDTH = canvas.width = 800;
export const CANVAS_HEIGHT = canvas.height = 400;

//should probably be with game-data
export let gameFrames = 0;
export const incrementGameFrames = () => gameFrames++;
export const resetGameFrames = () => { gameFrames = 0; };
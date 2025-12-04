import { recordAndSave, toggleRecording } from '/src/recorder.js';
import { GameStates, togglePause } from '/src/game-states.js';


export const Input = {
  keys: new Set(),
  init() {
    document.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    document.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }
};

//Handle pause differently than direction input
document.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === 'p') {
        GameStates.isPaused = !GameStates.isPaused;
    }
    if (e.key.toLowerCase() === 'r') {
        recording = !recording;
        if (recording) recordAndSave();
        if (!recording) mediaRecorder.stop();
    }
});
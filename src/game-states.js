export const GameStates = {
  isPaused: false,
  playerScore: 0,
  enemyScore: 0,
  nextScore: 1,
  lastIsPaused: false,
  lastPlayerScore: 0,
  lastEnemyScore: 0
};

export const togglePause = () => {
  GameStates.isPaused = !GameStates.isPaused;
};
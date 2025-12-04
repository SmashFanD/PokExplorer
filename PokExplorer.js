import { SpeciesId } from "/src/enums/species-id.js";
import { AbilityId } from "/src/enums/ability-id.js";
import { allSpecies } from "/src/data/data-lists.js";
import { SpriteAnim } from "/src/enums/sprite-anim.js";
import { Player } from "/src/player.js";
import { recordAndSave, toggleRecording } from '/src/recorder.js';
import { Input } from '/src/manage-input.js';
import { GameStates } from '/src/game-states.js';
import { gameLoop } from '/src/set-fps.js';
import { canvas, CANVAS_HEIGHT, CANVAS_WIDTH, context, gameFrames, resetGameFrames, incrementGameFrames } from '/src/global-data.js';

//i manage files like shit, please someone help me
Input.init();

function handleLog() {
    if (GameStates.lastIsPaused !== GameStates.isPaused || GameStates.lastPlayerScore !== GameStates.playerScore ||
        GameStates.lastEnemyScore !== GameStates.enemyScore) {
      console.log("Pause", GameStates.isPaused, GameStates.playerScore, GameStates.enemyScore);
      for (const p of playersArray) {
        if (!(p.id == 1 || p.id === 2)) continue;
        console.log(p, p.pokemonImage);
      }
      GameStates.lastIsPaused = GameStates.isPaused;
      GameStates.lastPlayerScore = GameStates.playerScore;
      GameStates.lastEnemyScore = GameStates.enemyScore;
    }
}

/**loop for creating a player, player 1 has id 1, player 6 has id 11*/
function createPlayer(playerTeam1Number, playerTeam2Number) {
    const players = [];

    let i = 1;
    while (i <= playerTeam1Number) {
        players.push(new Player(i));
        i++;
    }
    
    i = 1;
    while (i <= playerTeam2Number) {
        players.push(new Player(i + 100));
        i++;
    }

    return players;
}

class Pokemon {
    constructor(speciesId) {
        const data = allSpecies[speciesId];
        if (!data) throw new Error("Unknown species");
        Object.assign(this, data, { species: speciesId });
    }
}

const playersArray = createPlayer(5, 5); //should be based on gamemode
for (const p of playersArray) {
    p.pokemon = new Pokemon(SpeciesId.BULBASAUR); //always bulbasaur for now
}


/** The base function of game rendering players, objects and field */
export function draw() {
    handleLog();
    if (GameStates.isPaused) {
        return;
    }

    if (!context) {
        console.log("ContextNotLoaded?");
        return;
    }
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (const p of playersArray) {
        if (p.id === 1) p.updatePokemonPosition(true);
        if (p.id !== 1) p.updatePokemonPosition(false);
        p.correctPokemonState();
        p.getPokemonFolderImage();
        p.getPokemonImage();
        
        p.reduceTimers();
    }

    //multiple loops for now cause we need hp bar to be placed above
    for (const p of playersArray) {
        p.playerUi.updateHpBar();
    }

    //should be its own function ?
    incrementGameFrames();
    if (gameFrames >= Number.MAX_SAFE_INTEGER) {
        resetGameFrames();
    }
}

requestAnimationFrame(gameLoop);
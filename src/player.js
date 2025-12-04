import { SpeciesId } from "/src/enums/species-id.js";
import { AbilityId } from "/src/enums/ability-id.js";
import { allSpecies } from "/src/data/data-lists.js";
import { SpriteAnim } from "/src/enums/sprite-anim.js";
import { BattleUi } from "/src/battle-ui.js"
import { Input } from '/src/manage-input.js';
import { canvas, CANVAS_HEIGHT, CANVAS_WIDTH, context, gameFrames } from '/src/global-data.js';
import { randomWithOdds } from "/src/utils/common.js"


/** create a player in the game, will take a species arg to determine it's stats*/
export class Player {
    constructor(id, speciesId) {
        this.id = id;
        this.pokemon = speciesId;
        this.pokemonLevel = 1;
        this.sizeX = 40; 
        this.sizeY = 40;
        this.positionX = this.getPosXwithId();
        this.positionY = this.getPosYwithId();
        this.collision = { x: this.positionX - this.sizeX / 2, y: this.positionY - this.sizeY / 2, width: this.sizeX, height: this.sizeY };
        this.speedX = 0;
        this.speedY = 0;
        this.lastSpeedX = 0; //to get the sprite visual when idle
        this.lastSpeedY = 0;
        this.keyPress = new Set();
        this.pokemonImage = new Image();
        this.pokemonImage.src = `/image/0/Idle-Anim.png`;
        this.imageFrameSpeed = 10; //change this to change speed of animation
        this.frameX = 0;
        this.frameY = 0; //YPos of the sprite
        this.maxFrame = 1; //set the loop of the animation
        this.walking = false
        this.idle = true;
        this.damageControl = 0; //timer for damage reaction, depend on Def, or SpeDef if move is Special, both if status
        this.attack = 0; //don't forget animation speed depend on pokemon speed
        this.movingAttack = 0;
        this.up = false;
        this.down = false;
        this.right = false;
        this.left = false;
        //these may not be used but just in case they are available
        this.lastUp = false;
        this.lastDown = false;
        this.lastRight = false;
        this.lastLeft = false;
        this.playerUi = new BattleUi(this.id, this.positionX, this.positionY, this.sizeX, this.sizeY);
        this.collisionActive = true;
        //should be an array of [itemId[lvl]]
        this.items = [];
        this.speed = 0;
    }

    //attacking should set speed to 0 and atacking/taking control damage 
    // should prevent pokemon to respond to commands
    correctPokemonState() {
        if (this.damageControl) {
            this.idle = false;
            this.walking = false;
            this.attack = 0;
            return;
        }
        if (this.attack ||this.movingAttack) {
            this.idle = false;
            this.walking = false;
            return;
        }
        
        if (this.speedX || this.speedY) {
            this.walking = true;
            this.idle = false;
        } else {
            this.walking = false;
            this.idle = true;
        }
    }

    imageTypeFromState() {
        if (this.damageControl >= 1) {
            this.maxFrame = 2;
            this.sizeX = 40;
            this.sizeY = Math.round(448 / 8);
            return;
        }
        if (this.attack >= 1 || this.movingAttack >= 1) {
            this.maxFrame = 11;
            this.sizeX = Math.round(704 / 11);
            this.sizeY = Math.round(576 / 8);
            return;
        }
        if (this.idle) {
            this.maxFrame = 3;
            this.sizeX = 32;
            this.sizeY = 40;
            return;
        }
        if (this.walking) {
            this.maxFrame = 6;
            this.sizeX = 40;
            this.sizeY = 40;
            return;
        }
    }

    calcFrameDuration(moving) {
        let totalDuration = 0;
        let frame = 0;
        const lastFrame = 10;
        while (frame <= lastFrame) {
            totalDuration += moving ? this.getMovingAttackFrameSpeed(frame) : this.getAttackFrameSpeed(frame);
            frame++;
        }
        return totalDuration / (lastFrame + 1);
    }

    getAttackFrameSpeed(frame) {
        const thisFrame = frame ? frame : this.frameX;
        if (thisFrame > 8) {
            return 0.22;
        }
        return 0.44;
    }

    getMovingAttackFrameSpeed(frame) {
        const thisFrame = frame ? frame : this.frameX;
        if (thisFrame > 8) {
            return 0.18;
        }
        return 0.36;
    }

    correctFrameSpeed() {
        //damage control will depend on moves
        if (this.damageControl) {
            this.imageFrameSpeed = 1;
            return;
        }

        //attack speed anim should depend on pokemon speed stat
        if (this.attack) {
            this.imageFrameSpeed = this.getAttackFrameSpeed();
            return;
        }
        if (this.movingAttack) {
            this.imageFrameSpeed = this.getMovingAttackFrameSpeed();
            return;
        }
        if (this.idle) {
            if (this.frameX < 1) {
                this.imageFrameSpeed = 0.03;
                return;
            }
            this.imageFrameSpeed = 0.3;
            return;
        }
        if (this.walking) {
            this.imageFrameSpeed = (this.speed * 0.025) + 0.125;
            return;
        }
    }

    //We don't use this.up and others here cause we actually want this to be based on speed and lastSpeed
    imageDirection() {
        if (this.movingAttack) return;
        let up = false;
        let down = false;
        let right = false;
        let left = false;
        //first check if a command is pressed
        if (this.up || this.down || this.left || this.right) {
            //yes then we check the actual speed
            if (this.speedY > 0) down = true;
            if (this.speedY < 0) up = true;
            if (this.speedX > 0) right = true;
            if (this.speedX < 0) left = true;
        } else {
            //else check the last speed
            if (this.lastSpeedY > 0) down = true;
            if (this.lastSpeedY < 0) up = true;
            if (this.lastSpeedX > 0) right = true;
            if (this.lastSpeedX < 0) left = true;
        }

        if (down && right) {
            this.frameY = 1;
            return;
        }
        if (up && right) {
            this.frameY = 3;
            return;
        }
        if (up && left) {
            this.frameY = 5;
            return;
        }
        if (down && left) {
            this.frameY = 7;
            return;
        }
        if (down) {
            this.frameY = 0;
            return;
        }
        if (right) {
            this.frameY = 2;
            return;
        }
        if (up) {
            this.frameY = 4;
            return;
        }
        if (left) {
            this.frameY = 6;
            return;
        }
    }

    reduceTimers() {
        if (this.attack > 0) this.attack = Math.max(0, this.attack - 1);
        if (this.movingAttack > 0) this.movingAttack = Math.max(0, this.movingAttack - 1);
        if (this.damageControl > 0) this.damageControl = Math.max(0, this.damageControl - 1);
    }

    getPokemonImage() {
        this.imageTypeFromState();
        this.imageDirection();
        const drawFrame = () => {
          while (this.frameX >= this.maxFrame) {
            this.frameX = this.frameX - this.maxFrame;
          }
          this.correctFrameSpeed();
          context.drawImage(
            this.pokemonImage,
            Math.floor(this.frameX) * this.sizeX, this.frameY * this.sizeY,
            this.sizeX, this.sizeY,
            this.positionX - this.sizeX / 2,
            this.positionY - this.sizeY / 2,
            this.sizeX, this.sizeY
          );
          this.frameX = (this.frameX + this.imageFrameSpeed);
        };

        if (this.pokemonImage.complete) {
          drawFrame();
        } else {
          this.pokemonImage.onload = drawFrame;
        }
        
    }

    getPokemonFolderImage() {
        const pSpecies = this.pokemon.species;
        const states = [
            { condition: this.damageControl, src: `/image/${pSpecies}/Pain-Anim.png` },
            { condition: this.attack, src: `/image/${pSpecies}/Attack-Anim.png` },
            { condition: this.movingAttack, src: `/image/${pSpecies}/Attack-Anim.png` },
            { condition: this.idle, src: `/image/${pSpecies}/Idle-Anim.png` },
            { condition: this.walking, src: `/image/${pSpecies}/Walk-Anim.png` }
        ];

        for (const state of states) {
            if (state.condition) {
                if (this.pokemonImage.getAttribute('src') !== state.src) {
                    this.pokemonImage.src = state.src;
                    this.frameX = 0;
                }
                return;
            }
        }
    }

    //should start from the middle of the screen
    getPosXwithId(){
      const r = this.id % 2 ? 40 : 0;
      if (this.id <= 100) return 10 + r + this.sizeX;
      return 790 - this.sizeX - r;
    }

    getPosYwithId(){
      if (this.id <= 100) return this.id * 72 - this.sizeY;
      return (this.id - 100) * 72 - this.sizeY;
    }

    getPlayerPokemon(chosenSpecies) {
        //this.pokemon = new Pokemon(this.id, chosenSpecies);
    }

    getPlayerCollision(PosX, PosY, SizeX, SizeY) {
        return { x: PosX - SizeX / 2, y: PosY - SizeY / 2, width: SizeX, height: SizeY }; 
    }

    //this shit
    pokemonTryAttacking(player) {
      const atkDuration = (10 + 1) / this.calcFrameDuration(false);
      const movingAtkDuration = (10 + 1) / this.calcFrameDuration(true);
      if (player) {
        if (Input.keys.has('z')) {
          this.attack = atkDuration;
        } else if (Input.keys.has('w')) {
          this.movingAttack = movingAtkDuration;
        }
      } else {
        if (randomWithOdds()) {
          this.attack = atkDuration;
        } else if (randomWithOdds()) {
          this.movingAttack = movingAtkDuration;
        }
      }
    }

    updatePokemonPosition(player) {
        if (!this.attack && !this.movingAttack && !this.damageControl) this.pokemonTryAttacking(player);

        if (this.attack) {
            this.speedX = 0;
            this.speedY = 0;
            this.speed = 0;
            if (!this.collisionActive) return;
            this.tryCorrectPosition;
            return;
        }

        if (!player) {
            this.up = randomWithOdds();
            this.down = randomWithOdds();
            this.right = randomWithOdds();
            this.left = randomWithOdds();
        } else {
            this.up = Input.keys.has('arrowup');
            this.down = Input.keys.has('arrowdown');
            this.right = Input.keys.has('arrowright');
            this.left = Input.keys.has('arrowleft');
        }

        let dirX = 0, dirY = 0;

        if (this.up) dirY -= 1;
        if (this.down) dirY += 1;
        if (this.left) dirX -= 1;
        if (this.right) dirX += 1;

        if (dirX !== 0 && dirY !== 0) {
            dirX *= Math.SQRT1_2;
            dirY *= Math.SQRT1_2;
        }

        this.speedX += dirX * 0.3;
        this.speedY += dirY * 0.3;

        let speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        const maxSpeed = 2.5;

        if (speed > maxSpeed) {
            this.speedX = (this.speedX / speed) * maxSpeed;
            this.speedY = (this.speedY / speed) * maxSpeed;
        }

        if (!(this.up || this.down)) {
            this.speedY = Math.sign(this.speedY) * Math.max(0, Math.abs(this.speedY) - 0.1);
        }
        if (!(this.left || this.right)) {
            this.speedX = Math.sign(this.speedX) * Math.max(0, Math.abs(this.speedX) - 0.1);
        } 

        this.speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        if (this.up || this.down || this.right || this.left) {
            this.lastDown = this.down;
            this.lastRight = this.right;
            this.lastLeft = this.left;
            this.lastUp = this.up;
            this.lastSpeedX = this.speedX;
            this.lastSpeedY = this.speedY;
        }
        
        if (!this.collisionActive) return;
        this.tryCorrectPosition();
    }

    tryCorrectPosition() {
        const PosX = this.positionX;
        const PosY = this.positionY;
        let newPosX = this.speedX + PosX;
        let newPosY = this.speedY + PosY;

        let speedX = this.speedX;
        let resetX = false;
        //first check if player has any speed, if not check it is inside an object, if not return,
        // then check if player would have reach collision with an object, if not return, else
        //check the four axis until player is outside collisions,
        while (this.isCollidingX(newPosX)) {
          speedX = speedX * 0.5;
          newPosX = speedX + PosX;
          resetX = true;
          if (Math.abs(speedX) < 0.1) {
            speedX = 0;
            break;
          }
        }

        if (resetX) this.speedX = 0;
        this.positionX = speedX + PosX;

        let speedY = this.speedY;
        let resetY = false;
        while (this.isCollidingY(newPosY)) {
          speedY = speedY * 0.5;
          newPosY = speedY + PosY;
          resetY = true;
          if (Math.abs(speedY) < 0.1) {
            speedY = 0;
            break;
          }
        }
        if (resetY) this.speedY = 0;
        this.positionY = speedY + PosY;
        this.updatePlayerUiPos();
    }

    //collision are not directly based on sprite size because sprite size can change when colliding with objects,
    isCollidingX(collision) {
      return collision - this.pokemon.sizeX <= 0 || collision + this.pokemon.sizeX >= CANVAS_WIDTH;
    }

    isCollidingXright() {
        return;
    }

    //should difference Right, Left, Up, Down
    isCollidingY(collision) {
      return collision - (this.pokemon.sizeY + this.pokemon.posY) <= 0 || 
             collision + (this.pokemon.sizeY + this.pokemon.posY) >= CANVAS_HEIGHT;
    }

    updatePlayerUiPos() {
      this.playerUi.positionX = this.positionX;
      this.playerUi.positionY = this.positionY;
    }
}
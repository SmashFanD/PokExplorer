import { canvas, CANVAS_HEIGHT, CANVAS_WIDTH, context, gameFrames } from '/src/global-data.js';

export class BattleUi{
    constructor(id, positionX, positionY, sizeX, sizeY) {
        this.id = id;
        this.positionX = positionX;
        this.positionY = positionY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        //hp bar should not be hide by anything so we need to make collision
        // for it that detect others ui element that have same or above priority
        this.hpBarOverlay = new Image();
        this.hpBarOverlay.src = (this.id === 1 
            ? `/image/ui/overlay_hp_player.png` 
            : (this.id > 100 
                ? `/image/ui/overlay_hp_enemy.png` 
                : `/image/ui/overlay_hp_ally.png`));
        
    }

    updateHpBar() {
        const drawHpBarOverlay = () => {
          context.drawImage(
            this.hpBarOverlay,
            0, 0,
            this.sizeX, this.sizeY,
            this.positionX - this.sizeX / 2,
            this.positionY - this.sizeY / 2,
            this.sizeX, this.sizeY
          );
          
        };

        if (this.hpBarOverlay.complete) {
          drawHpBarOverlay();
        } else {
          this.hpBarOverlay.onload = drawHpBarOverlay;
        }
    }
}
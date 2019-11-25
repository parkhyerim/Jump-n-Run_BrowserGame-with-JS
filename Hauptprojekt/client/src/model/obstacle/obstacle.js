/**
 * Created by nicole on 22.05.17.
 */

'use strict';

/** Klasse für Hindernisse */
class Obstacle extends Phaser.Sprite {
    constructor(game, x, y, name) {
        super(game, x, y, name);
        this.game.physics.enable(this);
        this.body.allowGravity = false;
        this.body.immovable = true;
        this.activated = false;
        this.anchor.set(0.5);
        // für Speichern für die Ursprüngliche Position
        this.spawnPositionX = x;
        this.spawnPositionY = y;
    }

}

class HorizontalMovePlatforms extends Obstacle {
    constructor(game, x, y, name) {
        super(game, x, y, name);
        this.scale.setTo(0.7, 0.7);
        //this.anchor.setTo(0.5, 0.5);

        // Richtung der Bewegung
        this.direction = "right";
    }

    _moveWithPlatform(player){
        if(player.body.y < this.body.y){
            player.x += this.deltaX;
        }
    }
    // neue move und die tween wurde ersetzt
    // siehe update call 126
    _movePlatform() {
        // 10x32 px
        const range = 320;

        if (this.direction === "right") {
            this.x += 3;
        }
        else {
            this.x -= 3;
        }

        // bewege nur in einem Bereich x <-> x+range
        // hier bestimmt er die direction
        if (this.x >= this.spawnPositionX + range) {
            this.direction = "left";
        } else if (this.x < this.spawnPositionX) {
            this.direction = "right";
        }
    }

    // braucht man, um von Playstate Position zu updaten (weil kein tween)
    updateCall() {
        this._movePlatform();
    }
}

class VertikalMovePlatforms extends Obstacle {
    constructor(game, x, y, name) {
        super(game, x, y, name);
        this.scale.setTo(0.7, 0.7);
        this.anchor.setTo(0.5, 0.5);

        // Richtung der Bewegung
        this.direction = "top";
    }

    // einfach das gleiche, nur mit y Achse
    _moveWithPlatform(player){
        if(player.body.y < this.body.y){
            player.y += this.deltaY;
        }
    }

    _movePlatform() {
        // 5x32 px
        const range = 160;

        if (this.direction === "top") {
            this.y -= 1;
        }
        else {
            this.y += 1;
        }

        // bewege nur in einem Bereich y <-> y+range
        if (this.y <= this.spawnPositionY) {
            //Richtung in die die Bewegung stattfindet
            this.direction = "bottom";
        } else if (this.y > this.spawnPositionY + range) {
            this.direction = "top";
        }
    }

    // braucht man, um von Playstate Position zu updaten (weil kein tween)
    updateCall() {
        this._movePlatform();
    }
}



class DropDownPlatforms extends Obstacle {
    constructor(game, x, y, name) {
        super(game, x, y, name);
        this.scale.setTo(0.7, 0.8);
    }

    _dropDownPlatforms(player) {
        if(!this.activated) {
            // Abfrage, ob wir auch von oben springen
            if(player.body.y < this.body.y) {
                this.activated = true;
                let a = this.game.add.tween(this).to({y: this.game.world.height}, 500, Phaser.Easing.Linear.None, true, 600, 0, false);

                // nicht benannte Funktion
                a.onComplete.add(function(){
                let b = this.game.add.tween(this).to({y: this.spawnPositionY} , 1000, Phaser.Easing.Linear.None, true, 500, 0, false);
                b.onComplete.add(function(){
                   this.activated = false;
                   }.bind(this));
                }.bind (this));
            }
        }
    }

}

class ButtonPlatforms extends Obstacle {
    constructor(game, x, y, name) {
        super(game, x, y, name);
        this.scale.x = 0.2;
        this.scale.y = 0.2;
        this.anchor.setTo(0, 0.001);
    }
}


let onPlayerVsSpikes = function onPlayerVsSpikesCollision(player, spike, play) {
    player.damage(play);
};














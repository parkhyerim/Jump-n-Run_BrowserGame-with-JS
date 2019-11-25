/**
 * Created by luca on 13.05.17.
 */

'use strict';

/** Klasse für Spieler, Unterklasse von Creature */

class Player extends Phaser.Sprite {
    /**
     * Konstruktor von den Spielern
     * @param {PandaGame} game
     * @param {number} x - x-Koordinate
     * @param {number} y - y-Koordinate
     * @param {string} name - Name des sprites (?) wenn man gleiche Animationen nimmt, muss man das nicht angeben
     */
    constructor(game, x, y, name = 'player') {
        super(game, x, y, name);
        this.anchor.setTo(0.5, 0.5); //central point of the sprite
        this.game.physics.enable(this); //enable physics

        //properties
        this.body.bounce.y = 0.;
        this.body.gravity.y = 450; // the higher the value, the heavier the object
        this.body.collideWorldBounds = true; //prevent the player to get out of the screen
        this.health = 12; //aktuelle Leben, das beim Start des Spiels angezeigt wird
        this.maxHealth = 1; //maxHealth = 1, d.h. wenn die Spieler deren 12 Leben entdültig verlieren, kommt es zum Tod
        this.alive = true;
        this.speed = 0;
        this.jumpSpeed = 0;
        this.shooting = false;
        this.body.enable = true;
        this.invincible = false;

    }

    //add move method to players
    move(direction) {
        this.body.velocity.x = direction * this.speed; //velocity = Geschwindigkeit
        //Spiegeln der Sprites
        if (this.body.velocity.x < 0) {
            this.scale.x = -1;
        }
        else if (this.body.velocity.x > 0) {
            this.scale.x = 1;
        }
    }

    bounce() {
        const BOUNCE_SPEED = 180;
        this.body.velocity.y = -BOUNCE_SPEED;
    }

    //jumping for players
    jump() {
        let canJump = false;
        if (this.body.blocked.down || this.body.touching.down) {
            canJump = true;
        }
        //Spieler muss Boden berühren
        if (canJump || this.isBoosting) { //Boosting = Steigern. Gibt Anschub zum springen
            this.body.velocity.y = -this.jumpSpeed; //der eigentliche Sprung
            this.isBoosting = true;
        }
        return canJump;
    }


    stopJumpBoosting() {
        this.isBoosting = false; //kein jump, d.h. es passiert nichts
    }

    damage(play) {
        if (this.body.enable && this.alive && !this.invincible) {
            this.body.enable = false;
            this.invincible = true;

            //Update score
            play.health -= 1;
            play.text1.setText(play.health + ' x');
            play.sfx.damage_player.play();

            this.animations.play('damage');

            // Actual damage: player bounces everytime he gets hurt
            play.add.tween(this).to({y: this.y - 10, x: this.x - 15}, 80, Phaser.Easing.Bounce.Out, true);

            //Add fading
            play.add.tween(this).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 0, 1000, true);
            //Remove fading
            play.time.events.add(500, () => {
                play.tweens.removeFrom(this);
                this.alpha = 1.0;
            }, this);

            this.game.time.events.add(200, () => { // noch 200ms nicht beweglich
                this.body.enable = true;
            }, this);

            this.game.time.events.add(1000, () => { // noch 1000ms unverwundbar
                this.invincible = false;
            }, this);

        }

        //GAME OVER - die
        if (play.health < 1) {
            //remove previous damage sound & add new sound
            play.sfx.gameover.play();

            // damit man nicht minus Leben hat und kein crash bekommt
            Object.values(play.players).forEach((player) => {
                player.shooting = false;
                player.alive = false;
                player.body.enable = false;
            });

            play.camera.fade(0x000000, 1500, false);
            play.time.events.add(1500, () => {
                this.game.state.start('gameover', true, false, {gameName: play.gameName});
            }, this);

        }

    }
}

class PlayerOne extends Player{
    constructor(game, x, y, spritesheet = 'player1', frame = 0) {
        super(game, x, y, spritesheet, frame);

        //animation
        this.animations.add('run', [5, 7, 8, 10, 11], 14, true); //loop at 14
        this.animations.add('stop', [4]);
        this.animations.add('jump', [5, 6]);
        this.animations.add('damage', [6, 5, 7, 6, 5, 7], 7);

        //properties
        this.speed = 210;
        this.jumpSpeed = 410;

    }

}

class PlayerTwo extends Player{
    constructor(game, x, y, spritesheet = 'player2', frame = 0){
        super(game, x, y, spritesheet, frame);

        //animation
        this.animations.add('run', [5, 7, 8, 10, 11], 14, true); //loop at 14
        this.animations.add('stop', [4]);
        this.animations.add('jump', [5, 6]);
        this.animations.add('damage', [6, 5, 7, 6, 5, 7], 7);

        //properties
        this.speed = 250;
        this.jumpSpeed = 265;

    }

}

//Collision - Player weapon

let arrowHitsEnemy = function arrowHitsEnemyCollision(enemy, arrow, play){
    //when an arrow hits an enemy, we kill them both
    play.sfx.hit_enemy.play();
    arrow.kill();
    enemy.die();

};


let arrowHitsPlatform = function arrowHitsPlatformCollision(arrow){
    //when an arrow hits a platform, we kill the arrow
    arrow.kill();

};


















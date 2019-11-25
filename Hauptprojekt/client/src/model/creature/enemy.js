'use strict';


/** Klasse für Gegner, Unterklasse von Kreatur */

class Enemy extends Phaser.Sprite {


    /**
     * Konstruktor der Oberklasse
     * man muss die ersten 5 Parameter in der Reihenfolge angeben
     * @param game
     * @param x
     * @param y
     * @param spritesheet  Welches spritesheet and Phaser.Sprite übergeben wird
     * @param frame - welches sprite von spritesheet soll verwendet werden

     */
  constructor(game, x, y, spritesheet='enemy', frame=0){
      super(game, x, y, spritesheet, frame);

      this._speed = 100;
      this.maxHealth = 1;
      this.health = this.maxHealth;
      this.shootOnEnergy = false;
      this.shootOnCoin = false;
      this.collideWithInvisibleWall = true;

      // dummy animations, die eigentlichen werden in den Kindklassen definiert
      this.animations.add('stop',[0]);
      this.animations.add('left_run', [0]);
      this.animations.add('right_run', [0]);
      this.animations.add('die', [0]);

      this.game.physics.enable(this);
      this.body.collideWorldBounds = true;
      this.body.gravity.y = 800;
      this.body.velocity.x = this._speed;
      this.anchor.set(0.5);

      this.spawnPositionX = x;
      this.spawnPositionY = y;
    }


  update() {
      if (this.body.enable) {
          // check against walls and reverse direction if necessary
          if (this.body.enable && (this.body.touching.right || this.body.blocked.right)) {
              this.body.velocity.x = -this._speed;// turn left
          } else if (this.body.enable && (this.body.touching.left || this.body.blocked.left)) {
              this.body.velocity.x = this._speed; // turn right
          }

          // check velocity and play proper animation
          if (this.body.velocity.x < 0) {
              this.animations.play('left_run');
          } else {
              this.animations.play('right_run');
          }
      }

  }

  die() {
      this.body.enable = false;
      this.health -= 1;
      let scale = 1.0 - (this.maxHealth-this.health)/this.maxHealth;
      this.tint = 0xff0000 + 0x00ffff*scale;
      this.animations.play('die', null, false, false).onComplete.addOnce(()=> {
          if (this.health <= 0){
              this.kill();
              this.destroy();
          }
          else {
              this.body.enable = true;
              this.update(); // für animation
          }
      });
  }
}


class EnemyMonkey extends Enemy {
    constructor(game, x, y, spritesheet='enemy', frame=0) {
        super(game, x, y, spritesheet, frame);

        this.animations.add('stop',[0]);
        this.animations.add('left_run', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 20, true);
        this.animations.add('right_run', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20, true);
        this.animations.add('die', [1, 4, 10, 7, 10, 4, 1, 4, 10, 7, 10, 4, 1], 13);

        this.body.allowGravitiy = true;
    }
}

function rgbToHex (r, g, b) {    return "0x" + ((1 << 24) + (r << 16) + (g << 8) +b) .toString(16).slice(1);}
class EnemyGorilla extends Enemy{
    constructor(game, x, y, spritesheet='enemy_gorilla', frame=0) {
        super(game, x, y, spritesheet, frame);

        this.health = 15;
        this.maxHealth = 15;


        this.scale.setTo(1.2);
        this.animations.add('stop', [3]);
        this.animations.add('left_run', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 20, true);
        this.animations.add('right_run', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20, true);
        this.animations.add('die', [1, 3, 1, 6, 1], 20);

        this.body.allowGravitiy = true;
        this.body.gravity.y = 0.1;
        this.hasJumped = false;

        this.healthbar = this.game.add.graphics(0,0);
        this.healthbar.anchor.set(0.5);
        this.healthbar.x=0; this.healthbar.y = -0.5*this.body.height -5;
        this.addChild(this.healthbar);
        this.updateHealthbar();

        this.healthbarr = this.game.add.graphics(0,0);
        this.healthbarr.anchor.set(0.5);
        this.healthbarr.x=0; this.healthbarr.y = -0.5*this.body.height -5;
        this.healthbarr.beginFill(0x000000);
        this.healthbarr.lineStyle(1, 0x000000, 1);
        this.healthbarr.moveTo(-0.5*this.body.width,0);
        this.healthbarr.lineTo(+0.5*this.body.width, 0);
        this.healthbarr.endFill();
        this.addChild(this.healthbarr);

        this.throwTimerEvent = this.game.time.events.loop(500, ()=>{
            if (Math.random() > 0.6) {
                this.throwBanana();
            }
        }, this);

        this.jumpTimerEvent = this.game.time.events.loop(3000, ()=>{
            this.doJump();
        }, this);



    }

    update() {
        super.update();

        if (this.hasJumped && this.body.blocked.down) {
            this.game.camera.shake(0.01, 500);
            this.game.state.states.play.sfx.impact.play();
            this.hasJumped = false;
        }
    }

    die() {
        if (this.body.enable) {
            this.body.enable = false;
            this.health -= 1;
            this.updateHealthbar();
            this.animations.play('die', null, false, false).onComplete.addOnce(()=> {
                if (this.health <= 0){
                    this.game.time.events.remove(this.jumpTimerEvent); // sonst gibt es das Event mit gelöschtem Gegner
                    this.game.time.events.remove(this.throwTimerEvent); // sonst gibt es das Event mit gelöschtem Gegner

                    // Gorilla tot => next Level
                    this.game.state.states.play.readyForNextLevel = true;
                    this.game.state.states.play.sfx.win.play();
                    this.game.state.states.play._goToNextLevel();
                }
                else {
                    this.update(); // für animation
                    this.game.time.events.add(500, ()=>{ // noch 500ms unverwundbar
                        this.body.enable = true;
                    }, this);
                }
            });
        }
    }

    throwBanana() {
        let ban = new EnemyBanana(this.game, this.x, this.y);
        ban.body.velocity.x = ((Math.random()<0.5)?-1.0:+1.0)*((Math.random())*200 + 200);//200;
        ban.body.velocity.y = -700+ -(Math.random())*200;//-1000;
        ban.body.gravity.y = 1;
        this.game.state.states.play.enemies.add(ban);
        ban.updateRoation();

    }

    doJump() {
        this.body.velocity.y = -800;
        this.hasJumped = true;
    }

    updateHealthbar() {
            this.healthbar.clear();
            let x = (this.health / this.maxHealth) * 100;
            let colour = rgbToHex((x > 50 ? 1-2*(x-50)/100.0 : 1.0) * 255, (x > 50 ? 1.0 : 2*x/100.0) * 255, 0);
            this.healthbar.beginFill(colour);
            this.healthbar.lineStyle(10, colour, 1);
            this.healthbar.moveTo(-0.5*this.body.width,-5);
            this.healthbar.lineTo(-0.5*this.body.width + this.body.width * this.health / this.maxHealth, -5);
            this.healthbar.endFill();
    }
}

class EnemyBird extends Enemy {
    constructor(game, x, y, spritesheet='enemy_bird', frame=0) {
        super(game, x, y, spritesheet, frame);

        this._speed = 20;
        this.body.velocity.x = this._speed; // damit die Geschwindigkeit auch am Anfang stimmt
        this.body.allowGravity = false; // Vögel bleiben in der Luft
        this.shootOnCoin = true;

        this.scale.setTo(0.6);
        this.animations.add('stop', [15]);
        this.animations.add('left_run', [0, 1, 2, 3, 2, 1], 10, true);
        this.animations.add('right_run', [4, 5, 6, 7, 6, 5, 4], 10, true);
        this.animations.add('die', [12, 13, 14, 15, 14, 13, 12, 13, 14, 15, 14, 13, 12, 12, 13, 14, 15, 14, 13, 12], 10);
    }
}


class EnemyHunter extends EnemyBird {
    constructor(game, x, y, spritesheet='enemy_bird', frame=0) {
        super(game, x, y, spritesheet, frame);
        this.targetPlayer = null;
        this.shootOnCoin = false;
        this._speed = 50;
        this.collideWithInvisibleWall = false;

        // damit man auch sieht welcher Vogel jagt
        this.t = new Phaser.Text(game, 0, -10, "Hunter", {fontSize: '14px'});
        //console.warn("bla " + this.game);
        this.t.anchor.set(0.5, 1);
        this.addChild(this.t);


        // Das könnte auch mit einem Custom Property in Tiled überschrieben werden
        // aber für Luca ist es einfacher mit server
        if (Math.random() < 0.5) {
            //this.target = "player1";
            this.targetPlayer = this.game.state.states.play.players.one;
        }
        else {
            //this.target = "player2";
            this.targetPlayer = this.game.state.states.play.players.two;
        }
    }

    update() {
        if (this.body.enable) {
            if (this.targetPlayer === null || this.targetPlayer.alive === false || Math.abs(this.targetPlayer.x, this.x) <= 1400) { // Target Player gibt es nicht oder ist tot
                this.body.velocity.y = 0;
                super.update();
            }
            else {// Target Player lebt noch
                if (Math.round(this.x) === Math.round(this.targetPlayer.x)) { // x Koordinate ist gleich => stehen bleiben
                    this.body.velocity.x = 0;
                }
                else if (this.x < this.targetPlayer.x) {
                    this.body.velocity.x = +1.0 * this._speed;
                    this.animations.play('right_run');
                }
                else { // this.x > this.target.x
                    this.body.velocity.x = -1.0 * this._speed;
                    this.animations.play('left_run');
                }

                if (Math.round(this.y) === Math.round(this.targetPlayer.y)) { // y Koordinate ist gleich => stehen bleiben
                    this.body.velocity.y = 0;
                }
                else if (this.y < this.targetPlayer.y) {
                    this.body.velocity.y = +1.0 * this._speed;
                }
                else { // this.y > this.target.y
                    this.body.velocity.y = -1.0 * this._speed;
                }
            }
        }
    }
}


class EnemySpider extends Enemy {
    constructor(game, x, y, spritesheet='enemy_spider', frame=0) {
        super(game, x, y, spritesheet, frame);

        this._speed = 140;
        this.body.velocity.x = this._speed; // damit die Geschwindigkeit auch am Anfang stimmt
        this.body.gravity.y = 1;

        this.animations.add('stop', [15]);
        this.animations.add('left_run',  [ 7,  8,  9, 10, 11, 12], 15, true);
        this.animations.add('right_run', [21, 22, 23, 24, 25, 26], 15, true);
        this.animations.add('die', [6, 13, 20, 27, 6, 13, 20, 27, 6, 13, 20, 27], 12);

        this.jumpTimerEvent = this.game.time.events.loop(3000, ()=>{
            this.doJump();
        }, this);
    }

    doJump() {
        this.body.velocity.y = -500;
    }

    die() {
        super.die();
        if (this.health <= 0){
            this.game.time.events.remove(this.jumpTimerEvent); // sonst gibt es das Event mit gelöschter spider
        }
    }

}

class EnemyArrow extends Enemy {
    constructor(game, x, y, spritesheet='enemy_arrow', frame=0) {
        super(game, x, y, spritesheet, frame);

        this._speed = 180;
        this.body.velocity.x = this._speed; // damit die Geschwindigkeit auch am Anfang stimmt
        this.body.allowGravity = false; // Pfeile bleiben in der Luft
        this.collideWithInvisibleWall = false; // Pfeile schießen durch die unsichtbaren Wände

        this.animations.add('stop', [0]);
        this.animations.add('left_run',  [4], 1, true);
        this.animations.add('right_run', [8], 1, true);
        this.animations.add('die', [0], 60);
    }

    update() {
        // check velocity and play proper animation
        if (this.body.velocity.x < 0) {
            this.animations.play('left_run');
        } else {
            this.animations.play('right_run');
        }


        // Pfeile als Gegner "sterben" sofort wenn es eine Kollision gibt
        if (this.body.touching.down || this.body.touching.left || this.body.touching.right || this.body.touching.up ||
            this.body.blocked.down || this.body.blocked.left || this.body.blocked.right || this.body.blocked.up) {
            this.body.enable = false;
            this.kill();
            this.destroy();
        }

    }
}

class EnemyBanana extends Enemy {
    constructor(game, x, y, spritesheet = 'enemy_banana', frame = 0) {
        super(game, x, y, spritesheet, frame);

        this.scale.setTo(0.1);
        this.anchor.setTo(0.5);

        this._speed = 80;
        this.body.velocity.x = this._speed; // damit die Geschwindigkeit auch am Anfang stimmt
        this.body.allowGravity = true;
        this.collideWithInvisibleWall = false;
        this.body.bounce.x = 0.9;

        this.animations.add('stop', [0]);
        this.animations.add('left_run', [0], 1, true);
        this.animations.add('right_run', [0], 1, true);
        this.animations.add('die', [0], 4);
    }

    update() {
        // Bananen als Gegner "sterben" sofort wenn sie auf dem Boden aufschlagen
        if (this.body.touching.down || this.body.blocked.down) {
            this.body.enable = false;
            this.kill();
            this.destroy();
        }
        else if (this.body.onWall()) {
            this.updateRoation();
        }

    }

    updateRoation() {
        this.game.tweens.removeFrom(this);
        this.game.add.tween(this)
            .to({angle: ((this.body.velocity.x>0)?+1.0:-1.0 ) * 360}, 700, Phaser.Easing.Linear.easeInOut)
            .yoyo(false)
            .loop()
            .start();
    }
}


let onPlayerVsEnemy = function onPlayerVsEnemyCollision(player, enemy, play) {
    //positive value means, the player is falling
    if (player.body.velocity.y > 0) {
        play.sfx.hit_enemy.play();
        player.bounce(); //springe zur bounce() - Methode in player.js
        enemy.die(); //springe zur die() - Methode in enemy.js
    }
    else {
        // sonst stirbt Spieler instantly
        if (enemy.key === "enemy_hunter") {
            play.add.tween(enemy).to({y: enemy.y + 10, x: enemy.x + 25}, 80, Phaser.Easing.Bounce.Out, true);
        }
        else if (enemy.key === "enemy_bird") {
            play.add.tween(enemy).to({x: enemy.x + 30}, 80, Phaser.Easing.Bounce.Out, true);
        }
        player.damage(play);

    }

};

// 'use strict';

/** Klasse für Sammelbares, Oberklasse für energy und weapons */
class Collectable extends Phaser.Sprite {
    /**
     * Oberklasse für alle collectables
     * @param game
     * @param x
     * @param y
     * @param key - Sprite(sheet)
     * @param frame
     */
    constructor(game, x, y, key, frame=0){
        super(game, x, y, key, frame);
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this);
        this.body.allowGravity = false;

        this.spawnPositionX = x;
        this.spawnPositionY = y;
    }

    collect(player, playState) {
        this.kill();
    }
}

class Energy extends Collectable {
    constructor(game, x, y, key, frame=0){
        super(game, x, y, key, frame);
        // add 'up & down' animation via Phaser.Tween instances
        this.y -=3;
        this.game.add.tween(this)
            .to({y: this.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .loop()
            .start();
    }

    collect(player, playState) {
        super.collect(player, playState);

        playState.health += 1;
        playState.sfx.energy.play();
        updtLiveHUD(playState);

        // Gehe durch alle Gegner und erzeuge einen EnemyArrow wenn der enemy dafür konfiguriert ist
        // ACHTUNG: das geht nicht mit this.enemies.forEach !!!
        //          die Gruppe wird hier dynamisch verändert.
        let len = playState.enemies.length;
        for (let idx=0; idx<len; idx++) {
            let enemy = playState.enemies.getAt(idx);
            if (enemy.shootOnEnergy) {
                let arrow = new EnemyArrow(this.game, enemy.x, enemy.y);
                if (enemy.body.velocity.x < 0) {arrow.body.velocity.x=-1.0*arrow._speed;}
                playState.enemies.add(arrow);
            }
        }
    }
}

class Weapon extends Collectable {
    constructor(game, x, y, key, frame=0){
        super(game, x, y, key, frame);
        // add 'up & down' animation via Phaser.Tween instances
        this.y -=3;
        this.game.add.tween(this)
            .to({y: this.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .loop()
            .start();
    }

    collect(player, playState) {
        super.collect(player, playState);

        playState.sfx.energy.play();
        player.shooting = true;
        updtWeaponHUD(playState);
    }
}

class Food extends Collectable {
    constructor(game, x, y, key, frame=0){
        super(game, x, y, key, frame);
        // add 'up & down' animation via Phaser.Tween instances
        this.y -=3;
        this.game.add.tween(this)
            .to({y: this.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .loop()
            .start();
    }

    collect(player, playState) {
        super.collect(player, playState);

        playState.sfx.food.play();
        updtFoodHUD(playState);

        // Überprüfe ob alle Foods gesammelt wurden
        let foodRemaining = false;
        playState.food.forEach((food) => {
            foodRemaining = foodRemaining || food.alive;
        });

        if (!foodRemaining) {
            playState.readyForNextLevel = true;
        }
    }
}

class Coin extends Collectable {
    constructor(game, x, y, key, frame=0){
        super(game, x, y, key, frame);
        this.animations.add('drehen', [0, 1, 2, 3, 4, 5], 6, true);
        this.animations.play('drehen');
    }

    collect(player, playState) {
        super.collect();

        playState.sfx.coin.play();
        updtCoinHUD(playState);

        // Gehe durch alle Gegner und erzeuge einen EnemyArrow wenn der enemy dafür konfiguriert ist
        // ACHTUNG: das geht nicht mit this.enemies.forEach !!!
        //          die Gruppe wird hier dynamisch verändert.
        let len = playState.enemies.length;
        for (let idx=0; idx<len; idx++) {
            let enemy = playState.enemies.getAt(idx);
            if (enemy.shootOnCoin) {
                let arrow = new EnemyArrow(this.game, enemy.x, enemy.y);
                if (enemy.body.velocity.x < 0) {arrow.body.velocity.x=-1.0*arrow._speed;}
                playState.enemies.add(arrow);
            }
        }
    }
}





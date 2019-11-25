
'use strict';

const LEVEL_COUNT = 4;

/** Main State */
class PlayState extends Phaser.State {

    init(data) {
        // Festlegen der Steuerung für Spieler 1
        this.keys_player1 = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.LEFT,
            right: Phaser.KeyCode.RIGHT,
            up: Phaser.KeyCode.UP,
            fire1: Phaser.KeyCode.K,

        });
        // Festlegen der Steuerung für Spieler 2
        this.keys_player2 = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.A,
            right: Phaser.KeyCode.D,
            up: Phaser.KeyCode.W,
            fire2: Phaser.KeyCode.F,
        });
        // Taste, die beide Spieler benutzen können
        this.keys = this.game.input.keyboard.addKeys({
            space: Phaser.KeyCode.SPACEBAR,

            // Cheat: Next Level
            nextLvl: Phaser.KeyCode.M
        });

        // frisch gestartetes Spiel: in data steht nur gameName (von mainmenu state)
        if (!data.hasOwnProperty("nextLevel")) {
            //console.log(data);
            this.gameName = data.gameName;
            this.nextLevel = 1;
            this.readyForNextLevel = false;
            this.startGameTime = 0;
            this.pausedGameTime = 0;
            this.coinScore = 0;
            this.health = 12;
        }
        // entweder next Level oder es wurde geladen
        else {
            this.nextLevel = data.nextLevel;
            this.readyForNextLevel = data.readyForNextLevel;
            this.startGameTime = data.playedTime;
            this.coinScore = data.coinScore;
            this.health = data.health;
            this.gameName = data.gameName;

            // damit man in der create() die Überprüfung auf Savegame machen kann
            if (data.hasOwnProperty("tilemapObjects")) {
                this.loadedMap = new OwnTilemapObject(this.game, data.tilemapObjects.objects);
                // da game.time resettet ist, muss man das hier auch auf 0 setzen
                this.pausedGameTime = 0;
            }
            // man ist ins nächste level gekommen
            else {
                this.pausedGameTime = data.pausedGameTime;
            }
        }

        // globale Schwerkraft
        this.game.physics.arcade.gravity.y = 800;
    }

    create() {
        // Level (1, 2, 3, boss) laden anhand this.nextLevel Variable
        this.map = this.game.add.tilemap('tilemap' + this.nextLevel);
        this.map.addTilesetImage('tilesetPandaGame', 'tileset');

        // camera fade in (black)
        this.camera.flash('#000000', 1300);

        //Hintergrund, Bosslevel ist unterschiedlich
        if (this.nextLevel !== LEVEL_COUNT) {
            this.clouds = this.game.add.tileSprite(0, 0, 800, 640, 'background');
            this.clouds.fixedToCamera = true;
        }
        else {
            this.game.add.image(0, 0, 'boss_level_background');
        }

        this.game.stage.backgroundColor = "#000000";

        // Layers laden von tilemap
        loadLevel(this);

        /*
        hier wird geprüft, ob das Spiel geladen wurde:
        weil in _loadlevel() bereits die layers geladen wurden,
        kann man this.map überschreiben mit Tilemap-Objekt aus der JSON von der Datenbank
         */
        if (this.hasOwnProperty("loadedMap")) {
            this.map = this.loadedMap;
        }

        // object layers laden von tilemap
        spwnObjects(this);
        this._createWeapon();

        // kamera walls
        spwnCamWall(this);

        // head up display
        createHUD(this);

        // create sound entities
        this.sfx = ({
            food: this.game.add.audio('sfx:food'),
            coin: this.game.add.audio('sfx:coin'),
            energy: this.game.add.audio('sfx:energy'),
            jump: this.game.add.audio('sfx:jump'),
            impact: this.game.add.audio('sfx:impact'),
            gameover: this.game.add.audio('sfx:gameover'),
            damage_player: this.game.add.audio('sfx:damage'),
            hit_enemy: this.game.add.audio('sfx:hit_enemy'),
            arrow: this.game.add.audio('sfx:arrow'),
            win: this.game.add.audio('sfx:win')
        });

        // sonst wird immer wieder die Position aus dem Savegame genommen, wenn man ins nächste Level kommt
        delete this.loadedMap;
    }

    update() {
        //Update background: scroll in the opposite direction to the camera's movement
        if (this.nextLevel !== LEVEL_COUNT) {
            this.clouds.tilePosition.set(-this.game.camera.x, -this.game.camera.y);
        }

        this._handleCollisions();
        this._handleInput();
        hndlCam(this);

        // bewegliche Platformen (die ohne Button funktionieren)
        this.movePlatformsH.forEach((pf) => {
            pf.updateCall();
        });

        this.movePlatformsV.forEach((pf) => {
            pf.updateCall();
        });
    }

    // wird ausgeführt, wenn das Spiel pausiert wird
    paused() {
        // man muss start zeit haben
        // plus gespielte Zeit (seitdem man ins Spiel gekommen ist (durch time.reset()))
        // minus pausierte Zeit (weil totalElapsedSeconds nicht pausiert)
        this.playedTime = this.startGameTime + this.game.time.totalElapsedSeconds() - this.pausedGameTime;
        this.pauseMenu.visible = true;
    }

    // update-Funktion während game = paused, weil alles andere frozen ist
    pauseUpdate() {
        // Pause Taste = Leertaste
        if (this.keys.space.justDown) {
            this.game.paused = false;
        }
    }

    // wird ausgeführt, wenn man aus Pause rausgeht
    resumed() {
        this.pauseMenu.visible = false;
        // weil game.time immer weiter läuft...
        this.pausedGameTime += (this.game.time.pauseDuration/1000);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////   FUNCTIONS   ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Methode, die sich um Tastatur-Input für die Bewegungen der Spieler kümmert
     * @private
     */
    _handleInput() {
        //Player 1 inputs (Pfeiltasten + "K" zum schießen)
        if (this.keys_player1.fire1.isDown && this.players.one.shooting){
            this.fireWeapon();
            if(!this.sfx.arrow.isPlaying){
                this.sfx.arrow.play();
            }
        }
        //rechts
        if (this.keys_player1.right.isDown) {
            this.players.one.move(1);
            this.players.one.animations.play('run');
            this.players.one.facing = 'right';
        }
        //links
        else if (this.keys_player1.left.isDown) {
            this.players.one.move(-1); //rufe Methode move() von player.js auf
            this.players.one.animations.play('run');
            this.players.one.facing = 'left';
        }
        //stop
        else {
            this.players.one.move(0);
            this.players.one.animations.play('stop');
        }

        //Player 2 inputs (WAD + "F" zum schießen)
        if (this.keys_player2.fire2.isDown && this.players.two.shooting) {
            this.fireWeapon();
            if(!this.sfx.arrow.isPlaying){
                this.sfx.arrow.play();
            }
        }
        //rechts
        if (this.keys_player2.right.isDown) {
            this.players.two.move(1);
            this.players.two.animations.play('run');
            this.players.two.facing = 'right';
        }
        //links
        else if (this.keys_player2.left.isDown) {
            this.players.two.move(-1);
            this.players.two.animations.play('run');
            this.players.two.facing = 'left';
        }
        //stop
        else {
            this.players.two.move(0);
            this.players.two.animations.play('stop');
        }

        //Pause Taste = Leertaste
        if (this.keys.space.justDown) {
            this.game.paused = true;
        }

        //Nächstes Level Cheat
        if (this.keys.nextLvl.justDown) {
            this.readyForNextLevel = true;
            this._goToNextLevel();
        }

        /*
         downDuration(duration) returns true if the KEY WAS PRESSED DOWN withing the duration value given or
         false if it either isn't down, or was pressed down longer ago than the given duration.
         */
        const JUMP_HOLD = 400;
        //Springen für Spieler 1
        if (this.keys_player1.up.downDuration(JUMP_HOLD)) {
            let didJumpFirst = this.players.one.jump(); //wenn Button UP gedrückt, springe zu jump() in player.js
            if(didJumpFirst){
                this.sfx.jump.play();
            }
            this.players.one.animations.play('jump');
        }
        else {
            this.players.one.stopJumpBoosting(); //wenn nicht, springe zu stopJumpBoosting() in player.js
        }
        //Springen für Spieler 2
        if (this.keys_player2.up.downDuration(JUMP_HOLD)) {
            let didJumpSecond = this.players.two.jump();
            if(didJumpSecond){
                this.sfx.jump.play();
            }
            this.players.two.animations.play('jump');
        }
        else {
            this.players.two.stopJumpBoosting();
        }
    }

    _createWeapon(){
        //Add arrow as a weapon for the players
        this.arrows = this.game.add.group();
        this.arrows.enableBody = true;
        this.arrows.physicsBodyType = Phaser.Physics.ARCADE;
        this.arrows.createMultiple(1, 'arrow');

        this.arrows.setAll('scale.x', 0.5);
        this.arrows.setAll('scale.y', 0.5);
        this.arrows.setAll('anchor.x', 0.5);
        this.arrows.setAll('anchor.y', 0.5);

        this.arrows.setAll('outOfBoundsKill', true);
        this.arrows.setAll('checkWorldBounds', true);

    }

    //Player can fire arrows
    fireWeapon(){
        //grab the first arrow
        let arrow = this.arrows.getFirstDead(false);
            //Check if player is walking right
            if (arrow && this.players.one.facing === 'right') {
                if (this.keys_player1.fire1.isDown) {
                    //reposition the arrow if we have an arrow
                    arrow.reset(this.players.one.x + 15, this.players.one.y - 5);
                }
                else {
                    arrow.reset(this.players.two.x + 15, this.players.two.y - 5);
                }
                //direction of the arrow
                arrow.body.velocity.x = 600;
            }

            //Check if player is walking left
            else if (arrow && this.players.one.facing === 'left'){
                if(this.keys_player1.fire1.isDown) {
                    arrow.reset(this.players.one.x - 15, this.players.one.y - 5);
                }
                else {
                    arrow.reset(this.players.two.x - 15, this.players.two.y - 5);

                }
                //direction of the arrow
                arrow.body.velocity.x = -600;
            }
    }

    /**
     * Methode, die alle Kollisionen überprüft
     * @private
     */
    _handleCollisions() {
        Object.values(this.players).forEach( (player) => {
            //Player vs. Platform
            this.game.physics.arcade.collide(player, this.layerGround);

            //Player vs. Spike
            this.game.physics.arcade.collide(player, this.layerSpikes, (player, spike) => onPlayerVsSpikes(player, spike, this ));

            //Player vs.CameraWall
            this.game.physics.arcade.collide(player, this.invisibleCameraWalls);

            // Player vs. EndPanda, da geht es ins nächste Level wenn alle Foods gesammelt sind
            this.game.physics.arcade.collide(player, this.layerEndPanda, (player, endPanda) => this._onPlayerVsEndPanda(player) );

            //Player vs. Moving Platforms
            // damit Spieler mit Plaformen mitfahren
            this.game.physics.arcade.collide(player, this.movePlatformsH, (player, platform) => platform._moveWithPlatform(player));
            this.game.physics.arcade.collide(player, this.movePlatformsV, (player, platform) => platform._moveWithPlatform(player));
            this.game.physics.arcade.collide(player, this.activateMovePlatformsH, (player, platform) => platform._moveWithPlatform(player));
            this.game.physics.arcade.collide(player, this.activateMovePlatformsV, (player, platform) => platform._moveWithPlatform(player));

            // runterfallende Platformen
            this.game.physics.arcade.collide(player, this.dropDowns, (player, platform) => platform._dropDownPlatforms(player));

            // horizontal button-activated Platformen
            // hier werden alle activateButtonsH bewegt
            this.game.physics.arcade.collide(player, this.activateButtonsH, (player, button) => this.activateMovePlatformsH.forEach((pf) => pf.updateCall()));

            // vertikal button-activated Platformen
            this.game.physics.arcade.collide(player, this.activateButtonsV, (player, button) => this.activateMovePlatformsV.forEach((pf) => pf.updateCall()));

            //Player vs. Collectables
            this.game.physics.arcade.overlap(player, this.coins,   (player, coin)   => (coin.collect(player, this)));
            this.game.physics.arcade.overlap(player, this.energy,  (player, energy) => (energy.collect(player, this)));
            this.game.physics.arcade.overlap(player, this.food,    (player, food)   => (food.collect(player, this)));
            this.game.physics.arcade.overlap(player, this.weapons, (player, weapon) => (weapon.collect(player, this)));

            //Player vs. Enemy
            this.game.physics.arcade.overlap(player, this.enemies, (player, enemy) => onPlayerVsEnemy(player, enemy, this));
            this.game.physics.arcade.collide(this.enemies, this.arrows, (enemy, arrow) => arrowHitsEnemy(enemy, arrow, this));

        });

        //Enemies
        this.game.physics.arcade.collide(this.enemies, this.layerGround);
        this.game.physics.arcade.collide(this.enemies, this.movePlatformsH);
        this.game.physics.arcade.collide(this.enemies, this.movePlatformsV);
        this.game.physics.arcade.collide(this.enemies, this.activateMovePlatformsH);
        this.game.physics.arcade.collide(this.enemies, this.activateMovePlatformsV);
        this.game.physics.arcade.collide(this.enemies, this.dropDowns);
        this.game.physics.arcade.collide(this.enemies, this.layerInvisibleWalls, null, (enemy, wall) => (enemy.collideWithInvisibleWall));
        this.game.physics.arcade.collide(this.enemies, this.layerSpikes);

        //Weapon vs. Platform
        this.game.physics.arcade.collide(this.arrows, this.layerGround, (arrow, platform) => arrowHitsPlatform(arrow, platform, this));

    }

    /**
     * wenn man den Panda ganz am Ende berührt, kommt man ins nächste Level, wenn man alle Früchte hat
     * @param {object} player
     * @private
     */
    _onPlayerVsEndPanda(player) {
        //this.game.debug.text("Player vs. EndPanda", 32, 32);
        if (this.readyForNextLevel) {
            Object.values(this.players).forEach((player) => {
                player.body.enable = false;
                player.body.velocity.setTo(0,0);
                player.animations.stop();
                player.animations.play('stop');
            });

            this.sfx.win.play();
            this.game.add.tween(player)
                .to({x: player.x+20, alpha: 0}, 500, null, true)
                .onComplete.addOnce(() => this._goToNextLevel());
        }
    }

    /**
     * nächstes Level + überprüfe, ob man gewonnen hat
     * @private
     */
    _goToNextLevel() {
        if (this.readyForNextLevel) {
            if (this.nextLevel === LEVEL_COUNT) {
                this.game.state.start('win', true, false, {gameName: this.gameName, coinScore: this.coinScore, playedTime: this.startGameTime + this.game.time.totalElapsedSeconds() - this.pausedGameTime});
            }
            else {
                let nextLevel = this.nextLevel % LEVEL_COUNT; // es gibt 4 levels
                nextLevel++;

                this.camera.fade('#000000');
                this.camera.onFadeComplete.addOnce(() => {
                    // change to next level
                    this.game.state.restart(true, false, {
                        nextLevel: nextLevel,
                        readyForNextLevel: false,
                        // immer die gleiche start-Zeit im Spiel
                        // der Name hier ist eigentlich falsch, aber weil in der init der selbe else-Zweig für loaded und next-level verwendet wird
                        playedTime: this.startGameTime,
                        pausedGameTime: this.pausedGameTime,
                        coinScore: this.coinScore,
                        health: this.health,
                        gameName: this.gameName
                    });
                })
            }

        }
    }
}
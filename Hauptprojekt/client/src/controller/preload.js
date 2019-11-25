'use strict';

/** State, in dem alle assets geladen werden */
class PreloadState extends Phaser.State {

    preload(){

        //load preloadBar
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
        this.preloadBar.anchor.setTo(0.5,0.5);
        this.time.advancedTiming = true;
        this.load.setPreloadSprite(this.preloadBar);

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.stage.backgroundColor = '#111';

        //Game World
        this.game.load.image('background', 'assets/clouds.png');
        this.game.load.image('boss_level_background', 'assets/boss_level_background.png');

        //Player (size of each frame & number of frames in PNG)
        this.game.load.spritesheet('player1', 'assets/Panda1.png', 38.6, 48, 10);
        this.game.load.spritesheet('player2', 'assets/Panda2.png', 38.5, 52, 10);

        //Enemies
        this.game.load.spritesheet('enemy', 'assets/enemy.png', 40, 53);
        this.game.load.spritesheet('enemy_bird', 'assets/enemy_bird.png', 64, 64);
        this.game.load.spritesheet('enemy_hunter', 'assets/enemy_hunter.png', 64, 64);
        this.game.load.spritesheet('enemy_spider', 'assets/enemy_spider.png', 35, 35);
        this.game.load.spritesheet('enemy_arrow', 'assets/enemy_arrow.png', 32, 32);
        this.game.load.spritesheet('enemy_banana', 'assets/enemy_banana.png', 285, 250);
        this.game.load.spritesheet('enemy_gorilla', 'assets/enemy_gorilla.png', 40, 65);

        //Collectables
        this.game.load.spritesheet('coin', 'assets/coin.png', 32, 32, 6);
        this.game.load.image('coin_icon', 'assets/coin_icon.png');
        this.game.load.image('energy', 'assets/energy.png');
        this.game.load.image('weapon_bow', 'assets/weapon_bow.png');
        this.game.load.image('arrow', 'assets/arrow.png');

        this.game.load.image('food_cherry', 'assets/food_cherry.png');
        this.game.load.image('food_lime', 'assets/food_lime.png');
        this.game.load.image('food_melon', 'assets/food_melon.png');
        this.game.load.image('food_peach', 'assets/food_peach.png');
        this.game.load.image('food_plum', 'assets/food_plum.png');
        this.game.load.image('food_raspberry', 'assets/food_raspberry.png');
        this.game.load.image('food_starfruit', 'assets/food_starfruit.png');

        //Platforms
        this.game.load.image('buttons', 'assets/activateButton.png');
        this.game.load.image('dropdownPlatforms', 'assets/dropDowns.png');
        this.game.load.image('moveablePlatforms', 'assets/moveablePlatforms.png');

        //Camera
        this.game.load.image('invisible_wall_800x50', 'assets/invisible_wall_800x50.png');
        this.game.load.image('invisible_wall_50x640', 'assets/invisible_wall_50x640.png');
        this.game.load.image('invisible_wall', 'assets/invisible_wall.png');

        //Main Menu
        //this.game.load.image('mainmenu_background', 'assets/mainmenu_background.png');
        this.game.load.image('button_mainmenu1', 'assets/button_mainmenu1.png');
        this.game.load.image('mainmenu_background', 'assets/pandakrieger.png');

        //Instructions Menu
        this.game.load.image('landscape', 'assets/instructions.png');
        this.game.load.image('sweetPanda', 'assets/sweetPanda.png');
        this.game.load.image('key_awd', 'assets/AWD.png');
        this.game.load.image('key_arrows', 'assets/keys.png');

        //Pause Menu
        this.game.load.image('button_pausemenu', 'assets/button_pausemenu.png');

        //Game Over State
        this.game.load.image('sadpanda', 'assets/sadpanda.png');
        this.game.load.image('gameover_background', 'assets/gameover.png');

        //Win State
        this.game.load.image('win_background', 'assets/win_background.png');

        //Sound
        this.game.load.audio('sfx:food', 'assets/sound/collect_food.wav');
        this.game.load.audio('sfx:coin', 'assets/sound/collect_coin.wav');
        this.game.load.audio('sfx:energy', 'assets/sound/collect_energy.wav');
        this.game.load.audio('sfx:jump', 'assets/sound/jumping.wav');
        this.game.load.audio('sfx:impact', 'assets/sound/impact.wav');
        this.game.load.audio('sfx:gameover', 'assets/sound/gameover.wav');
        this.game.load.audio('sfx:damage', 'assets/sound/life_lost.wav');
        this.game.load.audio('sfx:hit_enemy', 'assets/sound/hit_enemy.wav');
        this.game.load.audio('sfx:arrow', 'assets/sound/shoot_arrow.wav');
        this.game.load.audio('sfx:win', 'assets/sound/woohoo.mp3');

        //JSON-files: load the level data
        this.game.load.tilemap('tilemap1', 'assets/data/level_1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('tilemap2', 'assets/data/level_2.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('tilemap3', 'assets/data/level_3.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('tilemap4', 'assets/data/level_boss.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('tileset', 'assets/data/tilesetPandaGame.png');
    }

    create(){
        this.game.state.start('mainmenu');

    }
}
//Set up things
//load files

'use strict';

/** Ladestate */
class BootState extends Phaser.State {
    init(){
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;
    }

    preload() {
        this.load.image('preloaderBar', 'assets/preload.png');

    }

    create() {
        //enable physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // hole alle Spielnamen, weil asynchron JS!!
        this.game.gameNamesFromDatabase = [];
        this.game.handler.checkForUsedName(this.game.gameNamesFromDatabase);

        //change to preload state
        this.game.state.start('preload');
    }
}


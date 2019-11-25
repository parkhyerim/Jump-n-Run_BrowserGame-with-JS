/**
 * Created by Lucca on 29.05.2017.
 */

'use strict';

/** Panda Spiel Klasse, dass man es starten kann */
class PandaGame extends Phaser.Game {

    constructor (width, height, div='') {
        super(width, height, Phaser.AUTO, div);
        this.state.add('boot', new BootState);
        this.state.add('preload', new PreloadState);
        this.state.add('mainmenu', new MainMenuState);
        this.state.add('instructions', new InstructionsState);
        this.state.add('play', new PlayState);
        this.state.add('leaderboards', new LeaderboardState);
        this.state.add('gameover', new GameOverState);
        this.state.add('win', new WinState);

        // "Schnittstelle" für Server
        this.handler = new ServerHandler();
    }

    start() {
        this.state.start('boot');
    }
}
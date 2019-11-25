/**
 * Created by hpark on 20.07.17.
 */

'use strict';

class WinState extends Phaser.State{

    init(data){
        this.game.handler.recordNewHighscore(data.gameName, data.coinScore, data.playedTime);
    }

    create() {

        this.game.world.setBounds(0, 0, 800, 640);

        this.game.stage.backgroundColor = "#ffffff";


        let backgroundImage = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'win_background');
        backgroundImage.anchor.setTo(0.5, 0.5);

        //Back to Mainmenu Button
        //(buttonX, buttonY, buttonWidth, buttonHeight)
        crtBtn("Main Menu", 140, 580, 200, 50, () => {
                this.game.state.start('mainmenu');
            }
            , this, "30px Arial");
    }

}
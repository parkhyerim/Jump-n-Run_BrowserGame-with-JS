/**
 * Created by hpark on 29.05.17.
 */

'use strict';

class GameOverState extends Phaser.State{

    // data muss vom playstate gameName mit bekommen
    init(data){
        this.gameName = data.gameName;
    }

    create() {

        //Background
        let backgroundImage = this.game.add.sprite(400,320, 'gameover_background');
        backgroundImage.anchor.setTo(0.5, 0.5);
        backgroundImage.scale.x = 0.8;
        backgroundImage.scale.y = 0.8;

        //Panda
        let sadpanda= this.game.add.sprite(300, 405, 'sadpanda');
        sadpanda.anchor.setTo(0.5, 0.5);
        sadpanda.scale.x = 0.06;
        sadpanda.scale.y = 0.06;

        //Text
        let title = this.game.add.text(490, 120, 'GAME OVER', {font: '65px Arial', stroke: 'white',  strokeThickness: 4, fill: 'black'});
        title.anchor.set(0.5);

        //Back to Mainmenu Button
        //(buttonX, buttonY, buttonWidth, buttonHeight)
        crtBtn("Main Menu", 300, 550, 200, 50, () => {
                this.game.state.start('mainmenu');
            }
            , this, "30px Arial");

        /*
        //Key
        //if M is pressed on keyboard, it will switch to the mainmenu state

        let textStyle = {font: '27px Arial', stroke: 'black', strokeThickness: 4, fill: 'white'};
        let instructions = this.game.add.text(500, 550, 'Press M: Main Menu', textStyle);
        instructions.anchor.set(0.5);

        let mKey = this.game.input.keyboard.addKey(Phaser.KeyCode.M);
        mKey.onDown.addOnce( () => this.game.state.start('mainmenu', true, false));
        */
    }

}
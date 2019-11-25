/**
 * Created by nicole on 21.07.17.
 */

'use strict';

class InstructionsState extends Phaser.State{


    create(){
        //Background
        let backgroundImage = this.game.add.sprite(200, 300, 'landscape');
        backgroundImage.anchor.setTo(0.5, 0.5);
        backgroundImage.scale.x = 0.8;
        backgroundImage.scale.y = 0.8;

        //Panda
        let panda = this.game.add.sprite(110, 95, 'sweetPanda');
        panda.anchor.setTo(0.5, 0.5);

        //Keys-Image
        let arrows = this.game.add.sprite(235, 350, 'key_arrows');
        arrows.anchor.setTo(0.5, 0.5);
        arrows.scale.x = 0.5;
        arrows.scale.y = 0.5;

        let alphabet = this.game.add.sprite(235, 470, 'key_awd');
        alphabet.anchor.setTo(0.5, 0.5);
        alphabet.scale.x = 0.3;
        alphabet.scale.y = 0.3;

        //Instruction
        let textStyle = {font: '20px Arial', fill: 'black', tabs: [150, 200]};
        let instruction = this.game.add.text(42, 190, 'Goal: collect all fruits to get to the next level', textStyle);

        //Headings
        let headings = ['Player', 'Movement', 'Fire'];
        let headingsText = this.game.add.text(42, 250, ' ', textStyle);
        headingsText.parseList(headings);

        //Descriptions
        let description =[
            ['1', '', 'K' ],
            ['2', '', 'F' ],
        ];
        let descriptionsText = this.game.add.text(42, 320, ' ', textStyle);
        descriptionsText.parseList(description);
        descriptionsText.lineSpacing = 100;

        //Back to Mainmenu Button
        //(buttonX, buttonY, buttonWidth, buttonHeight)
        crtBtn("Back", 140, 580, 215, 50, () => {
                this.game.state.start('mainmenu');
            }
            , this, "30px Arial");

    }

}
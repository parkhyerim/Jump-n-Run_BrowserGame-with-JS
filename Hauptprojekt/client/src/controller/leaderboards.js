/**
 * Created by Lucca on 12.07.2017.
 */

class LeaderboardState extends Phaser.State {
    create() {

        this.game.world.setBounds(0, 0, 800, 640);
        //this.game.stage.backgroundColor = "#2f6371";

        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = 140;
        const buttonY = 580;

        //Background
        let backgroundImage = this.game.add.sprite(200, 300, 'landscape');
        backgroundImage.anchor.setTo(0.5, 0.5);
        backgroundImage.scale.x = 1.0;
        backgroundImage.scale.y = 1.0;

        // Back to Mainmenu Button
        crtBtn("Back", buttonX, buttonY, buttonWidth, buttonHeight,
            // beim Drücken kommt man zurück ins mainMenu
            () => {
                this.game.state.start('mainmenu');
            }
        , this, "30px Arial");

        this.game.handler.getLeaderboards(this);
    }

    update() {

    }
}
/**
 * Created by Lucca on 06.07.2017.
 */

"use strict";

//////////////////////////////////////////////////////////////////////////////////////////
// CREATE
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * Funktion, die alle Sachen im Bildschirm erzeugt, wie Coinscore..
 * wird in PlayState ausgeführt
 * @param {object} play - PlayState this Referenz
 */
const createHUD = function createAllHUDs(play) {
    crtLiveHUD(play);
    crtPauseHUD(play);
    crtCoinHUD(play);
    crtWeaponHUD(play);

    // im Bosslevel nicht anzeigen
    if (play.nextLevel !== LEVEL_COUNT) {
        crtFoodHUD(play);
    }
};

/**
 * erzeuge Lebensanzeige
 * @param {object} play
 */
const crtLiveHUD = function createHealthHUD(play) {
    play.text1 = play.game.add.text(705, 65, play.health + ' x', {fontSize: '18px', fill: '##000000'});
    play.text1.fixedToCamera = true;
    play.heart = play.game.add.image(735, 50, 'energy');
    play.heart.fixedToCamera = true;
    play.heart.scale.x = 1.2;
    play.heart.scale.y = 1.2;

};

/**
 * erzeuge Pause Menü
 * Methode, die das Pause-Menü erstellt und über ".visible" sichtbar/unsichtbar gemacht wird, je nach dem ob man pausiert ist oder nicht
 * @param {object} play - playstate
 * @private
 */
const crtPauseHUD = function createPauseHUD(play) {
    // Schrift Stil
    const textStyle = {
        font: '45px Arial',
        fill: '#000000',
        align: "center",
        boundsAlignH: "center",
        boundsAlignV:"center"
    };

    // Button Größe
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonSpacing = 20;

    // Text-Position:
    // X: Mitte der Kamera
    // Y: 1/4 oben
    let pauseText = play.game.add.text(play.game.camera.width / 2, play.game.camera.height / 4, 'Pause', textStyle);
    pauseText.anchor.setTo(0.5, 0.5);

    // Gruppe für Inhalt des Pause-Menüs erstellen
    play.pauseMenu = play.game.add.group();

    // damit x und y Koordinate an Kamera-Position geheftet wird
    play.pauseMenu.fixedToCamera = true;

    // Objekte im Pause-Screen
    // 'Pause' - Text
    play.pauseMenu.add(pauseText);

    // Buttons erstellen und der group pauseMenu hinzugefügen
    crtBtn("Continue", play.game.camera.width / 2, play.game.camera.height / 2 + buttonHeight + buttonSpacing / 2, buttonWidth, buttonHeight,
        () => {
            play.game.paused = false;
        }
        , play, "30px Arial", play.pauseMenu, "pausemenu");

    crtBtn("Save", play.game.camera.width / 2, play.game.camera.height / 2, buttonWidth, buttonHeight,
        () => {
            play.game.handler.saveGame(play);

            // aktualisiere Liste an Spielnamen
            play.game.handler.checkForUsedName(play.game.gameNamesFromDatabase);
        }
        , play, "30px Arial", play.pauseMenu, "pausemenu");

    crtBtn("Quit", play.game.camera.width / 2, play.game.camera.height / 2 - buttonHeight - buttonSpacing / 2, buttonWidth, buttonHeight,
        () => {
            play.camera.flash('#000000');
            play.game.paused = false;
            play.game.state.start('mainmenu', true, false);
        }
        , play, "30px Arial", play.pauseMenu, "pausemenu");

    // von Anfang an nicht sichtbar, nur wenn in Pause
    play.pauseMenu.visible = false;

};

/**
 * erzeuge Coin Anzeige
 * @param {object} play
 */
const crtCoinHUD = function createCoinHUD(play) {
    // Obere Anzeige mit eingesammelten Münzen
    play.coinText = play.game.add.text(705, 15, play.coinScore + ' x', {fontSize: '18px', fill: '##000000'});
    play.coinText.fixedToCamera = true;
    play.coin = play.game.add.image(745, 8, 'coin_icon');
    play.coin.fixedToCamera = true;
    play.coin.scale.x = 0.6;
    play.coin.scale.y = 0.6;

};

/**
 * erzeuge Food Anzeige, für Fortschritt (wann man in nächstes Level kann)
 * @param {object} play
 */
const crtFoodHUD = function createFoodHUD(play) {
    play.foodDisplay = play.game.add.group();

    play.foodDisplayText = play.game.add.text(20, 25, 'Next Level', {fontSize: '18px', fill: '##000000'});
    play.foodDisplayText.anchor.setTo(0, 0.5);
    play.foodDisplayText.fixedToCamera = true;
    updtFoodHUD(play); // beim ersten mal auch die Foods updaten
};

const crtWeaponHUD = function createWeaponHUD(play){
    play.popUpText = play.game.add.text(350, 15, 'Weapon collected', {fontSize: '18px', fill: 'black'});
    play.popUpText.fixedToCamera = true;
    play.popUpText.visible = false;
};

//////////////////////////////////////////////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 * @param play
 */
const updtCoinHUD = function updateCoinHUD(play) {
    //erhöhe den Score um 1, wenn eine Münze eingesammelt wird
    play.coinScore += 1;
    play.coinText.text = play.coinScore + ' x';
};

/**
 *
 * @param play
 */
const updtFoodHUD = function updateFoodHUD(play) {
    let x = 30;
    play.foodDisplay.removeAll(true);
    play.food.forEach((food) => {
        let f = play.game.add.image(x, 50, food.key);
        f.anchor.set(0.5);
        f.scale.setTo(0.6);
        x += f.width + 5; // ein bisschen Abstand zum nächsten
        if (food.alive) {
            f.alpha = 0.3;
        }
        play.foodDisplay.add(f);
    });
    play.foodDisplay.fixedToCamera = true;
};

/**
 *
 * @param play
 */
const updtLiveHUD = function updateHealthHUD(play) {
        play.text1.text = play.health + ' x';
};

/**
 * weapon collected anzeigen
 * @param play
 */
const updtWeaponHUD = function updateWeaponHUD(play){
    play.popUpText.visible = true;
    //Text disappears
    play.game.add.tween(play.popUpText).to({alpha: 0}, 2600, Phaser.Easing.Default, true, 3200);
    play.time.events.add(1500, () => { //noch 1000ms sichtbar
        play.tweens.removeFrom(play.popUpText);
        play.popUpText.visible = false;

    }, this);

    /*
    //Add fading
    play.add.tween(this).to({alpha: 0}, 50, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //Remove fading
    play.time.events.add(500, () => {
        play.tweens.removeFrom(this);
        this.alpha = 1.0;
    }, this);
    */

};
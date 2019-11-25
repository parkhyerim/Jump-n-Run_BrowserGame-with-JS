/**
 * Created by nicole on 26.05.17.
 */

'use strict';

/** Hauptmenü, man kommt hier rein, wenn man Spiel startet */
class MainMenuState extends Phaser.State{

    create () {
        // sonst ist das Pause Menü außerhalb vom Bildschirm
        this.game.world.setBounds(0, 0, 800, 640);
        this.game.stage.backgroundColor = "#000000";

        const buttonWidth = 215;
        const buttonHeight = 50;
        const buttonSpacing = 20;

        // Hintergrundbild
        let backgroundImage = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'mainmenu_background');
        backgroundImage.anchor.setTo(0.5, 0.5);
        backgroundImage.scale.y = 1.15;

        //Titel
        let title = this.game.add.text(100, 40, 'Die Pandakrieger', {font: '80px Arial', stroke: 'black', strokeThickness: 4, fill: '#ff8000'});

        // Play Button erstellen
        crtBtn("Play", this.game.world.centerX -150, this.game.world.centerY - 1.2*buttonHeight - 2.8*buttonSpacing, buttonWidth, buttonHeight,
            // beim Drücken wird man in PlayState versetzt
            () => {
                let gameName = this._userNameQuery();

                if (gameName !== null) {
                    // Name ist noch frei

                    // setze Zeit zurück
                    this.game.time.reset();
                    this.game.state.start('play', true, false, {gameName: gameName});
                }
                // sonst: cancelt -> mache nichts
            }
            , this, "30px Arial");

        // Laden Button erstellen
        crtBtn("Load", this.game.world.centerX -150 , this.game.world.centerY - 0.3*buttonHeight - 1.8*buttonSpacing, buttonWidth, buttonHeight,
            () => {
                // beim Drücken soll man seinen Spielstand laden können
                let returnValue = {};

                do {
                    returnValue = this._loadByUsername();

                } while (returnValue.code !== 0 && returnValue.code !== 2);

                // Name gefunden
                if (returnValue.code === 2) {
                    this.game.handler.getSaveGame(returnValue.name, this.game);
                }

            }
            , this, "30px Arial");

        // Bestenliste Button erstellen
        crtBtn("Leaderboards", this.game.world.centerX +150, this.game.world.centerY - 1.2*buttonHeight - 2.8*buttonSpacing, buttonWidth, buttonHeight,
            () => {
                // beim Drücken soll Bestenliste geladen und angezeigt werden
                this.game.state.start('leaderboards');
            }
            , this, "30px Arial");

        //Instructions Button erstellen
        crtBtn("How to play", this.game.world.centerX +150, this.game.world.centerY - 0.3*buttonHeight - 1.8*buttonSpacing, buttonWidth, buttonHeight,
            () => {
                // beim Drücken soll Bestenliste geladen und angezeigt werden
                this.game.state.start('instructions');
            }
            , this, "30px Arial");
    }

    /**
     * frage Spieler nach Namen für Spiel
     * @returns {string} - answer or {null}
     * @private
     */
    _userNameQuery() {
        // Name für Spiel, damit man speichern kann
        let answer;

        while (answer = window.prompt("Gib einen Namen ein, damit du speichern kannst!")) {
            let isFree = true;
            if (typeof answer === "string") {
                // leer -> Name ist auf jeden Fall frei
                if (this.game.gameNamesFromDatabase.length === 0) {
                    return answer;
                }

                // gehe alle vorhandenen Namen durch
                for (let i=0; i<this.game.gameNamesFromDatabase.length; i++) {
                    // 1. Übereinstimmung -> wiederhole while-Schleife
                    if (answer === this.game.gameNamesFromDatabase[i].gameName) {
                        // break for-Schleife

                        // wenn man ok drückt, kommt man ins Spiel (siehe string in window.confirm)
                        if (window.confirm("Name existiert bereits. Wenn du speicherst, wird das Spiel überschrieben!")) {
                            break;
                        }

                        // man ignoriert confirmation window
                        isFree = false;
                        break;
                    }
                }

                if(isFree) {
                    return answer;
                }
            }
        }

        // nichts machen
        return null;
    }

    /**
     * Überprüft, ob Spiel mit eingegebenem Namen in Datenbank existiert
     * @returns {object}: code: 0 - "cancelled"
     *                          1 - "empty Database"
     *                          2 - "found"
     *                          3 - "not found"
     *                    name: empty ("") or some string
     *
     * @private
     */
    _loadByUsername() {
        let name = window.prompt("Gib den Spiel-Namen ein, damit du laden kannst!");

        if (name === null) {
            // nichts machen
            return {code: 0, name: ""};
        }

        // leer -> es gibt keine Spiele zu laden
        if (this.game.gameNamesFromDatabase.length === 0) {
            window.alert("Datenbank hat keine Einträge.");
            return {code: 1, name: ""};
        }

        // gehe alle vorhandenen Namen durch
        for (let i=0; i<this.game.gameNamesFromDatabase.length; i++) {
            // Übereinstimmung -> Name existiert -> lade Spiel anhand des Namens
            if (name === this.game.gameNamesFromDatabase[i].gameName) {
                return {code: 2, name: name};
            }
        }

        window.alert("Name nicht gefunden.");
        return {code: 3, name: ""};
    }
}

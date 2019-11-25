/**
 * Created by Lucca on 25.06.2017.
 */

'use strict';

/**
 * -> auf Client-Seite
 * Schnittstelle von Client -> Server
 * hier werden Funktionen bereitgestellt, um z.B. vom Spiel aus den Spielstand zu speichern auf der Datenbank
 */
class ServerHandler {

    constructor() {
        this.socket = io();
    }

    /**
     * wird über callbacks geregelt
     * socket.emit: You can add as many parameters as you want. If you want to add a callback function
     *              it has to be the last parameter in the list.
     */
    handleEvents() {

    }

    /**
     * main menu button -> Spielstand laden
     * @param {string} name - existiert auf jeden Fall in der Datenbank
     * @param {object} game - this.game
     */
    getSaveGame(name, game) {
        /**
         * json - man bekommt ein Objekt folgender Struktur vom Server:
         *  {
         *      _id: "..",
         *      gameName: "..",
         *      date: "..",
         *      data: {siehe this._addObjectsToSaveGame}
         *  }
         */
        this.socket.emit(events.LOAD_GAME, name, (json) => {
            // starte Spiel
            // setze Zeit zurück
            game.time.reset();
            game.state.start('play', true, false, json.data);
        });
    }

    /**
     * pause menu button -> Spielstand soll gespeichert werden
     * @param {object} play - playstate
     */
    saveGame(play) {
        let json = {};
        
        json.gameName = play.gameName;
        json.date = new Date();

        // data, die bei bei init(data) State übergeben werden soll
        json.data = {
            gameName: play.gameName,
            playedTime: play.playedTime,
            nextLevel: play.nextLevel,
            readyForNextLevel: play.readyForNextLevel,
            coinScore: play.coinScore,
            health: play.health,

            // alle Objekte
            // das savegame Objekt entspricht Tilemap, auf die createFromObjects angewendet werden soll
            tilemapObjects: new ObjectCreatorForTilemapObjects()
        };
        
        this._addObjectsToSaveGame(play, json.data.tilemapObjects);
        //console.log(json);

        this.socket.emit(events.SAVE_GAME, json, () => window.confirm("Saved."));
    }

    /**
     * main menu button -> leaderboard laden
     * @param {object} play - this
     */
    getLeaderboards(play) {
        this.socket.emit(events.GET_LEADERBOARD, this._printLeaderboard.bind(this, play));
    }

    /**
     * wenn man Spiel beendet hat, soll Rekord in die Leaderboard-Liste eingetragen werden
     *  -> als callback sollen die Leaderboards angezeigt werden (ACHTUNG: aufpassen, dass das gewollt ist und nicht zu Anzeige-Fehler führt)
     * @param {string} name - Name des Spielstandes
     * @param {number} coinScore - wie viele Punkte man gesammelt hat
     * @param {number} completionTime - wie lang man gebraucht hat, um das Spiel zu beenden (ist in Sekunden!)
     */
    recordNewHighscore(name, coinScore, completionTime) {
        const json = {
            name: name,
            coinScore: coinScore,
            date: new Date(),
            completionTime: completionTime
        };

        //console.log(json.name);
        this.socket.emit(events.PUSH_NEW_HIGHSCORE, json, () => console.log("highscore logged"));
    }

    /**
     * braucht man, wenn man neues Spiel beginnt und Namen eingibt, damit gameName unique ist (in der Datenbank)
     * sonst müsste man anhand der ID Spiele laden/überschreiben ...
     * @param resultArray
     */
    checkForUsedName(resultArray) {                                                // hat bind Vorrang bei Parameterübergabe?
        this.socket.emit(events.CHECK_NAME, this._filterNamesFromArray.bind(this, resultArray));
    }

    // ---------------------------------------------------------------------------------------------------------------
    // private Methoden
    // ---------------------------------------------------------------------------------------------------------------

    /**
     *
     * @param {object[]} arr - savegame-Objekte vom Server
     * @param {object[]} resultArray - enthält nur noch Objekte mit gameName
     * @private
     */
    _filterNamesFromArray(resultArray, arr) {
        // irgendwie ein Array zurückgeben, das nur die Namen enthält
        // erzeuge Array: [ {gameName: "bla"}, {gameName: "blaaaa"}, ... ]
        if (arr.length === 0) {
            return [];
        }

        for (let i=0; i<arr.length; i++) {
            resultArray[i] = { gameName: "" };
            resultArray[i].gameName = arr[i].gameName;
        }
    }


    /**
     * sammle wesentiche Informationen aus den Groups von Playstate: x-coord, y-coord, sonstige Attribute...
     * @param {object} play - Playstate
     * @param {object} savegame - json
     * @private
     */
    _addObjectsToSaveGame(play, savegame) {
        play.coins.forEachAlive((coin) => {
            savegame.addObject("coins", 66, coin.spawnPositionX, coin.spawnPositionY);
        });

        play.energy.forEachAlive((energy) => {
            savegame.addObject("health", 65, energy.spawnPositionX, energy.spawnPositionY);
        });

        play.food.forEachAlive((food) => {
            let gid = -1;
            // get gid via sprite.key
            switch(food.key) {
                case "food_lime": gid = 85; break;
                case "food_cherry": gid = 86; break;
                case "food_melon": gid = 87; break;
                case "food_peach": gid = 88; break;
                case "food_plum": gid = 89; break;
                case "food_raspberry": gid = 90; break;
                case "food_starfruit": gid = 91; break;
                default: console.warn("handle_server_events: _addObjectsToSaveGames: no food key for gid found"); break;
            }
            savegame.addObject("food", gid, food.spawnPositionX, food.spawnPositionY, {spawnPositionX: food.spawnPositionX, spawnPositionY: food.spawnPositionY});
        });

        play.weapons.forEachAlive((weapon) => {
            savegame.addObject("weapons", 62, weapon.spawnPositionX, weapon.spawnPositionY);
        });

        play.enemies.forEachAlive((enemy) => {
            let gid = -1;
            let customProperties = {};
            // get gid via sprite.key
            switch(enemy.key) {
                case "enemy_spider": gid = 37; break;
                case "enemy": gid = 38; break;
                case "enemy_hunter": gid = 49; break;
                case "enemy_bird": gid = 39; break;
                case "enemy_gorilla": gid = 48; break;

                // folgende haben keine GID aus dem Tileset
                case "enemy_arrow":
                    gid = 1000;
                    customProperties.savedSpeed = enemy.body.velocity.x;
                    break;
                case "enemy_banana":
                    gid = 1001;
                    customProperties.savedSpeed = enemy.body.velocity.x;
                    break;
                default: console.warn("handle_server_events: _addObjectsToSaveGames: no enemy key for gid found"); break;
            }

            // verschiedene enemies -> verschiedene properties
            if (customProperties.hasOwnProperty("savedSpeed")) {
                // missiles
                savegame.addObject("enemies", gid, enemy.body.x, enemy.body.y, customProperties);
            }
            else if (enemy.key === "enemy_gorilla") {
                savegame.addObject("enemies", gid, enemy.body.x, enemy.body.y, {health: enemy.health});
            }
            else if (enemy.key === "enemy_bird") {
                savegame.addObject("enemies", gid, enemy.body.x, enemy.spawnPositionY);
            }
            else {
                savegame.addObject("enemies", gid, enemy.body.x, enemy.body.y);
            }
        });

        // Spieler anhand des Objects "play.players" hinzufügen
        for (let playerKey of Object.keys(play.players)) {
            // players ist ein Objekt mit properties "one" und "two"
            let playerObject = play.players[playerKey];
            if (playerKey==="one") {
                savegame.addObject("player1", 63, playerObject.body.x, playerObject.body.y, { shooting: playerObject.shooting });
            }
            else {
                savegame.addObject("player2", 63, playerObject.body.x, playerObject.body.y, { shooting: playerObject.shooting });
            }
        }

        // Buttons für horizontal bewegende Platformen
        play.activateButtonsH.forEach((button) => {
            savegame.addObject("buttonsH", 76, button.spawnPositionX, button.spawnPositionY);
        });

        // Buttons für vertikal bewegende Platformen
        play.activateButtonsV.forEach((button) => {
            savegame.addObject("buttonsV", 76, button.spawnPositionX, button.spawnPositionY);
        });

        // automatisch bewegende Platformen
        play.movePlatformsH.forEach((pf) => {
            savegame.addObject("horizontalMovePlatforms", 73, pf.x, pf.spawnPositionY, {spawnPositionX: pf.spawnPositionX, spawnPositionY: pf.spawnPositionY, direction: pf.direction});
        });

        play.movePlatformsV.forEach((pf) => {
            savegame.addObject("vertikalMovePlatforms", 73, pf.spawnPositionX, pf.y, {spawnPositionY: pf.spawnPositionY, spawnPositionX: pf.spawnPositionX, direction: pf.direction});
        });

        // button gesteuerte Platformen
        play.activateMovePlatformsV.forEach((pf) => {
            savegame.addObject("activateVertikalPlatforms", 73, pf.spawnPositionX, pf.y, {spawnPositionY: pf.spawnPositionY, spawnPositionX: pf.spawnPositionX, direction: pf.direction});
        });

        play.activateMovePlatformsH.forEach((pf) => {
            savegame.addObject("activateHorizontalPlatforms", 73, pf.x, pf.spawnPositionY, {spawnPositionY: pf.spawnPositionY, spawnPositionX: pf.spawnPositionX, direction: pf.direction});
        });

        // runterfallende Platformen
        // sieht bisschen buggy aus, aber wieso soll man das tween speichern? fällt man runter, ist man eh schon unten und kann nicht durch die Platform wieder hoch
        play.dropDowns.forEach((pf) => {
            savegame.addObject("breakablePlatforms", 74, pf.spawnPositionX, pf.spawnPositionY, {spawnPositionY: pf.spawnPositionY, spawnPositionX: pf.spawnPositionX});
        });
    }

    /**
     * druckt Leaderboard aus
     * @param {object} play - this
     * @param {object[]} jsonArray - Array, das Objekte enthält mit Score-Infos
     * @private
     */
    _printLeaderboard(play, jsonArray) {

        const textStyle = {
            font: '15px Arial',
            fill: '#000000',
            align: "center",
            boundsAlignH: "center",
            boundsAlignV:"center"
        };

        // Spacings und Positionen
        const verticalSpacing = 20;
        const fontSizeSpacing = 20;
        const camLeft = 50;
        const camTop = 50;
        const xCoordPositionText = camLeft;
        const positionTextWidth = 60;
        const xCoordNameText = xCoordPositionText + positionTextWidth;
        const nameTextWidth = 200;
        const xCoordDateText = xCoordNameText + nameTextWidth;
        const dateTextWidth = 230;
        const xCoordCoinText = xCoordDateText + dateTextWidth;
        const coinTextWidth = 90;
        const xCoordTimeText = xCoordCoinText + coinTextWidth;
        //let timeTextWidth = 150;

        // Spaltenbeschriftung
        let yCoordText = camTop + verticalSpacing + fontSizeSpacing;
        play.game.add.text(xCoordPositionText, yCoordText - fontSizeSpacing, "Position", textStyle);
        play.game.add.text(xCoordNameText, yCoordText - fontSizeSpacing, "Name", textStyle);
        play.game.add.text(xCoordDateText, yCoordText - fontSizeSpacing, "Date", textStyle);
        play.game.add.text(xCoordCoinText, yCoordText - fontSizeSpacing, "Coin Score", textStyle);
        play.game.add.text(xCoordTimeText, yCoordText - fontSizeSpacing, "Completion Time", textStyle);

        /**
         * erzeugt Texte
         * @param {Object} jsonEntry
         * @param {number} position
         */
        const showText = function appendTextToTable(jsonEntry, position) {

            // y-Position einer Zeile
            let yCoordText = camTop + position*verticalSpacing + position*fontSizeSpacing;

            // Platz Nr. #
            play.game.add.text(xCoordPositionText, yCoordText, position, textStyle);

            // Name
            play.game.add.text(xCoordNameText, yCoordText, jsonEntry.name, textStyle);

            // parse date
            const jsonDate = new Date(jsonEntry.date);
            const dateDay = jsonDate.getUTCDate();
            const dateMonth = jsonDate.getUTCMonth() + 1;
            const dateYear = jsonDate.getUTCFullYear();
            const dateHours = jsonDate.getHours();
            const dateMinutes = ((jsonDate.getMinutes() < 10) ? "0" : "") + jsonDate.getMinutes();
            const dateSeconds = ((jsonDate.getSeconds() < 10) ? "0" : "") + jsonDate.getSeconds();
            const datePrintOut = dateDay + "." + dateMonth + "." + dateYear + " " + dateHours + ":" + dateMinutes + ":" + dateSeconds;

            // Datum
            play.game.add.text(xCoordDateText, yCoordText, datePrintOut, textStyle);

            // Coin Score
            play.game.add.text(xCoordCoinText, yCoordText, jsonEntry.coinScore, textStyle);

            // pare time to HH:MM:SS
            let timeInSeconds = parseInt(jsonEntry.completionTime, 10);
            let timeHours   = Math.floor(timeInSeconds / 3600);
            let timeMinutes = Math.floor((timeInSeconds - (timeHours * 3600)) / 60);
            let timeSeconds = timeInSeconds - (timeHours * 3600) - (timeMinutes * 60);
            timeHours = (timeHours < 10 ? "0":"") + timeHours;
            timeMinutes = (timeMinutes < 10 ? "0":"") + timeMinutes;
            timeSeconds = (timeSeconds < 10 ? "0":"") + timeSeconds;
            const completionTime = timeHours + ":" + timeMinutes + ":" + timeSeconds;

            // Spielzeit
            play.game.add.text(xCoordTimeText, yCoordText, completionTime, textStyle);
        };

        // vertikale Zählvariable
        let position = 1;

        jsonArray.forEach((jsonEntry) => {
            showText(jsonEntry, position);
            position++;
        });
    }

}
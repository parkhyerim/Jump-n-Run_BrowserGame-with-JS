/**
 * Created by Lucca on 24.06.2017.
 */

'use strict';

const events = require("../client/networking/event_messages");

/**
 * -> ist auf Serverseite
 * -> zuständig für das event-handling mithilfe von messageIDs, welche vom client emittiert werden
 */
class ClientHandler {

    constructor(socket, db) {
        this.socket = socket;
        this.db = db;
        this._handleEvents();
    }

    /**
     * Methode, um leaderboard-collection zu referenzieren
     * @returns {db.Collection} leaderboard
     * @private
     */
    _leaderboardCollection() {
        return this.db.collection('leaderboard');
    }

    /**
     * Methode, um savegame-collection zu referenzieren
     * @returns {db.Collection} savegame
     * @private
     */
    _savegameCollection() {
        return this.db.collection('savegame');
    }

    /**
     * Methode, die sich um einkommende Events vom Client kümmert
     * Funktion: socket.on(<event_from_client>, <reaction_function>) <=> socket.listen
     *
     * Parameter Info:
     *  socket.on(event, (data1, data2, ..., dataN, clientCallback) => { ... })
     *      or
     *  socket.on(event, (clientCallback) => { ... })
     * @private
     */
    _handleEvents() {
        // Spielstand laden
        this.socket.on(events.LOAD_GAME, (name, loadLevel) => {
            this._loadSaveGame(name, loadLevel);
        });

        // Leaderboards laden (und anzeigen (Client macht das mit callback))
        this.socket.on(events.GET_LEADERBOARD, (print) => {
            this._getLeaderboard(print);
        });

        // Spielstand speichern
        this.socket.on(events.SAVE_GAME, (json, notification) => {
            this._writeSaveGame(json, notification);
        });

        // neuen Highscore adden
        this.socket.on(events.PUSH_NEW_HIGHSCORE, (json, notification) => {
            this._addHighscore(json, notification);
        });

        // schau, ob Name für Spiel speichern schon gibt
        this.socket.on(events.CHECK_NAME, (filterNames) => {
            this._getSavegamesForNames(filterNames);
        });

    }

    // ---------------------------------------------------------------------------------------------------------------
    // private Methoden
    // ---------------------------------------------------------------------------------------------------------------

    /**
     * die eigentliche add Funktion für Leaderboards
     * wird aufgerufen, wenn man Spiel gewonnen hat
     * @param {object} json - JSON-Objekt, das vom Client übergeben wurde und der Leaderboard-Collection hinzugefügt werden soll
     * @param {function} notification - console.log
     * @private
     */
    _addHighscore(json, notification) {
        this._leaderboardCollection()
            .update({"name": `${json.name}`}, json, {upsert: true})
            .then(notification)
            .catch(console.log);
    }

    /**
     * add Funktion, um Spielstand zu speichern
     * update-Funktion, weil man überschreibt im Spiel
     * @param {object} json - Spielstand
     * @param {function} notification - console.log("saved")
     * @private
     */
    _writeSaveGame(json, notification) {
        this._savegameCollection()
        // wenn nicht existent -> erzeuge neues (upsert: true)
            .update({"gameName": `${json.gameName}`}, json, {upsert: true})
            .then(notification)
            .catch(console.log);
    }

    /**
     * holt Spielstand von der DB und führt callback im Client aus
     * @param {string} name - welcher Spielstand geladen werden soll
     * @param {function} loadLevel - starte playState mit eigenem Tilemap-Object
     * @private
     */
    _loadSaveGame(name, loadLevel) {
        this._savegameCollection()
            .find({"gameName": `${name}`})
            // kein toArray, weil ich kein Array haben will und da ich laut eigenere Defintion nur unique gameNames habe
            // sollte forEach kein Problem sein
            .forEach(loadLevel);
    }

    /**
     * holt alle savegames aus db.collection('savegame')
     * @param {function} filterNames - entfernt alle properties aus den Objekten, bis auf gameName
     * @private
     */
    _getSavegamesForNames(filterNames) {
        this._savegameCollection()
            .find()
            .toArray()
            .then(filterNames);
    }

    /**
     * hole leaderboard von Datenbank und printe sie im Client
     * @param {function} print - printet Leaderboard im Client-> leaderboard-state, bekommt jsonArray übergeben vom Server
     * @private
     */
    _getLeaderboard(print) {
        this._leaderboardCollection()
            .find()
            .sort({"coinScore": -1, "completionTime": 1}) // höchster score an coins ist oben, bei Gleichstand wird Zeit beachtet
            .limit(10)
            .toArray()
            .then(print);
    }
}


// exportiere, weil die Datei nicht über index.html für andere Dateien zur Verfügung gestellt wird
module.exports = ClientHandler;
/**
 * Created by Lucca on 24.06.2017.
 */

const events = {
    LOAD_GAME: 'getSaveGame',
    GET_LEADERBOARD: 'getLeaderboards',
    SAVE_GAME: 'saveGame',
    PUSH_NEW_HIGHSCORE: 'addNewHighscore',
    CHECK_NAME: 'checkForUsedName'
};


// einmal ist die Datei über index.html accessible (client),
// und einmal soll sie über module.exports accessible sein (server),
// weil die files von server.js und handle_client_events nicht geladen werden mit index.html
if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = events;
}
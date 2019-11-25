/**
 * Created by Lucca on 12.07.2017.
 */

/**
 * um Tilemap Objekt zu erstellen, damit man Level laden kann
 */
class OwnTilemapObject extends Phaser.Tilemap {
    /**
     * Konstruktor
     * @param {object} game - this.game
     * @param {object} objects - das "objects"-Objekt, das der Inhalt der Groups ist
     */
    constructor(game, objects) {
        super(game);
        this.addTilesetImage('tilesetPandaGame', 'tileset');
        this.objects = objects;
    }
}

/**
 * erstellt "objects" für Tilemap Objekt
 */
class ObjectCreatorForTilemapObjects {
    constructor() {
        this.objects = {
            activateHorizontalPlatforms: [],
            activateVertikalPlatforms: [],
            breakablePlatforms: [],
            buttonsV: [],
            buttonsH: [],
            coins: [],
            enemies: [],
            food: [],
            health: [],
            horizontalMovePlatforms: [],
            player1: [],
            player2: [],
            vertikalMovePlatforms: [],
            weapons: []
        }
    }

    /**
     * Methode, um z.B. Coin in this.objects.coins zu adden
     * damit man tilemap Objekte hat, auf die man createFromObject anwenden kann
     * @param {string} objectName - Name des Keys von objects im Konstruktor von ObjectCreatorForTilemapObjects
     * @param {number} gid
     * @param {number} x_coord
     * @param {number} y_coord
     * @param {object} customProperties - diese werden von createFromObjects benutzt, um den sprites diese properties zu geben (easy)
     */
    addObject(objectName, gid, x_coord, y_coord, customProperties=undefined) {
        this.objects[objectName].push(
            {
                gid: gid,
                name: "",
                properties: customProperties,
                type: "",
                visible: true,
                x: x_coord,
                y: y_coord
            }
        );
    }
}

/**
 * Created by nicole on 16.05.17.
 */
'use strict';

/**
 * hier wird das Level geladen
 * @param {object} play - playstate (this)
 */
const loadLevel = function loadEveryThing(play) {
    // immer gleich, muss man nicht speichern?
    play.invisibleCameraWalls = play.game.add.group();
    play.invisibleCameraWalls.fixedToCamera = true;

    // "layers" laden aus Tilemap mit Tileset
    play.layerGround = play.map.createLayer('ground', play.game.world.width, play.game.world.height);
    play.layerInvisibleWalls = play.map.createLayer('invisibleWalls', play.game.world.width, play.game.world.height);
    play.layerEndPanda = play.map.createLayer('endPanda', play.game.world.width, play.game.world.height);
    play.layerSpikes =  play.map.createLayer('spikes', play.game.world.width, play.game.world.height);
    play.layerGround.resizeWorld();
    play.layerInvisibleWalls.resizeWorld();
    //play.layerEndPanda.resizeWorld();
    play.layerSpikes.resizeWorld();

    play.game.physics.enable(play.layerGround);
    play.game.physics.enable(play.layerInvisibleWalls);
    play.game.physics.enable(play.layerSpikes);
    play.game.physics.enable(play.layerEndPanda);

    play.layerInvisibleWalls.visible = false;

    // Kollisionen aktivieren mithilfe GIDs
    play.map.setCollisionBetween(1,36, true, play.layerGround);
    play.map.setCollision([75, 77], true, play.layerSpikes);
    play.map.setCollision(68, true, play.layerInvisibleWalls);
    play.map.setCollision([83, 84, 95, 96], true, play.layerEndPanda);
};

/**
 * Objekte spawnen
 * @param {object} play - playstate (this)
 */
const spwnObjects = function spawnAllObjects(play) {
    // Groups, die auch gespeichert werden müssen
    // Items
    play.coins = play.game.add.group();
    play.energy = play.game.add.group();
    play.food = play.game.add.group();
    play.weapons = play.game.add.group();

    // Spieler
    play.playersGroup = play.game.add.group();

    // Gegner
    play.enemies = play.game.add.group();

    // spezielle Platformen
    play.movePlatformsH = play.game.add.group();
    play.movePlatformsV = play.game.add.group();
    play.dropDowns = play.game.add.group();
    play.activateButtonsH = play.game.add.group();
    play.activateButtonsV = play.game.add.group();
    play.activateMovePlatformsV = play.game.add.group();
    play.activateMovePlatformsH = play.game.add.group();

    // erzeuge alle Objekte in der Welt
    _shwChars(play);
    _shwItems(play);
    _shwPlatforms(play);

    if (play.hasOwnProperty("loadedMap")) {
        _shwMissiles(play);
        console.log(play.map);
    }
};

/**
 * hier werden Spieler und Gegner geladen
 * @param {object} play
 * @private
 */
const _shwChars = function showCharacters(play) {
    // Spieler spawnen
    play.map.createFromObjects('player1', 63, 'player1', 0, true, false, play.playersGroup, PlayerOne);
    play.map.createFromObjects('player2', 63, 'player2', 0, true, false, play.playersGroup, PlayerTwo);

    // Objekt, damit Collision noch funktioniert
    play.players = {
        one: play.playersGroup.children[0],
        two: play.playersGroup.children[1]
    };

    // Gegner spawnen
    play.map.createFromObjects('enemies', 37, 'enemy_spider', 0, true, false, play.enemies, EnemySpider);
    play.map.createFromObjects('enemies', 38, 'enemy', 0, true, false, play.enemies, EnemyMonkey);
    play.map.createFromObjects('enemies', 39, 'enemy_bird', 0, true, false, play.enemies, EnemyBird);
    play.map.createFromObjects('enemies', 49, 'enemy_hunter', 0, true, false, play.enemies, EnemyHunter);
    play.map.createFromObjects('enemies', 48, 'enemy_gorilla', 0, true, false, play.enemies, EnemyGorilla);

    // wenn Spiel geladen ist, dann hole spezifische Daten, z.B. ob man Waffe collected hat
    if (play.hasOwnProperty("loadedMap")) {
        // hat man Waffe collected?
        //play.players.one.shooting = play.map.objects.player1["0"].properties.shooting;
        //play.players.two.shooting = play.map.objects.player2["0"].properties.shooting;

        // Lebensanzahl des Bosses
        // TODO Boss Leben laden
    }
};

/**
 * hier wird Sammelbares geladen
 * @param {object} play
 * @private
 */
const _shwItems = function showItems(play) {
    play.map.createFromObjects('coins', 66, 'coin', 0, true, false, play.coins, Coin);
    play.map.createFromObjects('health', 65, 'energy', 0, true, false, play.energy, Energy);
    play.map.createFromObjects('food', 85, 'food_lime', 0, true, false, play.food, Food);
    play.map.createFromObjects('food', 86, 'food_cherry', 0, true, false, play.food, Food);
    play.map.createFromObjects('food', 87, 'food_melon', 0, true, false, play.food, Food);
    play.map.createFromObjects('food', 88, 'food_peach', 0, true, false, play.food, Food);
    play.map.createFromObjects('food', 89, 'food_plum', 0, true, false, play.food, Food);
    play.map.createFromObjects('food', 90, 'food_raspberry', 0, true, false, play.food, Food);
    play.map.createFromObjects('food', 91, 'food_starfruit', 0, true, false, play.food, Food);
    play.map.createFromObjects('weapons', 62, 'weapon_bow', 0, true, false, play.weapons, Weapon);

    // damit nicht durch tweening verschobene Position gespeichert wird
    /*if (!play.hasOwnProperty("loadedMap")) {
        let counter = 0;
        play.food.forEach((food) => {
            food.numberForSaving = counter;
            counter++;
        });
    }
    // damit richtiges Food an richtiger Stelle ist
    else {
        play.food.forEach((food) => {
            play.map.objects.food.forEach((foodMap) => {
                if (food.numberForSaving === foodMap.properties.numberForSaving) {
                    food.spawnPositionX = foodMap.properties.spawnPositionX;
                    food.spawnPositionY = foodMap.properties.spawnPositionY;
                    food.direction = foodMap.properties.direction;
                }
            });
        });
    }*/
    
};

/**
 * spawne die Platformen
 * @param {object} play
 * @private
 */
const _shwPlatforms = function showPlatforms(play) {
    // automatisch bewegende Platformen
    play.map.createFromObjects('horizontalMovePlatforms', 73, 'rotatingPlatform', 0, true, false, play.movePlatformsH, HorizontalMovePlatforms);
    play.map.createFromObjects('vertikalMovePlatforms', 73, 'rotatingPlatform', 0, true, false, play.movePlatformsV, VertikalMovePlatforms);

    // button-gesteuerte Platformen
    play.map.createFromObjects('buttonsV', 76, 'buttons', 0, true, false, play.activateButtonsV, ButtonPlatforms);
    play.map.createFromObjects('buttonsH', 76, 'buttons', 0, true, false, play.activateButtonsH, ButtonPlatforms);

    play.map.createFromObjects('activateHorizontalPlatforms', 73, 'rotatingPlatform', 0, true, false, play.activateMovePlatformsH, HorizontalMovePlatforms);
    play.map.createFromObjects('activateVertikalPlatforms', 73, 'rotatingPlatform', 0, true, false, play.activateMovePlatformsV, VertikalMovePlatforms);

    // runterfallende Platformen
    play.map.createFromObjects('breakablePlatforms', 74, 'rotatingPlatform', 0, true, false, play.dropDowns, DropDownPlatforms);

/*
    if (!play.hasOwnProperty("loadedMap")) {
        let counter = 0;
        play.movePlatformsH.forEach((pf) => {
            pf.numberForSaving = counter;
            counter++;
        });

        counter = 0;
        play.movePlatformsV.forEach((pf) => {
            pf.numberForSaving = counter;
            counter++;
        });

        counter = 0;
        play.activateMovePlatformsH.forEach((pf) => {
            pf.numberForSaving = counter;
            counter++;
        });

        counter = 0;
        play.activateMovePlatformsV.forEach((pf) => {
            pf.numberForSaving = counter;
            counter++;
        });
    }
    // wenn Spiel geladen ist, dann hole spezifische Daten, z.B. die ursprüngliche spawn Position, dass richtig getweent wird
    else {
        play.movePlatformsH.forEach((pf) => {
            play.map.objects.horizontalMovePlatforms.forEach((pfMap) => {
                // schau nach Nummer, damit richtig zugewiesen wird
                if (pf.numberForSaving === pfMap.properties.numberForSaving) {
                    pf.spawnPositionX = pfMap.properties.spawnPositionX;
                    pf.spawnPositionY = pfMap.properties.spawnPositionY;
                    pf.direction = pfMap.properties.direction;
                }
            });
        });
        
        play.movePlatformsV.forEach((pf) => {
            play.map.objects.vertikalMovePlatforms.forEach((pfMap) => {
                // schau nach Nummer, damit richtig zugewiesen wird
                if (pf.numberForSaving === pfMap.properties.numberForSaving) {
                    pf.spawnPositionX = pfMap.properties.spawnPositionX;
                    pf.spawnPositionY = pfMap.properties.spawnPositionY;
                    pf.direction = pfMap.properties.direction;
                }
            });
        });

        play.activateMovePlatformsV.forEach((pf) => {
            play.map.objects.activateVertikalPlatforms.forEach((pfMap) => {
                // schau nach Nummer, damit richtig zugewiesen wird
                if (pf.numberForSaving === pfMap.properties.numberForSaving) {
                    pf.spawnPositionX = pfMap.properties.spawnPositionX;
                    pf.spawnPositionY = pfMap.properties.spawnPositionY;
                    pf.direction = pfMap.properties.direction;
                }
            });
        });

        play.activateMovePlatformsH.forEach((pf) => {
            play.map.objects.activateHorizontalPlatforms.forEach((pfMap) => {
                // schau nach Nummer, damit richtig zugewiesen wird
                if (pf.numberForSaving === pfMap.properties.numberForSaving) {
                    pf.spawnPositionX = pfMap.properties.spawnPositionX;
                    pf.spawnPositionY = pfMap.properties.spawnPositionY;
                    pf.direction = pfMap.properties.direction;
                }
            });
        });
    }*/
};

/**
 * Geschosse laden
 * @param {object} play
 * @private
 */
const _shwMissiles = function showAllMissiles(play) {
    // Geschosse von Enemies
    play.map.createFromObjects('enemies', 1000, 'enemy_arrow', 0, true, false, play.enemies, EnemyArrow);
    // enemy arrow hat richtung -> speichern
    // arrow.body.velocity.x= 0// "velocity, die gespeichert wurde"
    play.map.createFromObjects('enemies', 1001, 'enemy_banana', 0, true, false, play.enemies, EnemyBanana);

    // Geschosse vom Spieler
    // TODO kann ich so nicht erzeugen.......................................
};







const crtWeapon = function createWeapon(play) {
    
};


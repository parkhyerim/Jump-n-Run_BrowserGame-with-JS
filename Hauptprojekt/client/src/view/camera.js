/**
 * Created by Lucca on 30.06.2017.
 */

'use strict';
// ----------------------------------------------------------------------------------------------------------------
// UPDATE()
// ----------------------------------------------------------------------------------------------------------------


/**
 * Methode, die sich um Kamera-Position kümmert
 * @param {object} play - this Referenz
 */    
const hndlCam = function handleCamera(play) {

    // veraltet
    /*
    // je kleiner der Wert, desto "weicher" folgt die Kamera
    const cameraHardness = 0.1;
    // Wenn nur 1 Spieler am Leben ist, kann man camera.follow(sprite, follow_style) verwenden
    if (!play.players.one.alive) {
        play.camera.follow(play.players.two, Phaser.Camera.FOLLOW_LOCKON, cameraHardness, cameraHardness);
    }
    else if (!play.players.two.alive) {
        play.camera.follow(play.players.one, Phaser.Camera.FOLLOW_LOCKON, cameraHardness, cameraHardness);
    }
    // wenn beide am Leben sind
    else {
        let playersCenterX = (play.players.one.x + play.players.two.x) / 2;
        let playersCenterY = (play.players.one.y + play.players.two.y) / 2;
        play.game.camera.focusOnXY(playersCenterX, playersCenterY);
    }*/

    // folge dem Mittelpunkt der Spieler
    let playersCenterX = (play.players.one.x + play.players.two.x) / 2;
    let playersCenterY = (play.players.one.y + play.players.two.y) / 2;
    play.game.camera.focusOnXY(playersCenterX, playersCenterY);

};


// ----------------------------------------------------------------------------------------------------------------
// CREATE()
// ----------------------------------------------------------------------------------------------------------------


/**
 * Methode, um Kamera-Grenze für Spieler zu spawnen, damit sie in der Kamera bleiben
 * @param {object} play - this Referenz
 */
const spwnCamWall = function spawnCameraWalls(play) {
    const wallWidth = 50;
    /*
     Damit Spieler in der Kamera bleiben:
     - 4 sprites = 4 Wände (fixedToCamera)
     -> die sprites sind genau auf dem Kamera-Rand
     - collision, damit Spieler "gefangen" sind innerhalb der Kamera
     */

    // Wände sind alle auf Kamera-Rand
    // Achtung: - Anchor von den Wänden ist in Klasse Obstacle festgelegt
    //          - jetzt gerade ist er links oben (0, 0) {x,y}
    let wall_left = new Obstacle(play, play.game.camera.x - wallWidth, play.game.camera.y, 'invisible_wall_50x640');
    wall_left.anchor.set(0, 0);
    //wall_left.alpha = 0.0;
    let wall_right = new Obstacle(play, play.game.camera.x + play.game.camera.width, play.game.camera.y, 'invisible_wall_50x640');
    wall_right.anchor.set(0, 0);
    //wall_right.alpha = 0.0;
    let wall_top = new Obstacle(play, play.game.camera.x , play.game.camera.y - wallWidth, 'invisible_wall_800x50');
    wall_top.anchor.set(0, 0);
    //wall_top.alpha = 0.0;
    let wall_bottom = new Obstacle(play, play.game.camera.x, play.game.camera.y + play.game.camera.height, 'invisible_wall_800x50');
    wall_bottom.anchor.set(0, 0);
    //wall_bottom.alpha = 0.0;

    play.invisibleCameraWalls.add(wall_left);
    play.invisibleCameraWalls.add(wall_right);
    play.invisibleCameraWalls.add(wall_top);
    play.invisibleCameraWalls.add(wall_bottom);

    play.invisibleCameraWalls.visible = false;

};


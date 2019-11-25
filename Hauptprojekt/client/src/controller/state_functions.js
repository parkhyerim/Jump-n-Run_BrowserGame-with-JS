/**
 * Created by Lucca on 11.06.2017.
 */

'use strict';

/**
 * Funktion, um Buttons zu erstellen
 * @param {string} string - Text, der auf Button steht
 * @param {number} pos_X - X-Koordinate
 * @param {number} pos_Y - Y-Koordinate
 * @param {number} width - Breite
 * @param {number} height - Höhe
 * @param {function} callback - Funktion, die ausgeführt wird, wenn Button gedrückt wird
 * @param {object} play - playstate (this Referenz)
 * @param {string} text_font - Schriftgröße in px mit font, z.B. "45px Arial"
 * @param {object} group - Phaser Group, der man den Button hinzufügen kann
 * @param {string} state - um Button Design anzupassen
 * @param {string} text_color - Farbe des Texts, z.B. "#000000"
 */

const crtBtn = function createButton(string, pos_X, pos_Y, width, height, callback, play=undefined, text_font="44px Arial", group=undefined, state="mainmenu", text_color="#000000") {
    // text style, man muss boundsAlign reinmachen, sonst kommt Fehler
    const textStyle = {
        font: text_font,
        fill: text_color,
        align: "center",
        boundsAlignH: "center",
        boundsAlignV:"center"
    };

    let preloadButtonName = "";

    // Name, dem das Bild für den Button in preload gegeben wurde
    // im pause menu wird ein anderer Button, als im Mainmenu verwendet
    if (state === "pausemenu") {
        preloadButtonName = "button_pausemenu";
    }
    else {
        preloadButtonName = "button_mainmenu1";
    }


    // Unterbrechen, wird nicht gefangen
    if (play === undefined) {
        throw "Create Button Fehler: Game undefined";
    }

    // Button adden (x, y, button_image, function, aufruf-object, overstate, outstate, downstate, [upstate])
    let button = play.game.add.button(pos_X, pos_Y, preloadButtonName, callback, play, 2, 1, 0);
    button.anchor.setTo(0.5, 0.5);
    button.width = width;
    button.height = height;

    // man könnte als zusätzliches Argument eine Group angeben, zu der man das Text-Objekt hinzufügen kann
    let buttonText = play.game.add.text(button.centerX, button.centerY, string, textStyle);
    buttonText.anchor.setTo(0.5, 0.5);

    if (group !== undefined && group !== null) {
        group.add(button);
        group.add(buttonText);
    }

};


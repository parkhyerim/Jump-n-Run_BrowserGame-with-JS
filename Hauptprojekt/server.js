/**
 * Created by Lucca on 30.05.2017.
 */
'use strict';

// Initialisierung
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = 3000;
const io = require("socket.io").listen(server);
const path = require("path");

// importiere ClientHandler Klasse
const ClientHandler = require("./server/handle_client_events");

// braucht man, um statische Dateien zu laden (z.B. die Dateien src="..." in index.html)
app.use(express.static(path.join(__dirname, "client")));
//app.use(express.static(path.join(__dirname, "server")));

//app.use(express.static(__dirname + "server"));
//app.use(express.static(__dirname + "client"));

// Variablen und Module für MongoDB
const MongoClient = require("mongodb").MongoClient;
const M_HOST = "localhost";
const M_PORT = 27017;
const M_DATABASE = "gameDb";
const M_URL = `mongodb://${M_HOST}:${M_PORT}/${M_DATABASE}`;

//globales Objekt für die Datenbank
let db = undefined;

// Verbindungsaufbau zur Datenbank und zum lokalen Server
// mit mongoDB verbinden und erst dann mit Server
MongoClient.connect(M_URL)
    .then((database) => {
        // Datenbank-'pointer' anbinden
        db = database;

        // die index.html wird von selber gesendet

        // Server listener
        server.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    })

    // eventuelle Fehler
    .catch(console.log);


// für den Client Handler, es wird jedes Mal ein neuer erzeugt, wenn man localhost:3000 anpeilt (?)
io.on("connection", (socket) => {
    new ClientHandler(socket, db);
});

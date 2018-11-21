const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server);

// Modules à importer
const mongoDB= require('./mongo_db');
const manageUser = require('./manage_user');
const searchGame = require('./search_game');
const manageGame = require('./manage_game');


const INTERVAL_SEND_GAME = 1000;


// Initialisation à la connection BDD
 mongoDB.initMongoDB();

searchGame.arrayUserSearchGame;


// Fonction qui s'occupe de toutes les fonctions provenant de SocketIO
const socketio = function(){
// User se connecte : On emit("connect") automatiquement.
io.on('connection', (socket) => {




    // Quand un user se connecte, on l'ajoute à la liste des Users 
    // et on annonce aux autres user qu'il est connecté ainsi que son nom.
    manageUser.onConnect(socket,io);
    
    
    // Quand le user se deconnecte, on le retire à la liste des Users 
    // et on annonce aux autres user qu'il est déconnecté avec son nom.
    manageUser.onDisConnect(socket,io);
    

    // Quand le user cherche une game, on l'ajoute à la liste des Users qui cherche une game
    searchGame.onSearchGame(socket,io);



    manageGame.sendGameToAll(socket,io,INTERVAL_SEND_GAME);



    manageGame.onSendActionFromUser(socket,io);


   

    })
    
}
exports.socketIndex = socketio;






server.listen(3000,()=>{
    console.log('Node app is running on port 3000');
    })
    
const mongo = require('./mongo_db');
const searchGame = require('./search_game');

// CONSTANTE DE STRING

// EVENT
    // Reçois l'événement qu'une personne c'est connecté, avec son "Username"
const EVENT_ADD_USER = "add user";
    // Reçois l'événement : Quand un user se déconnecte
const EVENT_USER_DISCONNECT = "disconnect";

// EMIT 
    // On annonce aux autres clients qu'un User est connecté
const EMIT_JOINED = "userjoined";
    // On annonce aux autres clients qu'un User est déconnecté
const EMIT_DISJOINED = "userdijoined";





// Quand un user se connecte 
exports.onConnect = function(socket,io){

    // Quand un user se connecte, il envoie son Username
    socket.on(EVENT_ADD_USER, function(userName)
    {
        console.log(userName + ' has joined ')
        // On annonce aux autres clients que ce User est connecté
        socket.broadcast.emit( EMIT_JOINED , userName )

        mongo.addUserToDB(userName,socket.id);
    })
}



// Quand un user se deconnecte 
exports.onDisConnect = function(socket,io){

    // Quand le user se deconnecte 
    // On emit("disconnect")
    socket.on(EVENT_USER_DISCONNECT, function() {
            // On annonce aux clients que ce User est déconnecté
            socket.broadcast.emit( EMIT_DISJOINED ,'user has left')

            mongo.deleteUserToDB(socket.id);
            searchGame.deleteUserToSearchList(socket.id);
        
        })
}

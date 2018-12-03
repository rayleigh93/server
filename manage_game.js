//Ce fichier s'occupe de tout ce qui est gestion de la Game, tout les coups joués seront étudier ici


const mongoDB= require('./mongo_db');

// CONSTANTE DE STRING

// EVENT
    // Reçois l'événement qu'un user à envoyé une action de jeu
    const EVENT_ACTION_FROM_USER = "sendaction";

// EMIT 
    // On annonce aux autres clients qu'un User est connecté
const EMIT_CREATE_GAME = "gamecreated";




exports.sendGameToAll = function(socket,io,TIMER){
    setInterval(function(){
        mongoDB.sendGameToUsers(socket,io);
       // console.log("envoie des games OK");
    }, TIMER);

}



// Quand un user envoie son JSON Game
exports.onSendActionFromUser = function(socket,io){

    // Quand le user envoie une action
    socket.on(EVENT_ACTION_FROM_USER, function(position) {

            //On modifie le fichier Json
            mongoDB.checkGameUser(socket.id,position);

        })

}


//exports.





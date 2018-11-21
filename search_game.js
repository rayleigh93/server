const mongo = require('./mongo_db');

// CONSTANTE DE STRING

// EVENT
    // R
const EVENT_SEARCH_GAME = "search game";
    

// EMIT 
    // O
const EMIT_CREATE_GAME = "gamecreated";
    


var arrayUserSearchGame = new Array();
exports.arrayUserSearchGame = arrayUserSearchGame;



// Quand un user recherche une partie
exports.onSearchGame = function(socket,io){

    // Quand un user recherche une partie, il envoie son Username
    socket.on(EVENT_SEARCH_GAME, function(userName)
    {
        addUserToSearchList(socket.id,userName);
      
    })
}


const checkNumberUserSearch = function(){
   
   console.log("Nombre de User qui cherche une partie : " + arrayUserSearchGame.length );

   if(arrayUserSearchGame.length == 2)
   {
        createGame(arrayUserSearchGame[0],arrayUserSearchGame[1]);
        arrayUserSearchGame.splice(0,2);

   }

   
}
exports.checkNumberUserSearch = checkNumberUserSearch;

const addUserToSearchList = function(idUser,userName){
    arrayUserSearchGame.push({userName:userName,userId:idUser });

    mongo.checkUserGameId(idUser);
}


exports.deleteUserToSearchList = function(idUser){

    arrayUserSearchGame.forEach(function(element,i){
        if(element.userId === idUser)
        arrayUserSearchGame.splice(i,1);
        // Remove 1 item à l'index 'element'
    })

    checkNumberUserSearch();
}

const createGame = function(userOne,UserTwo){
    console.log("Game en lancement");

    mongo.createGameToDB(userOne.userId,UserTwo.userId);


}
// Ce fichier s'occupe de modéliser toutes les intéractions entre la bdd et le serveur

const nameBdd = "game";

const mongoose = require('mongoose');
const mongoModel = require('./mongo_model');
const index = require('./index');
const searchGame = require('./search_game');


// Initialisation de la connection à la base de donnée et 
// suppression de la collection de la liste des User Online
exports.initMongoDB = function() {


        //Initialisation de la connection de la BDD mongoDB
        mongoose.connect('mongodb://localhost/game', function(err){
        if(err) {
                    console.error.bind(console, 'connection error:')
                    rej(err);
                }

        else {
            console.log("Connection à mongoDB : OK")
            //Suppression de la collection de la liste des User Online

            var promiseDeleteListUser = new Promise(function(res,rej){
            mongoose.connection.db.dropCollection(mongoModel.CollectionUserOnlineString, function(err, result) {
                console.log("Delete collection : joueurs en lignes");
                res(result);
                             })   
                                                                      });


             var promiseDeleteListGame = new Promise(function(res,rej){
            mongoose.connection.db.dropCollection(mongoModel.CollectionGameString, function(err, result) {
                console.log("Delete collection : games");
                res(result);
                             })   
                                                                      });                                                          


                    Promise.all([promiseDeleteListUser,promiseDeleteListGame]).then(function(val){
                                  index.socketIndex();
                                 
                                                                        });

             }


            

    })

}



// Ajoute un user à la liste des User Online
exports.addUserToDB = function(username,id) {
    var newUser = new mongoModel.UserOnlineModel({userName:username,id:id});
  
    newUser.save(function(err,user){
        if (err) return console.error(err);
    })
}



// Delete un user à la liste des User Online
exports.deleteUserToDB = function(idUser) {

    mongoModel.UserOnlineModel.findOne({id: idUser},function(err,user){

        if (err) {
            return console.error(err);
        }

        else {
            // delete l'user qui se déconnecte
            console.log(user.userName + " disconnected")
            user.remove(function(err){
                if (err) {  
                    return console.error(err);
                         }
                else {  
                    }
                                     });
            }
      
    })


}



exports.createGameToDB = function(idUserOne,idUserTwo){

    var newGame = new mongoModel.GameModel
    ({"playerTurn":idUserTwo,
    "tableauGame":[{"typeCase":"vide","typeTiles":1},{"typeCase":"yellow","typeTiles":2},
    {"typeCase":"plein","typeTiles":3},{"typeCase":"blue","typeTiles":4},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"blue","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0},
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0}],
    
    "userIdOne":idUserOne,
    "userIdTwo":idUserTwo
    ,"userNameOne":"userNameOne"
    ,"userNameTwo":"userNameTwo"
    ,"colorBlue": idUserTwo
    ,"colorYellow":idUserOne}
    );

newGame.save(function(err,user){
    if (err) return console.error(err);
    else console.log("Game crée");
})






}



exports.sendGameToUsers = function(socket,io){

    mongoose.connection.db.collection(mongoModel.CollectionGameString,function(err,collection){
        collection.find({}).toArray(function(err, data){

            data.forEach(function(element) {

                const gameToUserPlayer = {tableauGame:element.tableauGame,
                    playerTurn:true,
                    userNameOne:"userNameOne",
                    userNameTwo:"userNameTwo"}
    
                    const gameToUserNotPlayer = {tableauGame:element.tableauGame,
                        playerTurn:false,
                        userNameOne:"userNameOne",
                        userNameTwo:"userNameTwo"}

             
                if(element.playerTurn === element.userIdTwo )
                {
                    gameToUserNotPlayer.color ="yellow";
                    gameToUserPlayer.color="blue";

                    io.to(`${element.userIdOne}`).emit('playerplay',  gameToUserNotPlayer );
                    io.to(`${element.userIdTwo}`).emit('playerplay',  gameToUserPlayer);        
                }

                else if(element.playerTurn === element.userIdOne)
                {
                    gameToUserNotPlayer.color ="blue";
                    gameToUserPlayer.color="yellow";

                    io.to(`${element.userIdOne}`).emit('playerplay',  gameToUserPlayer );
                    io.to(`${element.userIdTwo}`).emit('playerplay',  gameToUserNotPlayer);     
                }
    
            });

        })
    })



}


exports.checkGameUser = function(idPlayer,position){

            console.log(position);

            var tab =  translatePosition(position);

            var positionNew = tab[0];

            var positionBase = tab[1];

   
  mongoose.connection.db.collection(mongoModel.CollectionGameString,function(err,collection){
        collection.find({playerTurn : idPlayer}).toArray(function(err, data){

            data.forEach(function(element) {

               if(idPlayer === element.playerTurn &&
                element.tableauGame[positionNew].typeCase === "vide"){
                

                // IL FAUT QU'ICI ON METTE LA CONDITION QUI VERIFIE SI LE COUP ENVOYE EST BIEN FESABLE OU NON

        
                   if(element.playerTurn === element.userIdOne){
                   if(element.tableauGame[positionBase].typeCase === "yellow")
                   { 
                    checkGamePlay(element,positionNew,positionBase,idPlayer);

                }
                    else
                    console.log('coup impossible à jouer');
                   }
                
                   else if(element.playerTurn === element.userIdTwo){
                   if(element.tableauGame[positionBase].typeCase === "blue"){
   
                   checkGamePlay(element,positionNew,positionBase,idPlayer);
                   }
                
                   else
                   console.log('coup impossible à jouer');
                   }
                   else{
                    console.log('coup impossible à jouer');
                   }

               }
    
            });

        })
    })
          


}




// C'est ici que c'est modifié grace a la new Position
const modifyTabGame = function(element,position,colorOK,colorNot){

    for(var i =0 ; i<8;i++){

        for(var p =0;p<8;p++){

            var index = (8*i) + p;

            if(index == position){
               var tabComparaison = tableauComparaison(i,p);
               
                    for(var o = 0;o<tabComparaison.length;o++){

                        var one = parseInt(tabComparaison[o].first);
                        var second = parseInt(tabComparaison[o].second);
                        var indexToFind= ( one * 8) + second;

                        if((one < 8 && one > -1) &&
                        (second < 8 && second > -1) &&
                        ( element.tableauGame[indexToFind].typeCase === colorNot ) 
                        )
                        {
                           element.tableauGame[indexToFind].typeCase = colorOK;
                        }

                    }

            }
            else{
               
            }


        }



    }









    return element;

}




// Modifie la GAME
const modifyGameUser = function(idPlayer, element, position){
    
    if(element.playerTurn === element.userIdOne)
    {element.playerTurn = element.userIdTwo;
        element.tableauGame[position].typeCase = "yellow";
       element = modifyTabGame(element,position,"yellow","blue");}

    else if(element.playerTurn === element.userIdTwo){
    element.playerTurn = element.userIdOne; 
    element.tableauGame[position].typeCase = "blue";
    element = modifyTabGame(element,position,"blue","yellow");}

    
    mongoModel.GameModel.findOneAndUpdate
    ({playerTurn : idPlayer} , {$set:{tableauGame : element.tableauGame, playerTurn : element.playerTurn} }, {new: true},
    (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }
        else {
            // IL FAUT QU'ICI ON METTE LA CONDITION QUI VERIFIE SI LE COUP PERMET DE FINIR LA PARTIE 
         //   console.log("id => : " + idPlayer + " documents => "+ doc);
    }
    });

}




// Pour savoir sur quel case l'User à cliquer en second click et en premier click
const checkGamePlay = function(element,positionNew,positionBase,idPlayer){

        var tab = element.tableauGame;


        for(var i =0 ; i<8;i++){

            for(var p =0;p<8;p++){

                var index = (8*i) + p;

                if(index == positionBase){


                   var tabComparaison = tableauComparaison(i,p);
                   
                        for(var o = 0;o<tabComparaison.length;o++){

                            var one = parseInt(tabComparaison[o].first);
                            var second = parseInt(tabComparaison[o].second);
                            var indexToFind= ( one * 8) + second;
                        
                            if((one < 8 && one > -1) &&
                            (second < 8 && second > -1) &&
                            (element.tableauGame[indexToFind].typeCase === "vide") &&
                            (indexToFind == positionNew) )
                            {
                               modifyGameUser(idPlayer,element,indexToFind);
                            }
                        }
                }
                else{
                   
                }
            }
        }
}


// Liste des comparaison autour du pion
const tableauComparaison = function(i,p){

    var tableau = [];
    tableau.push({"first" : i-1 ,"second" : p-1});
    tableau.push({"first" : i-1 ,"second" : p});
    tableau.push({"first" : i-1 ,"second" : p+1});

    tableau.push({"first" : i ,"second" : p+1});
    tableau.push({"first" : i ,"second" : p-1});

    tableau.push({"first" : i+1 ,"second" : p-1});
    tableau.push({"first" : i+1 ,"second" : p});
    tableau.push({"first" : i+1 ,"second" : p+1});


    return tableau;


}






const translatePosition = function(position){

    var tab = new Array();
    var one = "";
    var seconde = "";
    var index = 0;

    for(var i = 0;i<position.length;i++){
            if(position[i] === "0" || position[i] === "1" || position[i] === "2"|| position[i] === "3"|| position[i] === "4"|| position[i] === "5"|| position[i] === "6"|| position[i] === "7"|| position[i] === "8"|| position[i] === "9")
            {
                if(index ===0)
                one = one + position[i];
                else if(index ===1)
                seconde = seconde + position[i];
            }
            else if(position[i] === ","){ 
                 index = index + 1;
                }
           
    }


    tab[0] = one;
    tab[1] = seconde;


    return tab;

}


//Quand un user lance une recherce, check si il est pas déjà dans une partie
exports.checkUserGameId = function(idPlayer){
    
    //Check si il est user Two
    var promiseDeleteUserTwo = new Promise(function(res,rej) { 

        mongoModel.GameModel.findOne({idUserTwo: idPlayer},function(err,user){

        if (err) {
            return console.error(err);
        }

        else if (user === null){
           
            res(console.log("pas trouvé"));
    }

        else {

            user.remove(function(err){
                if (err) {  
                    return console.error(err);
                         }
                else {  
                        res(user);
                    }
                                     });
            }
        })
    });

    //Check si il est user One
 //Check si il est user Two
 var promiseDeleteUserOne = new Promise(function(res,rej) { 

    mongoModel.GameModel.findOne({idUserOne: idPlayer},function(err,user){

    if (err) {
        return console.error(err);
    }

    else if (user === null){
        res(console.log("pas trouvé"));
}

    else {

        user.remove(function(err){
            if (err) {  
                return console.error(err);
                     }
            else {  
                    res(user);
                }
                                 });
        }
    })
});

Promise.all([promiseDeleteUserTwo,promiseDeleteUserOne]).then(function(val){
    searchGame.checkNumberUserSearch()
                                          });


}
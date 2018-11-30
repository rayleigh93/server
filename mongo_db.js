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
    {"typeCase":"vide","typeTiles":3},{"typeCase":"blue","typeTiles":4},
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
    {"typeCase":"vide","typeTiles":0},{"typeCase":"vide","typeTiles":0}],
    
    "userIdOne":idUserOne,
    "userIdTwo":idUserTwo
    ,"userNameOne":"userNameOne"
    ,"userNameTwo":"userNameTwo"}
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
                    console.log(gameToUserPlayer);
                    io.to(`${element.userIdOne}`).emit('playerplay',  gameToUserNotPlayer );
                    io.to(`${element.userIdTwo}`).emit('playerplay',  gameToUserPlayer);        
                }

                else if(element.playerTurn === element.userIdOne)
                {
                    io.to(`${element.userIdOne}`).emit('playerplay',  gameToUserPlayer );
                    io.to(`${element.userIdTwo}`).emit('playerplay',  gameToUserNotPlayer);     
                }
    
            });

        })
    })



}


exports.modifyGameUser = function(idPlayer,position){

   
    mongoose.connection.db.collection(mongoModel.CollectionGameString,function(err,collection){
        collection.find({playerTurn : idPlayer}).toArray(function(err, data){

            data.forEach(function(element) {

               if(idPlayer === element.playerTurn){
                
             
                // IL FAUT QU'ICI ON METTE LA CONDITION QUI VERIFIE SI LE COUP ENVOYE EST BIEN FESABLE OU NON
                // ET EN PLUS IL FAUT CHANGER CA 
                    element.arrayCase[position].typeCase = "green";

                    if(element.playerTurn === element.idUserOne)
                    element.playerTurn = element.idUserTwo;
                    else if(element.playerTurn === element.idUserTwo)
                    element.playerTurn = element.idUserOne;


                    mongoModel.GameModel.findOneAndUpdate
                    ({playerTurn : idPlayer} , {$set:{arrayCase : element.arrayCase, playerTurn : element.playerTurn} }, {new: true},
                    (err, doc) => {
                        if (err) {
                            console.log("Something wrong when updating data!");
                        }
                        else {
                            // IL FAUT QU'ICI ON METTE LA CONDITION QUI VERIFIE SI LE COUP PERMET DE FINIR LA PARTIE 
                            console.log("id => : " + idPlayer + " documents => "+ doc);
                    }
                    });


                    
                  
               }
    
            });

        })
    })

                


}



//Quand un suer lance une recherce, check si il est pas déjà dans une partie
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
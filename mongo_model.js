// Ce fichier s'occupe d'organiser les 'MONGO DB MODEL'
const mongoose = require('mongoose');



// NOM DES COLLECTIONS
const CollectionUserOnline = "userOnline"
exports.CollectionUserOnlineString = CollectionUserOnline;



// UserOnline (User ajouté à la liste des User actuellement en ligne)
var userOnlineSchema = new mongoose.Schema({
    userName: String,
    id: String
},{ collection: CollectionUserOnline});

var UserOnlineModel = mongoose.model('useronline',userOnlineSchema);
exports.UserOnlineModel = UserOnlineModel;









// NOM DES COLLECTIONS
const CollectionGame = "gameOnline"
exports.CollectionGameString = CollectionGame;


// Game Schema qui correpond à la structure d'une partie
var GameSchema = new mongoose.Schema({
    "arrayCase":
            [{"typeCase":String},
             {"typeCase":String},
             {"typeCase":String}
            ,{"typeCase":String},
              {"typeCase":String},
                 {"typeCase":String},
                 {"typeCase":String},
              {"typeCase":String},
                 {"typeCase":String}],
        "idUserTwo":String,
        "idUserOne":String,
        "playerTurn":String
},{ collection: CollectionGame});

var GameModel = mongoose.model('gameOnline',GameSchema);
exports.GameModel = GameModel;



/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

//"use strict";

var expect = require("chai").expect;
var fetch = require("node-fetch");
var assert = require("assert");
const requestIp = require("request-ip");
var mongoose = require("mongoose");

// conectando a mongodb

const CONNECTION_STRING = process.env.DB;
var Schema = mongoose.Schema;
const agg = [
  {
    $addFields: {
      likes: {
        $ifNull: ["$nuevo", 0]
      }
    }
  }
];

const client = new mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: "stock"
});

(async function connect() {
  try {
    await client;
    console.log("Base de datos conectada");
  } catch (error) {
    assert(error, null);
  }
})();

var stock = new Schema({
  stock: { type: String, required: true },
  likes: { type: Number, default: 0 },
  listip: { type: Array, default: [] },
  price: String
});

var Likes = mongoose.model("likes", stock);

// ----------------------------------------------------

module.exports = function(app) {
  app.route("/api/stock-prices").get(async function(req, res) {
    const like = req.query.like;
    const code = req.query.stock instanceof Object ? req.query.stock : [req.query.stock];
    const clientIp = requestIp.getClientIp(req);    
    
       
    var result = [];
    
    for (var i=0; i < code.length; i++) {      
      
      let stockNow = await getStock(code[i]);
      let ipNow = await checkIp(code[i], clientIp)
      
      let onlike = {$set: { price: stockNow }, $inc: { likes: 1 }, $push: { listip: clientIp }};
      let nolike = { $set: { price: stockNow } };
      
      stockNow      
        ? like
          ? ipNow
            ? result.push(await updateOrCreate(code[i], onlike))
            : result.push(await updateOrCreate(code[i], nolike))
          : result.push(await updateOrCreate(code[i], nolike))
        : result.push("Invalid Stock Code Input");
        
      };
    
       if(result.length == 1){
         res.json({"stockData":result[0]})
       }
      else{        
        var like1 = result[0]._doc.likes;
        var like2 = result[1]._doc.likes;
        
        var rel1 = like1 - like2;
        var rel2 = like2 - like1;
                
        
        result[0]._doc.rel_likes = rel1;
        result[1]._doc.rel_likes = rel2;
        
        result[0]._doc.likes = undefined;
        result[1]._doc.likes = undefined;
        
        res.json({"stockData":result});
        
      }
  
    
})};

async function checkIp(stock, ip) {
  let checkip = element => element == ip,
    result;
  try {
    let doc = await Likes.findOne({ stock: stock });
    doc
      ? doc.listip.findIndex(checkip) == -1
        ? (result = true)
        : (result = false)
      : (result = true);
  } catch (e) {
    assert.equal(null, e, "Error chequeando ip");
  }
  return result;
}

async function updateOrCreate(stock, changes) {
  let doc;
  try {
    doc = await Likes.findOneAndUpdate({ stock: stock }, changes, {
      new: true,
      upsert: true,
      projection: { stock: 1, likes: 1, stock: 1, _id: 0, price: 1 }
    });
  } catch (e) {
    assert.equal(null, e, "Error modificando datos");
  }
  return doc;
}

async function getStock(code) {
  let stockfetch = `https://repeated-alpaca.glitch.me/v1/stock/${code}/quote`;

  try {
    let lastPrice;
    await fetch(stockfetch)
      .then(response => response.json())
      .then(json => (lastPrice = json.latestPrice));
    return lastPrice;
    // -----------------------------------------------
  } catch (err) {
    assert.equal(null, err, "Error recibiendo API FCC datos");
    return err;
  }
}

// add like
// check ip
// find doc
// find stock

/*

si viene like
var result = [];

for(i=0, i<code.lenght, i++){ 
getStock(code[i])
?  like
  ? checkip(code[i], clientIp)
     ? result.push(await updateOrCreate(code[i], onlike));
     : result.push(await updateOrCreate(code[i], nolike))
  
  :  result.push(await updateOrCreate(code[i], nolike))}}
     
          
:  result.push({"Invalid Stock Code Input"})
}
    
    

var like1 = result[0].likes 
var like2 = result[1].likes

var rel1 = like1 - like2
var rel2 = like2 - like1

result[0].rel_likes = rel1
result[1].rel_likes = rel2
delete result[0].likes, result[1].likes

res.json({stockData:result})
*/

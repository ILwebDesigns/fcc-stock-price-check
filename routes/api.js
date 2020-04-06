/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var fetch = require("node-fetch");
const requestIp = require("request-ip");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
let stocklikes = {};
let result;

module.exports = function(app) {
  app.route("/api/stock-prices").get(async function(req, res) {
    const clientIP = requestIp.getClientIp(req);
    const like = req.query.like ? 1 : 0;
    const stock =
      req.query.stock instanceof Object ? req.query.stock : [req.query.stock];

    let price0 = await getStock(stock[0]);
    let price1 = await getStock(stock[1]);

    stock.forEach(function(code) {
      if (like) {
        withLike(code, clientIP, stocklikes);
      } else if (!stocklikes[code]) {
        stocklikes[code] = { likes: 0, listip: [] };
      }
    });

    if (req.query.stock instanceof Object) {
      var like1 = stocklikes[stock[0]].likes;
      var like2 = stocklikes[stock[1]].likes;

      var rel1 = like1 - like2;
      var rel2 = like2 - like1;

      result = {
        stockData: [
          {
            stock: stock[0],
            price: `${price0}`,
            rel_likes: rel1
          },
          {
            stock: stock[1],
            price: `${price1}`,
            rel_likes: rel2
          }
        ]
      };
    } else {
      result = {
        stockData: {
          stock: stock[0],
          price: `${price0}`,
          likes: stocklikes[stock[0]].likes
        }
      };
    }

    res.json(result);
  });
};

function withLike(code, ip, store) {
  var test = element => element == ip;

  if (store[code]) {
    if (store[code].listip.findIndex(test) == -1) {
      var sum = store[code].likes + 1;
      store[code].likes = sum;
      store[code].listip.push(ip);
    }
  } else {
    store[code] = { likes: 1, listip: [] };
    store[code].listip.push(ip);
  }
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
    console.log(err);
  }
}

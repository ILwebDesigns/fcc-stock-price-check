/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("GET /api/stock-prices => stockData object", function() {
    test("1 stock", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end(function(err, res) {
          assert.property(res.body, "stockData");
          assert.isObject(res.body.stockData);
          assert.property(res.body.stockData, "likes");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "stock");
          //complete this one too
          done();
        });
    });

    test("1 stock with like", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end(function(err, res) {
          assert.isObject(res.body.stockData);
          assert.property(res.body, "stockData");
          assert.property(res.body.stockData, "likes");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "stock");
          assert.propertyVal(res.body.stockData, "likes", 1);

          //complete this one too
          done();
        });
    });

    test("1 stock with like again (ensure likes arent double counted)", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end(function(err, res) {
          assert.isObject(res.body.stockData);
          assert.property(res.body, "stockData");
          assert.property(res.body.stockData, "likes");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "stock");
          assert.propertyVal(res.body.stockData, "likes", 1);

          //complete this one too
          done();
        });
    });

    test("2 stocks", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["amzn", "aapl"] })
        .end(function(err, res) {
          let result1 = res.body.stockData[0];
          let result2 = res.body.stockData[1];

          assert.property(res.body, "stockData");
          assert.isArray(res.body.stockData);
          assert.property(result1, "rel_likes");
          assert.property(result1, "price");
          assert.property(result1, "stock");
          assert.propertyVal(result1, "rel_likes", 0);
          assert.property(result2, "rel_likes");
          assert.property(result2, "price");
          assert.property(result2, "stock");
          assert.propertyVal(result2, "rel_likes", 0);

          //complete this one too
          done();
        });
    });

    test("2 stocks with like", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["amzn", "aapl"], like: true })
        .end(function(err, res) {
          let result1 = res.body.stockData[0];
          let result2 = res.body.stockData[1];

          assert.property(res.body, "stockData");
          assert.isArray(res.body.stockData);
          assert.property(result1, "rel_likes");
          assert.property(result1, "price");
          assert.property(result1, "stock");
          assert.propertyVal(result1, "rel_likes", 0);
          assert.property(result2, "rel_likes");
          assert.property(result2, "price");
          assert.property(result2, "stock");
          assert.propertyVal(result2, "rel_likes", 0);

          //complete this one too
          done();
        });
    });
  });
});

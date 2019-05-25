var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/ask';
var app = express();

var bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('src'));
app.use(express.static('../ask-contract/build/contracts'));

app.get('/', function (req, res) {
  res.render('index1.html');
});

app.get('/airlineFlights', function (req, res){
  MongoClient.connect(url, function(err, db) {
    var cursor = db.collection('airlineFlights').find();
    var airlineFlights = {};
    cursor.forEach(function(doc) {
      airlineFlights[doc.FlightID] = doc;
    },function(err){
      db.close();
      res.send(airlineFlights);
    });
  }); 
})

app.post('/updateSeats', function (req, res){
  var seats = parseInt(req.body.seats);
  var flightId = parseInt(req.body.flightId);
  var availSeats;
  MongoClient.connect(url, function(err, db) {
    var cursor = db.collection('airlineFlights').find({'FlightID':flightId});
    cursor.forEach(function(doc) {
      availSeats = doc.SeatsAvail;
    },function(err){
      var newSeats = availSeats - seats;
      db.collection('airlineFlights').updateOne({'FlightID':flightId},{$set:{SeatsAvail:newSeats}}, function(err,doc){
        res.send({'updatedSeats':newSeats});
        db.close();
      });
    });
  }); 
})

app.listen(3000, function () {
  console.log('Airline Consortium ASK Dapp listening on port 3000!');
});
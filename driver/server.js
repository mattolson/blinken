var express = require('express');

var app = express(),
    http = require('http'),
    server = http.createServer(app);

//Websockets
io = require('socket.io').listen(server);
//Websocket streams
require('socket.io-stream')(io);

var api = require("./api");
var Config = require("./config");
var bodyParser = require('body-parser');

function start() {
  // Start http server
  server.listen(Config.server.port, 'localhost', function ()  {
    console.log('Listening on localhost:'+Config.server.port);
  });

  // Configure to serve static files out of '/static' directory
  app.use(express.static(__dirname + '/static'));

  // Automatically parse request body
  // app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());

  // Register http handlers
  api.registerHttpHandlers(app);
  
  // Register socket handlers
  api.registerSocketHandlers();
 
  // Export for later
  exports.app = app;
  exports.io = io;
}

exports.start = start;
var express = require('express');

var app = express();
//var app = connect();

var http = require('http'),
    server = http.createServer(app);

//Websockets
io = require('socket.io').listen(server);
//Websocket streams
require('socket.io-stream')(io);

var api = require("./api");
var Config = require("./config");
var bodyParser = require('body-parser');

function start() {
  // Configure to serve static files out of '/static' directory
  app.use(express.static(__dirname + '/static'));

  // Automatically parse request body. Middleware.
  // app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());  

  // Register http handlers
  api.registerHttpHandlers(app);
  
  // Register socket handlers
  api.registerSocketHandlers();
 
  // Export for later
  exports.app = app;
  exports.io = io;
    
  // Start http server
  server.listen(Config.server.port, Config.server.host, function ()  {
  // app.listen(Config.server.port, '192.168.1.6', function ()  {
    console.log('Listening on '+Config.server.host+':'+Config.server.port);
  });

}

exports.start = start;
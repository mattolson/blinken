var express = require('express');

var app = express();
//var app = connect();

var http = require('http'),
    server = http.createServer(app);

//Websockets
io = require('socket.io').listen(server);
//Websocket streams
console.log("Loading socket.io-stream");
require('socket.io-stream')(io);

console.log("Loading API");
var api = require("./api");

console.log("Loading Config");
var Config = require("./config");
var bodyParser = require('body-parser');

function start() {
  // Configure to serve static files out of '/static' directory
  app.use(express.static(__dirname + '/static'));

  // Automatically parse request body. Middleware.
  // app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());  

  // Register http handlers
  console.log("Registering HTTP handlers");
  api.registerHttpHandlers(app);
  
  // Register socket handlers
  console.log("Registering socket handlers");
  api.registerSocketHandlers();
 
  // Export for later
  exports.app = app;
  exports.io = io;
    
  // Start http server
  //server.listen(Config.server.port, Config.server.host, function ()  {
  server.listen(Config.server.port, function ()  {  // listens on all ip addresses if host is not specified    
    console.log('\nListening on all IP addresses, on port: '+Config.server.port);
  });
}

exports.start = start;
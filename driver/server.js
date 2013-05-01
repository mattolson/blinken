var express = require('express');
var socket = require('socket.io');
var http = require('http');
var api = require("./api");

var app, io;

function start() {
  // Create servers
  app = express();
  server = http.createServer(app);

  // Instantitate web socket
  io = socket.listen(server);
  io.set('log level', 1);  

  // Start http server
  server.listen(8888);
  console.log("Listening on port 8888...");

  // Configure to serve static files out of '/static' directory
  app.use(express.static('static'));

  // Register http handlers
  api.registerHttpHandlers(app);

  // Register socket handlers
  io.on("connection", function(socket) {
    api.registerSocketHandlers(socket);
  });

  // Export for later
  exports.app = app;
  exports.io = io;
}

exports.start = start;


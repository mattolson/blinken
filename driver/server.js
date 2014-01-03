var express = require('express');
var socket = require('socket.io');
var http = require('http');
var api = require("./api");
var Config = require("./config");

var app, io;

function start() {
  // Create servers
  app = express();
  server = http.createServer(app);

  // Instantitate web socket
  io = socket.listen(server);
  io.set('log level', 1);  

  // Start http server
  server.listen(Config.server.port);
  console.log("Listening on port " + Config.server.port + "...");

  // Downgrade permissions
  if (process.setgid) {
	process.setgid(Config.server.group);
  }
  if (process.setuid) {
	process.setuid(Config.server.user);
  }

  // Configure to serve static files out of '/static' directory
  app.use(express.static(__dirname + '/static'));

  // Automatically parse request body
  app.use(express.bodyParser());

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


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
  server.listen(Config.server_port);
  console.log("Listening on port " + Config.server_port + "...");

  // Downgrade permissions
  process.setuid(Config.server_user);
  process.setgid(Config.server_group);

  // Configure to serve static files out of '/static' directory
  app.use(express.static('static'));

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


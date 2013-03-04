var http = require('http');
var socket = require('socket.io');
var handlers = require('./handlers');

function start(app) {
  var io = socket.listen(http.createServer(app));
  console.log("web socket started...");

  io.set('log level', 1);  
  io.sockets.on("connection", function(socket) {
    handlers.registerSocketHandlers(socket);
  });
}

exports.start = start;

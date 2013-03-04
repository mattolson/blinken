var server = require("./server.js");
var sockets = require("./sockets.js");
var handlers = require('./handlers.js');

// Start http server
server.start();

// Start web sockets
sockets.start(server.app, handlers.handleSocket);

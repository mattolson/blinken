var server = require("./server.js");
var sockets = require("./sockets.js");

// Start everything up
server.start();
sockets.start(server.app);


var express = require('express');
var handlers = require("./handlers");

var app;

function start() {
  // Create express server
  app = express();

  // Serve static files out of '/static' directory
  app.use(express.static('static'));

  // Register http handlers
  handlers.register_http_handlers(app);

  // Start server
  app.listen(8888);
  console.log("Listening on port 8888...");

  // Export for later
  exports.app = app;
}

exports.start = start;


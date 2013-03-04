var url = require("url");
var util = require('util');

// Instantitate static file server
var StaticServer = require('node-static').Server;
var file_server = new StaticServer("./static", {
  cache: 600,
  headers: { 'X-Powered-By': 'node-static' }
});

// Instantiate route map to be populated by handlers
var routeMap = {};

// route incoming requests
function routeHttp(request, response) {
  var path = url.parse(request.url).pathname;
  console.log("Received request for: " + path);

  // if there is a function registered for that path, call it
  if (typeof(routeMap[path]) === 'function') {
    routeMap[path](request, response);
  }
  else {
    // otherwise try to serve a static file
    file_server.serve(request, response, function(err, result) {
      if (err) {
        console.error('Error serving %s - %s', request.url, err.message);
        response.writeHead(err.status, err.headers);
        response.write(util.format("Error %d", err.status));
        response.end();
      } 
    });
  }
}

// Add a handler to the route map
function addHandler(path, handler) {
  routeMap[path] = handler;
}

// Export public methods
exports.routeHttp = routeHttp;
exports.addHandler = addHandler;

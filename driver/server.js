var http = require("http");
var router = require("./router");

var app = null;

function start() {
  app = http.createServer(function(request, response) {
    router.routeHttp(handler, path, request, response);
  });
  app.listen(8888);
  console.log("server started ...");
}

exports.app = app;
exports.start = start;


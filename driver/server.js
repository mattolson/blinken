var http = require("http");
var router = require("./router");

var app;

function start() {
  app = http.createServer(function(request, response) {
    router.routeHttp(handler, path, request, response);
  });
  app.listen(8888);
  exports.app = app;
  console.log("server started ...");
}

exports.start = start;


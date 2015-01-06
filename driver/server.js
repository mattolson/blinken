//------------------------------------------------------------------------------
// Blinken Server
//------------------------------------------------------------------------------

var debug_level = 2;

// the following few lines of code require: "npm install"  (minimist is now in package.json)
// the "minimist" library easily parses command line arguments
// this allows, for example, "--debug=0" as a comand-line option
// could also be used to allow specifying, for example,  --port=1337 on command line (see ref to argv.port below)

argv = {};
//var argv = require('minimist')(process.argv.slice(2));
//debug_level = argv.debug;
//console.log("debug_level: " + debug_level);
//console.log(argv);

if (debug_level > 0) console.log("\n" + "Blinken Server");

// Make sure we have a good config file.
try {        
    var Config = require.resolve("./config.js");  // fixme? this does not actually load the config file
    //console.log(Config); // on windows, this outputs: "c:\blinken\driver\config.js"
} catch(e) {
    console.error("Config file is not setup. Please rename config-default.js to config.js");
    process.exit(e.code);
}

var express = require('express');

var app = express();
//var app = connect();

var http = require('http'),
    server = http.createServer(app);

//Websockets
io = require('socket.io').listen(server);
//Websocket streams
if (debug_level > 1) console.log("Loading socket.io-stream");
require('socket.io-stream')(io);

if (debug_level > 1) console.log("Loading API");
var api = require("./api");

if (debug_level > 1) console.log("Loading Config");
var Config = require("./config");
var bodyParser = require('body-parser');

function start() {
  // Configure to serve static files out of '/static' directory
  app.use(express.static(__dirname + '/static'));

  // Automatically parse request body. Middleware.
  // app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());  

  // Register http handlers
  if (debug_level > 1) console.log("Registering HTTP handlers");
  api.registerHttpHandlers(app);
  
  // Register socket handlers
  if (debug_level > 1) console.log("Registering socket handlers");
  api.registerSocketHandlers();
 
  // Export for later
  exports.app = app;
  exports.io = io;
    
  // allows "--port=8888", for example, as a command-line argument
  if (argv.port) {
    Config.server.port = argv.port;
  }
    
  // Start http server
  //server.listen(Config.server.port, Config.server.host, function ()  {
  server.listen(Config.server.port, function ()  {  // listens on all ip addresses if host is not specified
    console.log('\nBlinken is listening on all IP addresses, port: '+Config.server.port);
  });
}

exports.start = start;
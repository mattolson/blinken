//------------------------------------------------------------------------------
// Blinken Server
//------------------------------------------------------------------------------

var program_name = "Blinken v0.1";
var debug_level = 3;
if (debug_level > 0) console.log("\n" + program_name + "\n");

Config = {};
try {
    // load the local custom configuration file
    var config_filename = require.resolve("./config.js");  // error if file does not exist
    if (debug_level > 1) console.log("Loading config.js");
    var Config = require("./config.js");  // load local config file into config object
} catch(e) {
    console.log("Warning: local config file is not set up.");
    console.log("    Copy config-default.js to config.js to set up config file.");
    console.log("    Server will continue with default settings.");
    console.log("");
    try {
        var Config = require("./config-default.js"); // load default settings
    } catch(e) {
        console.log("Error: config-default.js file is missing also.  Unable to continue.");
        process.exit(e.code);
    }
}
if ('debug_level' in Config) {
    debug_level = Config.debug_level;
}

var argv = {};
try {
    // parse command-line arguments into argv
    //
    if (debug_level > 3) console.log("Loading minimist");
    argv = require('minimist')(process.argv.slice(2));
    if (debug_level > 4) console.log("command line arguments: ",argv);
} catch(e) {
    if (debug_level > 0) console.log("Warning: a required library is not installed.  Run 'npm install' to fix.");
    if (debug_level > 0) console.log("    Due to the missing library, command line arguments will be ignored.");
    if (debug_level > 0) console.log("");
}
if ('debug' in argv) {
    Config.debug_level = argv.debug;  // command-line argument, example '--debug=3'
    debug_level = Config.debug_level;
}
if ('port' in argv) {
    Config.server.port = argv.port; // command-line argument, example '--port=8888'
}


// FIXME: add error checking for any missing required libraries?
//
// all required libraries should be listed in package.json
// so running 'npm install' should automatically install all required libraries
//
if (debug_level > 0) {
    console.log("");
    console.log("Troublshooting Tip: ");
    console.log("    If you get an error 'Cannot find module' ");
    console.log("    when starting a new version for the first time, ");
    console.log("    run the command 'npm install' first, then restart. ");
    console.log("");
}

if (debug_level > 3) console.log("Loading express");
var express = require('express');

var app = express();
//var app = connect();

if (debug_level > 3) console.log("Loading http");
var http = require('http'),
server = http.createServer(app);

if (debug_level > 3) console.log("Loading body-parser");
var bodyParser = require('body-parser');

if (debug_level > 3) console.log("Loading socket.io (Websockets)");
io = require('socket.io').listen(server);

if (debug_level > 3) console.log("Loading socket.io-stream");
require('socket.io-stream')(io);

if (debug_level > 1) console.log("Loading API");
var api = require("./api");

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
    
  // Start http server
  //server.listen(Config.server.port, Config.server.host, function ()  {
  server.listen(Config.server.port, function ()  {  // listens on all ip addresses if host is not specified
    console.log('Listening on all IP addresses, port: '+Config.server.port);
  });
}

exports.start = start;

// Make sure we have a good config file.
try {        
    var Config = require.resolve("./config.js");
} catch(e) {
    console.error("Config file is not setup. Please rename config-default.js to config.js");
    process.exit(e.code);
}

var server = require("./server.js");
server.start();
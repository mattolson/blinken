// Setup grid
var Config = require('./config');
var Grid = require('./grid');
var grid = new Grid('/dev/spidev0.0', 
                    Config.num_panels_x, 
                    Config.num_panels_y, 
                    Config.num_pixels_per_panel_x, 
                    Config.num_pixels_per_panel_y);

// Setup controller
var Controller = require('./controller');
var controller = new Controller(grid);
controller.run();

// Get effect registry (this loads effects as well)
var effects = require('./effect_registry');

// GET /leds
// Output current leds as json
function ledState(request, response) {
  response.send('LedsJson('+JSON.stringify(grid.toJson())+');');
}

// GET /effects
// List available effects
function listEffects(request, response) {
  response.send('ListEffectsJson('+JSON.stringify(effects.toJson())+');');
}

// Change individual pixel
function changeLed(socket, x, y, rgb) {
  // Change the pixel color
  grid.setPixelColor(x, y, rgb);
  grid.sync();

  // Broadcast change to all other clients
  socket.broadcast.emit("changed:led", { x: x, y: y, rgb: rgb }); 
}

// Register socket handlers. Called from server.js once sockets
// are up and running.
exports.registerSocketHandlers = function(socket) {
  socket.on("change:led", function(data) {
    // Validate input values
    var x = parseInt(data.x);
    var y = parseInt(data.y);
    var r = parseInt(data.rgb[0]);
    var g = parseInt(data.rgb[1]);
    var b = parseInt(data.rgb[2]);
    r = r < 0 ? 0 : (r > 255 ? 255 : r);
    g = g < 0 ? 0 : (g > 255 ? 255 : g);
    b = b < 0 ? 0 : (b > 255 ? 255 : b);

    changeLed(socket, x, y, [r,g,b]);
  });

  socket.on("off", function(data) {
    controller.deregister_all();
    grid.off();
    socket.emit("update", grid.toJson());
  });

  socket.on("effect:register", function(data) {
    // Extract effect name
    var effect_name = data['name'];
    delete data['name'];

    // Find and instantiate effect by name
    var effect = effects.find(effect_name);
    if (effect != null) {
      controller.register_effect(new effect(grid, data));
      console.log("INFO: registered effect '" + effect_name + "'");
    }
    else {
      console.log("ERROR: unknown effect '" + effect_name + "'");
    }
  });
}

// Register http handlers. Called from server.js once http
// server is up and running.
exports.registerHttpHandlers = function(app) {
  app.get('/leds', ledState);
  app.get('/effects', listEffects);
}

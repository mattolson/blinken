// Setup grid
var Grid = require('./grid');
var grid = new Grid('/dev/spidev0.0', 2, 1, 3, 6);

// Setup controller
var Controller = require('./controller');
var controller = new Controller(grid);
controller.run();

// Get effect registry (this loads effects as well)
var effects = require('./effect_registry');

// GET /leds
// Output current leds as json
function ledState(request, response) {
  response.send(grid.toJson());
}

// GET /effects
// List available effects
function listEffects(request, response) {
  response.send(effects.toJson());
}

// Handle change events on the socket
function changeLed(socket, x, y, rgb) {
  // Change the pixel color
  grid.setPixelColor(x, y, rgb);
  grid.sync();

  // Broadcast change to all other clients
  socket.broadcast.emit("changed:led", { x: x, y: y, rgb: rgb }); 
}

// Register socket handlers
exports.registerSocketHandlers = function(socket) {
  // Add grid listener
  //grid.addListener(function() {
  //  socket.emit("update", grid.toJson());
  //});

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
    var effect_name = data['effect'];
    delete data['effect_name'];

    // Find and instantiate effect by name
    var effect = effects.find(effect_name);
    if (effect != null) {
      controller.register_effect(new effect(grid, data));
    }
    else {
      console.log("ERROR: unknown effect '" + effect_name + "'");
    }
  });
}

// Register http handlers
exports.registerHttpHandlers = function(app) {
  app.get('/leds', ledState);
  app.get('/effects', listEffects);
}

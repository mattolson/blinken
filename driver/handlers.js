// Setup grid
var Grid = require('./grid').Grid;
var grid = new Grid('/dev/spidev0.0', 2, 1, 3, 6);

// Setup controller
var Controller = require('./controller');
var controller = new Controller(grid);
controller.run();

// Import effects
var Throb = require('./effects/throb');

// Output current leds as json
function renderLeds(request, response) {
  response.send(grid.toJson());
}

// Handle change events on the socket
function changeLed(socket, x, y, r, g, b) {
  // Change the pixel color
  grid.setPixelColor(x, y, r, g, b);
  grid.sync();

  // Broadcast change to all other clients
  socket.broadcast.emit("changed:led", { x: x, y: y, r: r, g: g, b: b }); 
}

// Register socket handlers
exports.registerSocketHandlers = function(socket) {
  socket.on("change:led", function(data) {
    // Massage input value
    var x = parseInt(data.x);
    var y = parseInt(data.y);
    var r = parseInt(data.r);
    var g = parseInt(data.g);
    var b = parseInt(data.b);
    r = r < 0 ? 0 : (r > 255 ? 255 : r);
    g = g < 0 ? 0 : (g > 255 ? 255 : g);
    b = b < 0 ? 0 : (b > 255 ? 255 : b);

    changeLed(socket, x, y, r, g, b);
  });

  socket.on("off", function(data) {
    controller.deregister_all();
    grid.off();
    socket.emit("update", grid.toJson());
  });

  socket.on("throb", function(data) {
    controller.register_effect(new Throb(grid, 40));
    //socket.emit("update", grid.toJson());
  });
}

// Register http handlers
exports.registerHttpHandlers = function(app) {
  app.get('/leds', renderLeds);
}

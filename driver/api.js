//**************************************
//
//                Setup
//
//**************************************

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

//**************************************
//
//              Sources
//
//**************************************

var source_api = {
  // GET /sources
  list: function(request, response) {
    response.send('ListEffectsJson('+JSON.stringify(effects.toJson())+');');
  },

  // GET /sources/:name
  get: function(request, response) {
    console.log("sources.get");
  }
};

//**************************************
//
//              Layers
//
//**************************************

var layer_api = {
  // GET /layers
  list: function(request, response) {
    console.log("layers.list");
  },

  // GET /layers/:id
  get: function(request, response) {
    console.log("layers.get");
  },

  // PUT /layers/:id
  update: function(request, response) {
    console.log("layers.update");
  },

  // DELETE /layers/:id
  destroy: function(request, response) {
    console.log("layers.destroy");
  }
};

//**************************************
//
//              Grid
//
//**************************************

var grid_api = {
  // GET /grid
  get: function(request, response) {
    response.send('LedsJson('+JSON.stringify(grid.toJson())+');');
  }
};

//***************************************************************
//
//                Register handlers
//
//***************************************************************

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

    // Change the pixel color
    grid.setPixelColor(x, y, rgb);
    grid.sync();

    // Broadcast change to all other clients
    socket.broadcast.emit("changed:led", { x: x, y: y, rgb: rgb }); 
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
  // Sources
  app.get('/sources', source_api.list);
  app.get('/source/:id', source_api.get);

  // Layers
  app.get('/layers', layer_api.list);
  app.get('/layers/:id', layer_api.get);
  app.put('/layers/:id', layer_api.update);
  app.delete('/layers/:id', layer_api.destroy);

  // Grid
  app.get('/grid', grid_api.get);
}

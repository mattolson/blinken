//**************************************
//
//                Setup
//
//**************************************

// Setup grid
var Grid = require('./grid');
var grid = new Grid();

// Setup mixer and set rendering loop in motion
var Mixer = require('./mixer');
var mixer = new Mixer(grid);
mixer.run();

// Get source registry (this loads sources themselves as well)
var sources = require('./source_registry');

//**************************************
//
//              Errors
//
//**************************************

function errorResponse(code, description) {
  return {
    'error': {
      'code': code,
      'desc': description
    }
  };
}

//**************************************
//
//              Sources
//
//**************************************

var source_api = {
  // GET /sources
  list: function(request, response) {
    response.jsonp(sources.toJson());
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
    response.jsonp(mixer.toJson());
  },

  // POST /layers
  // expects request body to contain the following:
  // source[name]
  // source[options][...]
  create: function(request, response) {
    var name = request.body.source.name;
    var options = request.body.source.options;

    // Find and instantiate source by name
    var source = sources.find(name);
    if (source != null) {
      var layer = mixer.add_layer(new source(grid, options));
      response.jsonp(layer.toJson());
    } else {
      response.jsonp(errorResponse(400, "ERROR: unknown source '" + name + "'"));
    }
  },

  // GET /layers/:id
  get: function(request, response) {
    var layer = mixer.find_layer(request.params.id);
    if (layer != null) {
      response.jsonp(layer.toJson());
    } else {
      response.jsonp(errorResponse(400, "ERROR: unknown layer id '" + request.params.id + "'"));
    }
  },

  // PUT /layers/:id
  update: function(request, response) {
    console.log("layers.update");
  },

  // DELETE /layers/:id
  destroy: function(request, response) {
    mixer.remove_layer(request.params.id);
    response.set('Status', '204');
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
    response.jsonp(grid.toJson());
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
    mixer.clear_layers();
    grid.off();
    socket.emit("update", grid.toJson());
  });
}

// Register http handlers. Called from server.js once http
// server is up and running.
exports.registerHttpHandlers = function(app) {
  // Sources
  app.get('/sources', source_api.list);

  // Layers
  app.get('/layers', layer_api.list);
  app.post('/layers', layer_api.create);
  app.get('/layers/:id', layer_api.get);
  app.put('/layers/:id', layer_api.update);
  app.delete('/layers/:id', layer_api.destroy);

  // Grid
  app.get('/grid', grid_api.get);
}

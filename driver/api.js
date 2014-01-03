//**************************************
//
//                Setup
//
//**************************************
var util = require('util');

// Setup grid
var Grid = require('./grid');
var grid = new Grid();

// Setup mixer and set rendering loop in motion
var Mixer = require('./mixer');
var mixer = new Mixer(grid);
mixer.run();

// Get source registry (this loads sources themselves as well)
var sources = require('./source_registry');

// TODO: HACK FOR OPENING DEMO, REMOVE ME
// I need access to grid and mixer for the following demo.
var Attendance = require('./attendance');
var attendance = new Attendance(mixer, sources);
attendance.run();

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
    var layer_name = request.body.name;
    var source_name = request.body.source.name;
    var source_options = request.body.source.options;

    // Lookup source
    var source = sources.find(source_name);
    if (source == null) {
      response.status(400).jsonp(errorResponse(400, util.format("ERROR: source not found: '%s'", source_name)));
      return;
    }

    // Add layer and return its json representation
    var layer = mixer.add_layer(layer_name, new source(grid, source_options));
    response.status(201).jsonp(layer.toJson());
  },

  // GET /layers/:id
  get: function(request, response) {
    // Look up layer
    var layer = mixer.find_layer(request.params.id);
    if (layer == null) {
      response.status(404).jsonp(errorResponse(404, util.format("ERROR: layer not found: '%d'", request.params.id)));
      return;
    }

    // Return json representation
    response.jsonp(layer.toJson());
  },

  // PUT /layers/:id
  update: function(request, response) {
    // Look up layer
    var layer = mixer.find_layer(request.params.id);
    if (layer == null) {
      response.status(404).jsonp(errorResponse(404, util.format("ERROR: layer not found: '%d'", request.params.id)));
      return;
    }

    // Update layer
    layer.update(request.body);
    response.send(204);
  },

  // DELETE /layers/:id
  destroy: function(request, response) {
    mixer.remove_layer(request.params.id);
    response.send(204);
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
  },
  
  // added by mf
  // GET /grid/:x/:y 
  getxy: function(request, response) {
    var x = request.params.x;
    var y = request.params.y;
    var color = grid.getPixelColor(x, y);
    if(!color) {
	color = [33,x,y];
    }
    response.jsonp(color.toJson());
  }
};

// TODO: HACK FOR DEMO, REMOVE ME
var ATTENDANCE = 1;
function get_attendance(request, response) {
  response.send(''+(ATTENDANCE++));
}

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
};

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
  app.get('/grid/:x/:y', grid_api.getxy);

  // TODO: HACK FOR DEMO, REMOVE ME
  app.get('/attendance', get_attendance);
};

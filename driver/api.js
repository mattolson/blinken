//**************************************
//
//                Setup
//
//**************************************
var util = require('util');

// Setup grid
console.log("Loading Grid");
var Grid = require('./grid');
var grid = new Grid();

// Setup mixer and set rendering loop in motion
console.log("Loading Mixer");
var Mixer = require('./mixer');
var mixer = new Mixer(grid);
mixer.run();

// Get source registry (this loads sources themselves as well)
console.log("Loading Sources");
var Registry = require('./registry');
// console.log(registry);

var sources = new Registry( 'sources' );
// var filters = new Registry( 'filters' );
// console.log(sources);

var api = new Object();

console.log("Loading Config");
var config = require('./config');  // fixme? this is also required() in server.js - any problem if this is re-loaded?

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

api.source =  new Object();
api.source.list =  function() {
  // console.log(sources.toJson('sources'));
  return sources.toJson('sources');
}

//**************************************
//
//              Filters
//
//**************************************

//todo.

//**************************************
//
//              Channels
//
//**************************************

api.channel = new Object();

api.channel.list = function() {
    return mixer.toJson();
};

// POST /channels
// expects request body to contain the following:
// source[name]
// source[options][...]
api.channel.create = function(channel_name, source_name, source_options) {

  // Lookup source
  var source = sources.find( source_name );
  if (source == null) return { error : util.format("ERROR: source not found: '%s'", source_name) };

  // Add channel and return its json representation
  var channel = mixer.add_channel(channel_name, new source(new Grid(), source_options));
  return channel.toJson();

};

api.channel.addFilter = function( channel_id, filter_name, filter_options ){
  // Lookup source
  var filter = filters.find( filter);
  if (filter == null) return { error : util.format("ERROR: filter not found: '%s'", source_name) };

  // Add channel and return its json representation
  // mixer.add_channel(channel_name, new filter(channel, channel_options));
  // return channel.toJson();
}

// GET /channels/:id
api.channel.get = function(channel_id) {
  // Look up channel
  var channel = mixer.find_channel(channel_id);
  if (channel == null) return { error : util.format("ERROR: channel 'id' not found: '%d'", request.params.id) };
  // Return json representation
  return channel.toJson();
};

// PUT /channels/:id
api.channel.update = function(channel_id, channel_options) {
  // Look up channel
  var channel = mixer.find_channel(channel_id);
  if (channel == null) return { error : util.format("ERROR: channel not found: '%d'", channel_id) }
  // Update channel
  channel.update(channel_options);
  console.log("put /channels/:id");
  console.log(channel_options);
  return true;

};

  // DELETE /channels/:id
api.channel.destroy = function(channel_id) {

  mixer.remove_channel(channel_id);
  return channel_id;

}

//**************************************
//
//              Grid
//
//**************************************

api.grid = new Object();
  
// GET /grid
api.grid.get = function() {
  return grid.toJson();
};
  
// GET /grid/:x/:y 
api.grid.getxy = function(x, y) {
  var color = grid.getPixelColor(x, y);
  if(!color) color = [33,x,y];
  return color.toJson();
}

api.grid.set = function(color_grid, mode, strict){
  grid.set(color_grid, mode, strict);
  return true;
}

api.grid.dimensions = function() {
  return {
    width : config.grid.num_panels_x*config.grid.num_pixels_per_panel_x,
    height : config.grid.num_panels_y*config.grid.num_pixels_per_panel_y
  }
};

api.grid.html = function(){
  var dim = api.grid.dimensions();
  var html = '<table width="100%" height="100%;">';
  var key = 0;
  var grid = api.grid.get();
  var html = '<table>';
  for(var x = 0; x < dim.width; x++){
    html += '<tr class="row">';
    for(var y = 0; y < dim.height; y++){
      var r = grid[key][0],
          g = grid[key][1],
          b = grid[key][2];

      html += '<td class="pixel" id="'+key+'" style="background:rgb('+r+','+g+','+b+')">&nbsp;</td>';
      key++;
    }
    html += '</tr>';
  }
  html += "</table>";
  return html;
}

api.grid.map = function() {
  return grid.pixel_map;
};

api.grid.toggleDisplay = function() {
  return grid.pixel_map;
};



//***************************************************************
//
//                Register handlers
//
//***************************************************************

// Register socket handlers. Called from server.js once sockets
// are up and running.
exports.registerSocketHandlers = function() {

  io.on('connection', function (socket) {

    function refresh_clients(){
      socket.emit('refresh channels', api.channel.list() );
      socket.broadcast.emit('refresh channels', api.channel.list() );
    }

    console.log('User connected.');

    socket.on('disconnect', function(){
      console.log('User disconnected');
    });

    //Send new user Grid Dimensions.
    socket.emit("grid dimensions", api.grid.dimensions());

    // Sources
    socket.on('list sources', function(){ var result = api.source.list(); socket.emit('refresh sources', result) });
    // socket.on('add remote source', websocket.source.addRemoteSource);

    // Channel
    socket.on('list channels', function(){ 
      var result = api.channel.list(); 
      socket.emit('refresh channels', result) 
    });
    socket.on('create channel', function(channel_name, source_name, source_options){ 
      var result = api.channel.create(channel_name, source_name, source_options); 
      console.log(source_options);
      // console.log(result);
      (!result.error) ? socket.emit('channel created', result) : socket.emit('error', result.error );
      if(result.error) console.log('Error: '+result.error);
      refresh_clients();
    });
    socket.on('update channel', function(channel_id, channel_options) { 
      var result = api.channel.update(channel_id, channel_options); 
      (!result.error) ? socket.emit('channel updated', result ) : socket.emit('error', result.error );
      if(result.error) console.log('Error: '+result.error);
      refresh_clients();
    });
    socket.on('destroy channel', function(channel_id) { 
      var result = api.channel.destroy(channel_id);
      (!result.error) ? socket.emit('channel destroyed', result ) : socket.emit('error', result.error );
      if(result.error) console.log('Error: '+result.error);
      refresh_clients();
    });
    socket.on('get channel', function(channel_id) { 
      var result = api.channel.get(channel_id); 
      return (!result.error) ? socket.emit('channel result', result ) : socket.emit('error', result.error );
    });
    // socket.on('channel:destroyAll'), websocket.channel.destroyAll();

    //Grid
    socket.on('set grid', function(color_grid, mode, strict){ return api.grid.set(color_grid, mode, strict); } );
    socket.on('get grid', function(){ socket.emit("refresh grid", api.grid.get())});
    socket.on('get grid meta', function(){ return api.grid.getMeta(); } );
    socket.on('get xy', function(x, y){ return api.grid.getxy(x, y); });
    socket.on('get grid html', function(){ socket.emit("grid html", api.grid.html()) });
    socket.on('get grid map', function(){ return api.grid.map(); } );
    socket.on('get grid dimensions', function(){ socket.emit("grid dimensions", api.grid.dimensions() ) });

   socket.on("off", function(data) {
      mixer.clear_channels();
      grid.off();
      io.emit("update", grid.toJson());
    });

   refresh_clients();

    // setInterval(function(){
    //   if( mixer.fps.get() > 0) io.sockets.emit("refresh grid", api.grid.get() );
    // }, 5000);

  });

};

// Register http handlers. Called from server.js once http
// server is up and running.
exports.registerHttpHandlers = function(app) {

  // Direct output to ceiling
  app.get('/blastoff', function(request, response){
    grid.set_output_to_ceiling(false);
    var result = {};
    response.jsonp(result);
  });
  app.get('/blaston', function(request, response){
    grid.set_output_to_ceiling(true);
    var result = {};
    response.jsonp(result);
  });

  // Sources
  app.get('/sources', function(request, response){
    var result = api.source.list();
    response.jsonp(result);
  });

  // Channels
  app.get('/mixer/channels', function(request, response){
    console.log("get /mixer/channels");
    var result = api.channel.list();    
    response.jsonp(result);
  });

  app.put('/mixer/channels', function(request, response){ 
    console.log("put /mixer/channels");
  });
          
  app.post('/mixer/channels', function(request, response){ 

    console.log("post /mixer/channels request.body:");
    console.log(request.body);
    console.log(request.params);  

    var channel_name = request.body.name;
    var source_name = request.body.source.name;
    var source_options = request.body.source.options;

    var result = api.channel.create(channel_name, source_name, source_options);
    console.log("creating channel");
    console.log(result);
    if(!result.error)  response.status(201).jsonp(result);
    else response.status(400).jsonp(errorResponse(400, result.error));

  });

  app.get('/mixer/channels/:id', function(request, response){
    var result = api.channel.get(request.params.id);
    if(!result.error) response.status(201).jsonp(result);
    else jsonp(errorResponse(404, result.error));
  });

  app.put('/mixer/channels/:id', function(request, response){
    
    var channel_id = request.params.id;
    var channel_options = request.body;
      
    //console.log("api.js /mixer/channel/:id");
    //console.log(channel_options);
 
    var result = api.channel.update(channel_id, channel_options);

    console.log(result);
      
    if(!result.error) response.sendStatus(204);
    else response.status(404).jsonp(errorResponse(404, result.error));

  });

  app.delete('/mixer/channels/:id', function(request, response){

    var channel_id = request.params.id;
    api.channel.destroy(channel_id);
    response.status(204);

  });

  // Grid
  app.get('/output', function(request, response){

    var result = api.grid.get();
    response.jsonp(result);

  });
  app.get('/output/:x/:y', function(request, response){

    var x = request.params.x;
    var y = request.params.y;
    var result = api.grid.getxy(x, y);
    response.jsonp(result);

  });
  app.put('/output/display', function(request, response){

    var display_toggle = request.params.display;
      
    //console.log("api.js /mixer/channel/:id");
    //console.log(channel_options);
 
    var result = api.output.update(display_toggle);

    console.log(result);
      
    if(!result.error) response.sendStatus(204);
    else response.status(404).jsonp(errorResponse(404, result.error));

  });

};

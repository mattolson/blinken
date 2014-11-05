var Layer = require('./layer');

// This object encapsulates a list of sources and renders them
// on a timer.
function Mixer(grid) {
  this.grid = grid;
  this.layers = [];

  // we keep a sequential id for later operations so deletions don't
  // pose any problems
  this.next_layer_id = 1; 

  this.rendering = false;
  this.timer = null;
}

// Add layer to the mix
Mixer.prototype.add_layer = function(name, source) {
  // Assign a globally sequential id for later operations
  var layer_id = this.next_layer_id;
  this.next_layer_id++;

  // Create a new layer and add it to the list
  var layer = new Layer(layer_id, name, source);
  this.layers.push(layer);
  return layer;
};

// Remove layer from the mix
Mixer.prototype.remove_layer = function(layer_id) {
  var index = this.layer_zindex(layer_id);
  if (index != null) {
    // Remove it
    this.layers.splice(index, 1);

    // If this was the last layer, turn off lights
    if (this.layers.length == 0) {
      this.grid.off();
    }
  }
};

// Find layer based on id
Mixer.prototype.find_layer = function(layer_id) {
  for (var i = 0; i < this.layers.length; i++) {
    if (this.layers[i].id == layer_id) {
      return this.layers[i];
    }
  }
  return null;
};

// Find layer index based on id
Mixer.prototype.layer_zindex = function(layer_id) {
  for (var i = 0; i < this.layers.length; i++) {
    if (this.layers[i].id == layer_id) {
      return i;
    }
  }
  return null;
};

// Remove all layers
Mixer.prototype.clear_layers = function() {
  this.layers = [];
};

// Core mixer routine
Mixer.prototype.run = function() {
  if (this.timer != null) {
    return;
  }

  var mixer = this;
  this.timer = setInterval(function() { 
    if (!mixer.rendering) {
      mixer.render(); 
    }
  }, 1);
};

Mixer.prototype.stop = function() {
  clearInterval(this.timer);
  this.timer = null;
};

// Mixer.prototype.render = function() {
//   // Lock to make sure this doesn't get called again until we're done
//   this.rendering = true;

//   // Loop through layers and have them render themselves
//   var grid_changed = false;
//   for (var i = 0; i < this.layers.length; i++) {
//     var layer_changed = this.layers[i].render();
//     grid_changed = grid_changed || layer_changed;
//   }

//   // Blast updates to strip
//   if (grid_changed) {
//     this.grid.sync();
//   }

//   // Remove lock
//   this.rendering = false;
// };

Mixer.prototype.toJson = function() {
  var json = [];
  for (var i = 0; i < this.layers.length; i++) {
    json.push(this.layers[i].toJson());
  }
  return json;
};


// Attempt at real mixer.
Mixer.prototype.render = function() {
  // Lock to make sure this doesn't get called again until we're done
  this.rendering = true;

  // Loop through layers and have them render themselves
  var grid_changed = false;

  var mixed_pixels = [];

  // if(this.layers[0]) console.log(this.layers[0].source.grid.pixels);

  for (var i = 0; i < this.layers.length; i++) {
    this.layers[i].render();
    if(i == 0) mixed_pixels = this.layers[i].display('array')
    if(i > 0) mixed_pixels = this.blend(this.layers[i].display('array'), mixed_pixels);
  }

  // console.log('mixed pixels');
  // console.log(mixed_pixels)

  this.grid.pixels = mixed_pixels;

  // Blast updates to strip
  // if (grid_changed) {
  this.grid.sync();
  // }

  // Remove lock
  this.rendering = false;
};

//Default: "Average" or "Difference"
Mixer.prototype.blend = function(current, previous){

  var result = [];
  for(var i = 0; i < (2880*3); i++) {
      result[i] = ((current[i] + previous[i]) <= 255) ? current[i] + previous[i] : 255;
  }
  console.log(result);
  return result;
}

// Export constructor directly
module.exports = Mixer;

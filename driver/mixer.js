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

Mixer.prototype.render = function() {
  // Lock to make sure this doesn't get called again until we're done
  this.rendering = true;

  // Loop through layers and have them render themselves
  var grid_changed = false;
  for (var i = 0; i < this.layers.length; i++) {
    var layer_changed = this.layers[i].render();
    grid_changed = grid_changed || layer_changed;
  }

  // Blast updates to strip
  if (grid_changed) {
    this.grid.sync();
  }

  // Remove lock
  this.rendering = false;
};

Mixer.prototype.toJson = function() {
  var json = [];
  for (var i = 0; i < this.layers.length; i++) {
    json.push(this.layers[i].toJson());
  }
  return json;
};

// Export constructor directly
module.exports = Mixer;

//Attempt at real mixer.
// Mixer.prototype.render = function() {
//   // Lock to make sure this doesn't get called again until we're done
//   this.rendering = true;

//   // Loop through layers and have them render themselves
//   var grid_changed = false;

//   var raw_values = new Array(this.layers.length);
//   var processed_values = [];

//   for (var i = 0; i < this.layers.length; i++) {
//     raw_values[i] = this.layers[i].render();
//     // var layer_changed = this.layers[i].render();
//     // grid_changed = grid_changed || layer_changed;
//   }
//   for (var i = 0; i < this.layers.length; i++) {
//     if(i == 0) continue;
//     if(i == 1) processed_values = this.blend(raw_values[i], raw_values[i-1]);
//     if(i > 1) {
//       processed_values = this.blend(raw_values[i], processed_values);
//     }
//   }

//   this.grid.pixels = processed_values;

//   // Blast updates to strip
//   // if (grid_changed) {
//     this.grid.sync();
//   // }

//   // Remove lock
//   this.rendering = false;
// };

// Mixer.prototype.blend = function(current, previous){
//   var result = [];
//   for(var i = 0; i < current.length; i++) {
//       result[i] = (current[i] + previous[i]) / 2;
//   }
//   return result;
// }
var Channel = require('./channel');

// This object encapsulates a list of sources and renders them
// on a timer.
function Mixer(grid) {
  this.grid = grid;
  this.channels = [];

  // we keep a sequential id for later operations so deletions don't
  // pose any problems
  this.next_channel_id = 1; 

  this.rendering = false;
  this.timer = null;
}

// Add channel to the mix
Mixer.prototype.add_channel = function(name, source) {
  // Assign a globally sequential id for later operations
  var channel_id = this.next_channel_id;
  this.next_channel_id++;
  // Create a new channel and add it to the list
  var channel = new Channel(channel_id, name, source);
  this.channels.push(channel);
  return channel;
};

// Remove channel from the mix
Mixer.prototype.remove_channel = function(channel_id) {
  var index = this.channel_zindex(channel_id);
  if (index != null) {
    // Remove it
    this.channels.splice(index, 1);

    // If this was the last channel, turn off lights
    if (this.channels.length == 0) {
      this.grid.off();
    }
  }
};

// Find channel based on id
Mixer.prototype.find_channel = function(channel_id) {
  for (var i = 0; i < this.channels.length; i++) {
    if (this.channels[i].id == channel_id) {
      return this.channels[i];
    }
  }
  return null;
};

// Find channel index based on id
Mixer.prototype.channel_zindex = function(channel_id) {
  for (var i = 0; i < this.channels.length; i++) {
    if (this.channels[i].id == channel_id) {
      return i;
    }
  }
  return null;
};

// Remove all channels
Mixer.prototype.clear_channels = function() {
  this.channels = [];
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

//   // Loop through channels and have them render themselves
//   var grid_changed = false;
//   for (var i = 0; i < this.channels.length; i++) {
//     var channel_changed = this.channels[i].render();
//     grid_changed = grid_changed || channel_changed;
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
  for (var i = 0; i < this.channels.length; i++) {
    json.push(this.channels[i].toJson());
  }
  return json;
};


// Attempt at real mixer.
Mixer.prototype.render = function() {
  // Lock to make sure this doesn't get called again until we're done
  this.rendering = true;

  // Loop through channels and have them render themselves
  var grid_changed = false;

  var mixed_pixels = [];

  // if(this.channels[0]) console.log(this.channels[0].source.grid.pixels);

  for (var i = 0; i < this.channels.length; i++) {
    //Renders a frame.
    this.channels[i].render();
    //Bufferland
    if(i == 0) mixed_pixels = this.channels[i].display('array')
    if(i > 0) mixed_pixels = this.blend(this.channels[i].display('array'), mixed_pixels);

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

Mixer.prototype.filters = function( channels ){

}

//Default: "Average" or "Difference"
Mixer.prototype.blend = function(current, previous){

  var result = [];
  for(var i = 0; i < (2880*3); i++) {
      result[i] = ((current[i] + previous[i]) <= 255) ? current[i] + previous[i] : 255;
  }
  return result;
}

// Export constructor directly
module.exports = Mixer;

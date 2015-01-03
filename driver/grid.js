// The grid object maps the 2D logical space to the 1D physical space
// and handles device operations
var Config = require('./config');

function Grid() {

  this.output_to_ceiling = true;  // direct output to ceiling on or off
    
  this.display = require('./output');
  this.display.setup();
  this.pixel_map = this.display.getMap(); //Meta.

  // Store dimensions for later
  this.num_panels_x = Config.grid.num_panels_x;
  this.num_panels_y = Config.grid.num_panels_y;
  this.num_pixels_per_panel_x = Config.grid.num_pixels_per_panel_x;
  this.num_pixels_per_panel_y = Config.grid.num_pixels_per_panel_y;

  // Figure out overall dimensions
  this.num_pixels_x = this.num_panels_x * this.num_pixels_per_panel_x;
  this.num_pixels_y = this.num_panels_y * this.num_pixels_per_panel_y;
  this.num_pixels = this.num_pixels_x * this.num_pixels_y;

  // Setup data structures for pixels
  // this.pixel_map = new Array(this.num_pixels_x * this.num_pixels_y); // Maps logical index to strand index
  this.pixels = new Buffer(this.num_pixels_x * this.num_pixels_y * 3); // 3 octets per pixel, stores color values

  // Setup list of listeners
  this.listeners = [];

  this.off();

}


Grid.prototype.index = function(x, y) {
  if (x < 0 || y < 0 || x >= this.num_pixels_x || y >= this.num_pixels_y) {
    return null;
  }
  return y * this.num_pixels_x + x;
};

// Used for iteration, if you want to loop through entire grid
// in source order (left to right, top to bottom)
Grid.prototype.xy = function(i) {
  return {
    x: i % this.num_pixels_x,
    y: Math.floor(i / this.num_pixels_x)
  }
};

Grid.prototype.validateGrid = function(color_grid){
  //Validate a color array, notify user/dev if wrong.
  return true;
}

Grid.prototype.set = function(color_grid, mode, strict){
  switch(mode) {

    case "xy":
      for(var x=0; x<this.num_pixels_x; x++){
        for(var y=0; y<this.num_pixels_y; y++) {
          var index = this.index(x,y);
          if(index != null) {
            this.pixels[index*3] = color_grid[x][y][0];
            this.pixels[(index*3)+1] = color_grid[x][y][1];
            this.pixels[(index*3)+2] = color_grid[x][y][2];
          }  
        }
      }
    break;

    case "logical":
    default:
      if(strict) var valid = this.validateGrid(color_grid);
      if(!strict || strict && valid) this.pixels = color_grid;
      // else return { error : "some error?" }
    break;

  }
};

Grid.prototype.setPixelColor = function(x, y, rgb) {
  var index = this.index(x,y);

  if (index == null) {
    return;
  }

  // set pixel data
  this.pixels[index*3] = rgb[0];
  this.pixels[(index*3)+1] = rgb[1];
  this.pixels[(index*3)+2] = rgb[2];
    
};

// Set the color of an entire row
Grid.prototype.setRowColor = function(y, rgb){
	for (var x = 0 ; x < this.num_pixels_x; x++) {
		this.setPixelColor(x, y, rgb);
	}
}

// Set the color of an entire column
Grid.prototype.setColColor = function(x, rgb){
	for (var y = 0; y < this.num_pixels_y; y++) {
		this.setPixelColor(x, y, rgb);
	}
}

// Alias
Grid.prototype.setColumnColor = function(x, rgb) { 
  this.setColColor(x, rgb); 
}

// Set color of entire grid
Grid.prototype.setGridColor = function(rgb) {
  for (var i = 0; i < this.num_pixels; i++) {
    this.pixels[i*3] = rgb[0];
    this.pixels[(i*3)+1] = rgb[1];
    this.pixels[(i*3)+2] = rgb[2];
  }
};

// Retrieve pixel color
Grid.prototype.getPixelColor = function(x, y) {
  var index = this.index(x,y);
  if (index == null) {
    return null;
  }

  return [
    this.pixels[(index*3)], // bugfix by mf
    this.pixels[(index*3)+1], 
    this.pixels[(index*3)+2]
  ]; 
};

// Output color values for entire grid as json
Grid.prototype.toJson = function() {
  var json = [];
  for (var y = 0; y < this.num_pixels_y; y++) {
    for (var x = 0; x < this.num_pixels_x; x++) {
      json.push(this.getPixelColor(x,y));
    }
  }
  return json;
};

// Clear pixel data
Grid.prototype.clear = function() {
  this.pixels.fill(0);
}; 

// A faster way of doing setGridColor([0,0,0])
Grid.prototype.off = function() {
  this.clear();
  this.sync();
};

// Write to device
Grid.prototype.sync = function() {

  if (this.output_to_ceiling == true) {
      // Blast out updates
      if (this.display) {
         this.display.writeLogicalArray(this.pixels);
      }
  }

  // Notify listeners
  for (var i = 0; i < this.listeners.length; i++) {
    this.listeners[i]();
  }
};

Grid.prototype.set_output_to_ceiling = function(on_or_off) {
  // allow direct output to the ceiling to be turned on or off
  this.output_to_ceiling = on_or_off;
  //console.log("output_to_ceiling is", on_or_off);
}


// Support list of sync listeners
Grid.prototype.addListener = function(listener) {
  if (typeof(listener) === 'function') {
    this.listeners.push(listener);
  }
};

// Export constructor directly
module.exports = Grid;

// The grid object maps the 2D logical space to the 1D physical space
// and handles device operations
var Config = require('./config');
//var spi = require('spi');
var spi = 0;

function Grid() {
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
  this.pixel_map = new Array(this.num_pixels_x * this.num_pixels_y); // Maps logical index to strand index
  this.pixels = new Buffer(this.num_pixels_x * this.num_pixels_y * 3); // 3 octets per pixel, stores color values

  // Setup list of listeners
  this.listeners = [];

  // Instantiate pixels. Loop through in logical order, and then
  // calculate the strand index.
  var i, j, k, l, x, y, panel_index, strand_index;
  panel_index = strand_index = x = y = 0;
  for (i = 0; i < this.num_panels_x; i++) {
    for (j = 0; j < this.num_panels_y; j++) {
      for (k = 0; k < this.num_pixels_per_panel_x; k++) {
        for (l = 0; l < this.num_pixels_per_panel_y; l++) {
          // Figure out where we are in the logical grid.
          x = (i * this.num_pixels_per_panel_x) + k;
          y = (j * this.num_pixels_per_panel_y) + l;

          // Figure out where we are in the strand. See the wiring diagrams
          // in the docs folder for details on the wiring layout. We start by
          // figuring out for the given position how many panels came before us.
          panel_index = (i*this.num_panels_y);
          panel_index += (i % 2 == 0) ? Math.floor(y / this.num_pixels_per_panel_y) : Math.floor((this.num_pixels_y - y - 1) / this.num_pixels_per_panel_y);
          strand_index = panel_index * this.num_pixels_per_panel_x * this.num_pixels_per_panel_y;

          // Now just worry about the index within the current panel. Note that the
          // wiring is reversed on odd-numbered columns.
          if (i % 2 == 0) {
            strand_index += (l * this.num_pixels_per_panel_x);
            strand_index += (l % 2 == 1) ? k : (this.num_pixels_per_panel_x - k - 1);
          } else {
            strand_index += ((this.num_pixels_per_panel_y - l - 1) * this.num_pixels_per_panel_x);
            strand_index += (l % 2 == 1) ? k : (this.num_pixels_per_panel_x - k - 1);
          }

          this.pixel_map[(this.num_pixels_x * y) + x] = strand_index;
        }
      }
    }
  }

  // Instantiate SPI device
  if (spi) {
	  this.device = new spi.Spi(Config.device.name, {
		"mode": spi.MODE[Config.device.spi_mode],
		"chipSelect": spi.CS[Config.device.spi_chip_select],
		"maxSpeed": Config.device.max_speed
	  }, function(d) { d.open(); });
	}
  // Clear the display
  this.off();
}

Grid.prototype.getStrandIndex = function(x, y) {
  if (x < 0 || y < 0 || x >= this.num_pixels_x || y >= this.num_pixels_y) {
    return null;
  }

  return this.pixel_map[(y*this.num_pixels_x)+x];
};

// Used for iteration, if you want to loop through entire grid
// in source order (left to right, top to bottom)
Grid.prototype.xy = function(i) {
  return {
    x: i % this.num_pixels_x,
    y: Math.floor(i / this.num_pixels_x)
  }
};

Grid.prototype.setPixelColor = function(x, y, rgb) {
  var index = this.getStrandIndex(x,y);
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
  var index = this.getStrandIndex(x,y);
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
  // Blast out updates
  if (this.device) {
	this.device.write(this.pixels);
  }

  // Notify listeners
  for (var i = 0; i < this.listeners.length; i++) {
    this.listeners[i]();
  }
};

// Support list of sync listeners
Grid.prototype.addListener = function(listener) {
  if (typeof(listener) === 'function') {
    this.listeners.push(listener);
  }
};

// Export constructor directly
module.exports = Grid;

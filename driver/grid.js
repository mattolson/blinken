// The grid object maps the 2D logical space to the 1D physical space
// and handles device operations
var spi = require('spi');

function Grid(device, num_panels_x, num_panels_y, num_pixels_per_panel_x, num_pixels_per_panel_y) {
  // Store dimensions for later
  this.num_panels_x = num_panels_x;
  this.num_panels_y = num_panels_y;
  this.num_pixels_per_panel_x = num_pixels_per_panel_x;
  this.num_pixels_per_panel_y = num_pixels_per_panel_y;

  // Figure out overall dimensions
  this.num_pixels_x = num_panels_x * num_pixels_per_panel_x;
  this.num_pixels_y = num_panels_y * num_pixels_per_panel_y;

  // Setup data structures for pixels
  this.pixel_map = new Array(this.num_pixels_x * this.num_pixels_y); // Maps logical index to strand index
  this.pixels = new Buffer(this.num_pixels_x * this.num_pixels_y * 3); // 3 octets per pixel, stores color values
  this.pixels.fill(0);

  // Instantiate pixels. Loop through in logical order, and then
  // calculate the strand index.
  var i, j, k, l, strand_index, current_x, current_y;
  strand_index = current_x = current_y = 0;
  for (i = 0; i < this.num_panels_x; i++) {
    for (j = 0; j < this.num_panels_y; j++) {
      for (k = 0; k < this.num_pixels_per_panel_x; k++) {
        for (l = 0; l < this.num_pixels_per_panel_y; l++) {
          // Figure out where we are in the logical grid.
          current_x = (i * this.num_pixels_per_panel_x) + k;
          current_y = (j * this.num_pixels_per_panel_y) + l;

          // Figure out where we are in the strand.
          strand_index = (current_y * this.num_pixels_x);
          strand_index += (current_y % 2 == 1) ? current_x : (this.num_pixels_per_panel_x - current_x - 1);
          this.pixel_map[(this.num_pixels_x * current_y) + current_x] = strand_index;
        }
      }
    }
  }

  // Instantiate SPI device
  this.device = new spi.Spi(device, {
    "mode": spi.MODE['MODE_0'],
    "chipSelect": spi.CS['none'],
    "maxSpeed": 1000000
  }, function(d) { d.open(); });

  // Clear the display
  this.off();
}

Grid.prototype.getStrandIndex = function(x, y) {
  if (x < 0 || y < 0 || x >= this.num_pixels_x || y >= this.num_pixels_y) {
    return null;
  }

  return this.pixel_map[(y*this.num_pixels_x)+x];
};

Grid.prototype.setPixelColor = function(x, y, r, g, b) {
  var index = this.getStrandIndex(x,y);
  if (index == null) {
    return;
  }

  // Set pixel data
  this.pixels[index] = r;
  this.pixels[index+1] = g;
  this.pixels[index+2] = b;
};

Grid.prototype.getPixelColor = function(x, y) {
  var index = this.getStrandIndex(x,y);
  if (index == null) {
    return;
  }

  return { 
    r: this.pixels[index], 
    g: this.pixels[index+1], 
    b: this.pixels[index+2] 
  };
};

Grid.prototype.toJson = function() {
  var json = new Array(this.num_pixels_x * this.num_pixels_y);
  for (var y = 0; y < this.num_pixels_y; y++) {
    for (var x = 0; x < this.num_pixels_x; x++) {
      var index = (y*this.num_pixels_x)+x;
      json[index] = this.getPixelColor(x,y);
      json[index]['x'] = x;
      json[index]['y'] = y;
    }
  }
  return json;
};

Grid.prototype.clear = function() {
  this.pixels.fill(0);
};

Grid.prototype.off = function() {
  this.clear();
  this.sync();
};

Grid.prototype.sync = function() {
  this.device.write(this.pixels);
};

// Export public interface
exports.Grid = Grid;

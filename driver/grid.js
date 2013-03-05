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
          strand_index = (current_x * this.num_pixels_y);
          strand_index += (current_x % 2 == 0) ? current_y : (this.num_pixels_per_panel_y - current_y - 1);
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

Grid.prototype.getPixelIndex = function(x, y) {
  if (x >= this.num_pixels_x || y >= this.num_pixels_y) {
    return null;
  }

  return this.pixel_map[(y*this.num_pixels_x)+x];
};

Grid.prototype.setPixelColor = function(x, y, r, g, b) {
  var index = this.getPixelIndex(x,y);
  if (index == null) {
    return;
  }

  // Massage input value
  r = parseInt(r);
  g = parseInt(g);
  b = parseInt(b);
  r = r < 0 ? 0 : (r > 255 ? 255 : r);
  g = g < 0 ? 0 : (g > 255 ? 255 : g);
  b = b < 0 ? 0 : (b > 255 ? 255 : b);

  // Set pixel data
  this.pixels[index] = r;
  this.pixels[index+1] = g;
  this.pixels[index+2] = b;
};

Grid.prototype.getPixelColor = function(x, y) {
  var index = this.getPixelIndex(x,y);
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
  for (var i = 0; i < this.num_pixels_x; i++) {
    for (var j = 0; j < this.num_pixels_y; j++) {
      json[i] = this.getPixelColor(i,j);
      json[i]['x'] = i;
      json[i]['y'] = j;
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

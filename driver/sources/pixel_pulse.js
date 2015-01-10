var path = require('path');
var util = require('util');
var Source = require('../source');

try {
  var Config = require('../config');
} catch(e) {
  var Config = require('../config-default.js');
}

var NAME = path.basename(__filename, '.js'); // Our unique name

// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   colors = [], array of three rgb arrays, used for initiating pulse
function PixelPulse(grid, options)
{
  options = options || {};
  PixelPulse.super_.call(this, NAME, grid, options);

  // For convenience
  this.width = this.grid.num_pixels_x;
  this.height = this.grid.num_pixels_y;

  // Keep track of location of pixels and their colors.
  // Initialize a 2D array of bg colors. Pixel colors will
  // be inserted through options.colors.
  this.pixels = [];
  for (var x = 0; x < this.width; x++) {
    this.pixels[x] = [];
    for (var y = 0; y < this.height; y++) {
      this.pixels[x].push(this.options.bg);
    }
  }
}

// Set up inheritance from Source
util.inherits(PixelPulse, Source);

PixelPulse.prototype.pushPixel = function(x, color) {
  this.pixels[x].unshift(color);
  this.pixels[x].pop();
};

PixelPulse.prototype.step = function() {
  // Check for options color data. We use this to dynamically insert elements
  // into the array.
  for (var x = 0; x < this.width; x++) {
    if (this.options.colors[x] != null) {
      this.pushPixel(x, this.options.colors[x]);
      this.options.colors[x] = null;
    }
    else {
      this.pushPixel(x, this.options.bg);
    }
  }

  // Update grid
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      this.grid.setPixelColor(x, y, this.pixels[x][y]);
    }
  }

  // We changed the grid
  return true;
};

// Return js object containing all params and their types
PixelPulse.options_spec = function() {
  var grid_width = Config.grid.num_pixels_per_panel_x * Config.grid.num_panels_x;
  var default_colors = []
  for (var i = 0; i < grid_width; i++) {
    default_colors.push([0,0,0]);
  }

  return [
    {
      'name': 'colors',
      'type': 'color_array',
      'default': default_colors
    },
    {
      'name': 'bg',
      'type': 'color',
      'default': [0,0,0]
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = PixelPulse;
exports.name = NAME;

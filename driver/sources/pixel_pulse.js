var path = require('path');
var util = require('util');
var Source = require('../source');
var Config = require('../config');

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
  // Initialize a 2D array of nulls. Pixel colors will
  // be inserted through options.colors
  this.pixels = [];
  for (var x = 0; x < this.width; x++) {
    this.pixels[x] = [];
    for (var y = 0; y < this.height; y++) {
      this.pixels[x][y] = null;
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
    if ('color' in this.options && this.options.color[x] != null) {
      this.pushPixel(this.options.color[x]);
      this.options.color[x] = null;
    }
    else {
      this.pushPixel(this.options.bg);
    }
  }

  // Update grid
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      this.grid.setPixelColor(x, y, this.pixels[x][y]);
    }
  }

  // Keep going
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
      'type': 'array',
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

var path = require('path');
var util = require('util');
var Source = require('../source');
var Config = require('./config');

var NAME = path.basename(__filename, '.js'); // Our unique name

// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   colors = [], array of three rgb arrays, used for initiating pulse
function PixelPulse(grid, options)
{
  options = options || {};
  PixelPulse.super_.call(this, NAME, grid, options);

  // For convenience
  this.column_length = this.grid.num_pixels_per_panel_y;

  // Keep track of location of pixels and their colors 
  this.columns = [];
  for(var i = 0; i < this.column_length; i++) {
    this.columns.push({
      'y': 0,
      'color': this.options.colors[i]
    });
  }
}

// Set up inheritance from Source
util.inherits(PixelPulse, Source);

PixelPulse.prototype.step = function() {
  for (var x = 0; x < this.columns.length; x++) {
    var y = this.columns[x].y;

    // Clear previous pixel to bg color
    var previous_y = (y == 0 ? this.column_length : y-1);
    this.grid.setPixelColor(x, previous_y, this.options.bg);

    // Render current pixels
    this.grid.setPixelColor(x, y, this.columns[x].color);

    // Advance y
    this.columns[x].y = (y + 1) % this.column_length;
  }

  // Keep going
  return true;
};

// Return js object containing all params and their types
PixelPulse.options_spec = function() {
  var default_colors = new Array(Config.grid.num_pixels_per_panel_x);
  for (var i = 0; i < Config.grid.num_pixels_per_panel_x; i++) {
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

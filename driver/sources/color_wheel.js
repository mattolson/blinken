var path = require('path');
var util = require('util');
var Source = require('../source');
var color_utils = require('../color_utils');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This source loops through the color wheel continuously, producing
// a rainbow effect cycling through each pixel.
//
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
function ColorWheel(grid, options)
{
  options = options || {};
  ColorWheel.super_.call(this, NAME, grid, options);
  this.current_color = 0;
}

// Set up inheritance from Source
util.inherits(ColorWheel, Source);

ColorWheel.prototype.step = function() {
  for (var i = 0; i < this.grid.num_pixels; i++) {
    var xy = this.grid.xy(i);
    this.grid.setPixelColor(xy.x, xy.y, color_utils.wheel((i + this.current_color) % 256));
  }

  // Update state
  this.current_color++;
  this.current_color = this.current_color % 256;

  // Keep going forever
  return true;
};

// Since we don't have any additional options, copy superclass definition
ColorWheel.options = Source.options;

// Export public interface
exports.constructor = ColorWheel;
exports.name = NAME;

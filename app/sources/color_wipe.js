var path = require('path');
var util = require('util');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This source simply loops through each pixel in sequence and changes its color.
//
// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   color:  [r,g,b], the color to use, defaults to [255,0,0]
function ColorWipe(grid, options)
{
  options = options || {};
  ColorWipe.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
}

// Set up inheritance from Source
util.inherits(ColorWipe, Source);

ColorWipe.prototype.step = function() {
  // Stop animation once we're out of bounds
  if (this.current_pixel >= this.grid.num_pixels) {
    this.deactivate();
    return false;
  }

  // Set color of next pixel in the sequence
  var xy = this.grid.xy(this.current_pixel);
  this.grid.setPixelColor(xy.x, xy.y, this.options.color);

  // Update state
  this.current_pixel++;

  // We changed the grid
  return true;
};

// Return js object containing all params and their types
ColorWipe.options_spec = function() {
  return [
    {
      'name': 'color',
      'type': 'color',
      'default': [255,0,0]
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = ColorWipe;
exports.name = NAME;

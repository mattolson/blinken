var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This effect simply loops through each pixel in sequence and changes its color.
//
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
//   'color':  [r,g,b], the color to use, defaults to [255,0,0]
function ColorWipe(grid, options)
{
  options = options || {};
  ColorWipe.super_.call(this, NAME, grid, options);
  this.color = options['color'] || [255,0,0];
  this.current_pixel = 0;
}

// Set up inheritance from Effect
util.inherits(ColorWipe, Effect);

ColorWipe.prototype.step = function() {
  // Stop animation once we're out of bounds
  if (this.current_pixel >= this.grid.num_pixels) {
    return false;
  }

  // Set color of next pixel in the sequence
  var xy = this.grid.xy(this.current_pixel);
  this.grid.setPixelColor(xy[0], xy[1], this.color);

  // Update state
  this.current_pixel++;

  // Keep going for now
  return true;
};

// Export public interface
exports.constructor = ColorWipe;
exports.name = NAME;

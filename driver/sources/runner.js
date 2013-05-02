var path = require('path');
var util = require('util');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name

// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   color:  [r,g,b], the color to use, defaults to [255,255,255]
function Runner(grid, options)
{
  options = options || {};
  Runner.super_.call(this, NAME, grid, options);
  this.options.color = options.color || [255,255,255];

	this.current_column = 0;
}

// Set up inheritance from Source
util.inherits(Runner, Source);

Runner.prototype.step = function() {
  // Clear from last time
	this.grid.setColColor(this.current_column, [0,0,0]);

	// Update column number
  this.current_column++;
  this.current_column = this.current_column % this.grid.num_pixels_x;

  // Set color
	this.grid.setColColor(this.current_column, this.options.color);

  // Keep going
  return true;
};

// Return js object containing all params and their types
Runner.options_spec = function() {
  return [
    {
      'name': 'color',
      'type': 'color',
      'default': [255,255,255]
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = Runner;
exports.name = NAME;

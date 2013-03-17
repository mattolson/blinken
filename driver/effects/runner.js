var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name
var STEPS; // = this.grid.num_pixels;

var current = {};
		current.x = 0,
		current.y = 0,
		current.rows = 0,
		current.cols = 0;

// This effect simply sets the entire grid to a single color
//
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
//   'color':  [r,g,b], the color to use, defaults to [255,255,255]
function Runner(grid, options)
{
  options = options || {};
  Runner.super_.call(this, NAME, grid, options);
  this.color = options['color'] || [255,255,255];
	STEPS = this.grid.num_pixels;
}

// Set up inheritance from Effect
util.inherits(Runner, Effect);

Runner.prototype.step = function() {
	
	for(i=0;i<this.grid.num_pixels;i++) {
		// Set color of the grid
		this.grid.setGridColor([0,0,0]);

		var xy = this.grid.xy(this.current_step);
		this.grid.setPixelColor(xy.x, xy.y, this.color);
	}
 
	
	// Update step number
  this.current_step++;
  this.current_step = this.current_step % STEPS;

  // We're done!
  return true;
};

// Return js object containing all params and their types
Runner.options = function() {
  return [
    {
      'name': 'color',
      'type': 'color',
      'default': [255,255,255]
    },
		{
      'name': 'period',
      'type': 'integer',
      'default': 1
    }
  ].concat(Effect.options());
}

// Export public interface
exports.constructor = Runner;
exports.name = NAME;

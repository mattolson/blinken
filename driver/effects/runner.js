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
  // this.color = options['color'] || [255,255,255];
  this.color = [255,255,255];
	this.period = 25;
	this.current_step = 1;
	// STEPS = this.grid.num_pixels;
	this.easing_type = options['easing'] || 'easeIn';
  this.easing = Easing(STEPS, this.easing_type, {
    endToEnd: true
  });
	STEPS = this.grid.num_pixels_y;
}

// Set up inheritance from Effect
util.inherits(Runner, Effect);

Runner.prototype.step = function() {
	this.grid.setGridColor([0,0,0]);
	
	this.grid.setColColor(this.current_step, this.color);
	
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

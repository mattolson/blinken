var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name
var STEPS = 18*63;

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
  Static.super_.call(this, NAME, grid, options);
  this.color = options['color'] || [255,255,255];
  this.speed = options['speed'] || 1;
}

// Set up inheritance from Effect
util.inherits(Runner, Effect);

Static.prototype.step = function() {
	
	//Step step step
	if(current.x >= 60) {
		current.x = 0;
		rows++;
	} else { current.x++; }
	if(current.y >= 18){
		current.y=0;
		cols++;
	} else { current.y++ }
	
  // Set color of the grid
	this.grid.setGridColor([0,0,0]);
	this.grid.setPixelColor(current.x, current.y, this.color);
	
	// Update step number
  this.current_step++;
  this.current_step = this.current_step % STEPS;

  // We're done!
  return false;

};

// Return js object containing all params and their types
Static.options = function() {
  return [
    {
      'name': 'color',
      'type': 'color',
      'default': [255,255,255]
    },
		{
      'name': 'speed',
      'type': 'integer',
      'default': 1
    }
  ].concat(Effect.options());
}

// Export public interface
exports.constructor = Static;
exports.name = NAME;

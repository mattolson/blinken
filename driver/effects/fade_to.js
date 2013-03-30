var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This effect simply sets the entire grid to a single color
//
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
//   'color':  [r,g,b], the color to use, defaults to [255,255,255]
function FadeTo(grid, options)
{
  options = options || {};
  FadeTo.super_.call(this, NAME, grid, options);
  this.color = options['color'] || [255,255,255];
	this.number_of_steps = options['number_of_steps'] || 50;
	this.color_math_buffer = []
	this.fade_black_pixels = false;
	this.BLACK = [0,0,0];
}

// Set up inheritance from Effect
util.inherits(FadeTo, Effect);

FadeTo.prototype.step = function() {
	
  // Set color of the grid
	for(var i=0;i<this.grid.num_pixels;i++) {
		//Current Values;
		var xy = this.grid.xy(i);
		var current = this.grid.getPixelColor(xy.x, xy.y);
		var target = this.color;
		var results = [];
		for(var m=0;m<current.length;m++){
			if(!fade_black_pixels && ) continue;
			var diff = current[m] - target[m];
			results.push( Math.round(diff) );
		}
		if (this.current_step = 0 && results.length) this.color_math_buffer = results;
	}
	this.current_step++;
	this.current_step = (this.current_step < this.number_of_steps) ? this.current_step : 0;
  // We're done!
  return false;
};

// Return js object containing all params and their types
FadeTo.options = function() {
  return [
    // {
    //   'name': 'color',
    //   'type': 'color',
    //   'default': [255,255,255]
    // }
  ].concat(Effect.options());
}

// Export public interface
exports.constructor = FadeTo;
exports.name = NAME;

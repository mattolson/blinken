var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This effect simply sets the entire grid to a single color
//
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
//   'color':  [r,g,b], the color to use, defaults to [255,255,255]
function RainbowFace(grid, options)
{
  options = options || {};
  RainbowFace.super_.call(this, NAME, grid, options);
  this.color = options['color'] || [255,255,255];
	this.period = options['period'] || 10;
}

// Set up inheritance from Effect
util.inherits(RainbowFace, Effect);

RainbowFace.prototype.step = function() {
  // Set color of the grid
  for(var i=0;i<this.grid.num_pixels; i++) {
	  var xy = this.grid.xy(i);
		this.grid.setPixelColor(xy.x, xy.y, [Math.random(0,255), Math.random(0,255), Math.random(0,255)]);
	}

  // We're done!
  return true;
};

// Return js object containing all params and their types
RainbowFace.options = function() {
  return [
    {
      'name': 'color',
      'type': 'color',
      'default': [255,255,255]
    }
  ].concat(Effect.options());
}

// Export public interface
exports.constructor = RainbowFace;
exports.name = NAME;

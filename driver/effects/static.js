var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This effect simply sets the entire grid to a single color
//
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
//   'color':  [r,g,b], the color to use, defaults to [255,255,255]
function Static(grid, options)
{
  options = options || {};
  Static.super_.call(this, NAME, grid, options);
  this.color = options['color'] || [255,255,255];
}

// Set up inheritance from Effect
util.inherits(Static, Effect);

Static.prototype.step = function() {
  // Set color of the grid
  this.grid.setGridColor(this.color);

  // We're done!
  return false;
};

// Export public interface
exports.constructor = Static;
exports.name = NAME;

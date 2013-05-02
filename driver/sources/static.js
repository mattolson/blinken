var path = require('path');
var util = require('util');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This source simply sets the entire grid to a single color
//
// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   color = [r,g,b], the color to use, defaults to [255,255,255]
function Static(grid, options)
{
  options = options || {};
  Static.super_.call(this, NAME, grid, options);
  this.options.color = options['color'] || [255,255,255];
}

// Set up inheritance from Source
util.inherits(Static, Source);

Static.prototype.step = function() {
  // Set color of the grid
  this.grid.setGridColor(this.options.color);

  // We're done!
  return false;
};

// Return js object containing all params and their types
Static.options_spec = function() {
  return [
    {
      'name': 'color',
      'type': 'color',
      'default': [255,255,255]
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = Static;
exports.name = NAME;

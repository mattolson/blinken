var util = require('util');
var Easing = require('easing');
var Effect = require('../effect');

var STEPS = 25;

// start_color = [r,g,b], the color to start with
// end_color = [r,g,b], the color to end up with after period*STEPS milliseconds
// options = {}, optional, valid keys: 'easing' => type of easing to perform (defaults to 'linear')
function Throb(grid, period, start_color, end_color, options)
{
  Throb.super_.call(this, grid, period);
  this.start_color = start_color;
  this.end_color = end_color;
  this.current_step = 0;

  options = options || {};
  options['easing'] = ('easing' in options ? options['easing'] : 'linear');

  this.easing = Easing(STEPS, options.easing, {
    endToEnd: true
  });
}

// Set up inheritance from Effect
util.inherits(Throb, Effect);

Throb.prototype.calculate_single = function(start_value, end_value) {
  return start_value + (end_value-start_value) * this.easing[this.current_step];
};

Throb.prototype.calculate_rgb = function() {
  var r = this.calculate_single(this.start_color[0], this.end_color[0]);
  var g = this.calculate_single(this.start_color[1], this.end_color[1]);
  var b = this.calculate_single(this.start_color[2], this.end_color[2]);
  return [r,g,b];
};

Throb.prototype.step = function() {
  // Set entire grid to the new color
  var color = this.calculate_rgb();
  this.grid.setGridColor(color);

  // Update step number
  this.current_step++;
  this.current_step = this.current_step % STEPS;

  // Keep going forever
  return true;
};

// Export constructor directly
module.exports = Throb;

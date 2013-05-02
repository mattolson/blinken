var path = require('path');
var util = require('util');
var Easing = require('easing');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This source uses an easing library to produce a throb effect, alternating
// between two given colors.
//
// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   start_color:  [r,g,b], the color to start with, defaults to [0,0,0]
//   end_color:  [r,g,b], the color to end up with after period*easing_steps milliseconds, defaults to [255,255,255]
//   easing_type: string for type of easing to perform, defaults to 'linear'
//   easing_steps: string for type of easing to perform, defaults to 'linear'
function Throb(grid, options)
{
  options = options || {};
  Throb.super_.call(this, NAME, grid, options);
  this.options.start_color = options.start_color || [0,0,0];
  this.options.end_color = options.end_color || [255,255,255];
  this.options.easing_type = options.easing_type || 'linear';
  this.options.easing_steps = options.easing_steps || 25;

  this.current_step = 0;
  this.easing = Easing(this.options.easing_steps, this.easing_type, {
    endToEnd: true
  });
}

// Set up inheritance from Source
util.inherits(Throb, Source);

Throb.prototype.calculate_single = function(start_value, end_value) {
  return start_value + (end_value-start_value) * this.easing[this.current_step];
};

Throb.prototype.calculate_rgb = function() {
  var r = this.calculate_single(this.options.start_color[0], this.options.end_color[0]);
  var g = this.calculate_single(this.options.start_color[1], this.options.end_color[1]);
  var b = this.calculate_single(this.options.start_color[2], this.options.end_color[2]);
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

// Return js object containing all params and their types
Throb.options_spec = function() {
  return [
    {
      'name': 'start_color',
      'type': 'color',
      'default': [0,0,0]
    },
    {
      'name': 'end_color',
      'type': 'color',
      'default': [255,255,255]
    },
    {
      'name': 'easing_type',
      'type': 'select',
      'default': 'linear',
      'choices': [
        'linear',
        'quadratic',
        'cubic',
        'quartic',
        'quintic',
        'sinusoidal',
        'circular',
        'exponential'
      ]
    },
    {
      'name': 'easing_steps',
      'type': 'integer',
      'default': 25
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = Throb;
exports.name = NAME;

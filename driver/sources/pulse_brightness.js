//Ported from "FAST_SPI LED FX EXAMPLES"
//Designed for ws2801s
// teldredge ### www.funkboxing.com ### teldredge1979@gmail.com
// Ported by Basil Caprese 2013

var path = require('path');
var util = require('util');
var Source = require('../source');
var color_utils = require('../color_utils');

var NAME = path.basename(__filename, '.js'); // Our unique name

// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   hue: integer, the hue to maintain
function PulseLedsBrightness(grid, options)
{
  options = options || {};
  PulseLedsBrightness.super_.call(this, NAME, grid, options);
	this.options.hue = options.hue || 100;
  this.brightness = 0;
  this.bounce_direction = 0;
}

// Set up inheritance from Source
util.inherits(PulseLedsBrightness, Source);

PulseLedsBrightness.prototype.step = function() {
  for (var i = 0; i < this.grid.num_pixels; i++) {
    if (this.bounce_direction == 0) {
      this.brightness++;
      if (this.brightness >= 255) {this.bounce_direction = 1;}
    }

    if (this.bounce_direction == 1) {
      this.brightness--;
      if (this.brightness <= 1) {this.bounce_direction = 0;}         
    }  

    var color = color_utils.hsv_to_rgb(this.options.hue, 255, this.brightness);

    var xy = this.grid.xy(i);
    this.grid.setPixelColor(xy.x, xy.y, color);
  }

  return true;
};

// Return js object containing all params and their types
PulseLedsBrightness.options_spec = function() {
  return [
    {
      'name': 'hue',
      'type': 'integer',
      'default': 100
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = PulseLedsBrightness;
exports.name = NAME;

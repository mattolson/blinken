//Ported from "FAST_SPI LED FX EXAMPLES"
//Designed for ws2801s
// teldredge ### www.funkboxing.com ### teldredge1979@gmail.com
// Ported by Basil Caprese 2013

var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name

var STEPS = 100;

var bouncedirection = 0, 
		idex = 0, 
		idex_offset = 0, 
		ihue = 0, 
		ibright =0, 
		isat = 0, 
		tcount = 0.0, 
		lcount = 0;

function Flicker(grid, options)
{
  options = options || {};
  Flicker.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
  this.wait = options['wait'] || 0;
	this.hue = options['hue'] || 100;
}

// Set up inheritance from Effect
util.inherits(Flicker, Effect);


Flicker.prototype.step = function() {
	var random_bright = Math.random(0,255);
  var random_delay = Math.random(10,100);
  var random_bool = Math.random(0,random_bright);

  if (random_bool < 10) {

    this.color = this.grid.HSVtoRGB(this.hue, this.sat, random_bright);
		
		var xy = this.grid.xy(this.current_pixel);
    this.grid.setPixelColor(xy.x, xy.y, this.color);

  }

//Delay here?
  this.current_pixel++;

  // Keep going for now
  return true;
};

Flicker.options = Effect.options;

// Export public interface
exports.constructor = Flicker;
exports.name = NAME;
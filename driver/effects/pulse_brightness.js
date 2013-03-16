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

function PulseLedsBrightness(grid, options)
{
  options = options || {};
  PulseLedsBrightness.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
  this.period = options['period'] || 1;
	this.hue = options['hue'] ||

}

// Set up inheritance from Effect
util.inherits(PulseLedsBrightness, Effect);

PulseLedsBrightness.prototype.step = function() {
	
	  if (bouncedirection == 0) {
	    ibright++;
	    if (ibright >= 255) {bouncedirection = 1;}
	  }
	
	  if (bouncedirection == 1) {
	    ibright = ibright - 1;
	    if (ibright <= 1) {bouncedirection = 0;}         
	  }  

	  this.color = this.grid.HSVtoRGB(this.hue, 255, ibright);

	  var xy = this.grid.xy(this.current_pixel);
	  this.grid.setPixelColor(xy.x, xy.y, this.color);

		this.current_pixel++;
};

// Export public interface
exports.constructor = PulseLedsBrightness;
exports.name = NAME;
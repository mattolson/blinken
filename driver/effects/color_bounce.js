//Ported from "FAST_SPI LED FX EXAMPLES"
// Designed for ws2801s

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

function ColorBounce(grid, options)
{
  options = options || {};
  ColorBounce.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;

  this.wait = options['wait'] || 0;
	this.color = options['color'] || [255,0,0];
}

// Set up inheritance from Effect
util.inherits(ColorBounce, Effect);

ColorBounce.prototype.step = function() {
	
	if (bouncedirection == 0) {
    idex = idex + 1;
    if (idex == this.grid.num_pixels) {
      bouncedirection = 1;
      idex = idex - 1;
    }
  }
  if (bouncedirection == 1) {
    idex = idex - 1;
    if (idex == 0) {
      bouncedirection = 0;
    }
  }  

	var xy = this.grid.xy(this.current_pixel);
  if (i == idex) 	{ this.grid.setPixelColor(xy.x, xy.y, this.color); }
 	else 						{ this.grid.setPixelColor(xy.x, xy.y, [0, 0, 0]); }
  // delay(idelay); //How do we delay?

  // Update state
  this.current_pixel++;
	// this.current_pixel = this.current_pixel % STEPS;

  // Keep going for now
  return true;

};

// Export public interface
exports.constructor = ColorBounce;
exports.name = NAME;
//Ported from "FAST_SPI LED FX EXAMPLES"
// Designed for ws2801s

var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name

var STEPS;

function ColorBounce(grid, options)
{
  options = options || {};
  ColorBounce.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
	this.color = options['color'] || [255,0,0];
	this.bgColor = options['bgColor'] || [0,0,0];
	
	this.bouncedirection = 0;
	this.idex = 0;
	this.idex_offset = 0;
	this.ihue = 0;
	this.ibright =0;
	this.isat = 0;
	this.tcount = 0.0;
	this.lcount = 0;
	
	STEPS = this.grid.num_pixels/2;
}

// Set up inheritance from Effect
util.inherits(ColorBounce, Effect);

ColorBounce.prototype.step = function() {
	
	for(var i= 0; i < this.grid.num_pixels; i++ ) {
		if (this.bouncedirection == 0) {
	    this.idex++;
	    if (this.idex == this.grid.num_pixels) {
	      this.bouncedirection = 1;
	      this.idex = this.idex - 1;
	    }
	  }
	  if (this.bouncedirection == 1) {
	    this.idex = this.idex - 1;
	    if (this.idex == 0) {
	      this.bouncedirection = 0;
	    }
	  }  

		var xy = this.grid.xy(i);
	  if (i== this.idex) 
	  	{ this.grid.setPixelColor(xy.x, xy.y, this.color); }
	 	else 
			{ this.grid.setPixelColor(xy.x, xy.y, this.bgColor); }
	}
	
  // delay(idelay); //How do we delay?

  // Update state
  // this.current_pixel++;
	this.current_step = this.current_step % this.grid.num_pixels;

  // Keep going for now
  return true;

};

ColorBounce.options = Effect.options;

// ColorBounce.options = function(){
// 	return [
// 		{
// 			
// 		}
// 	].concat( Effect.options() );
// }

// Export public interface
exports.constructor = ColorBounce;
exports.name = NAME;
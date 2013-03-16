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

function PoliceLights(grid, options)
{
  options = options || {};
  PoliceLights.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
  this.wait = options['wait'] || 0;
	this.color = options['color'] || [255,0,0];
}

// Set up inheritance from Effect
util.inherits(PoliceLights, Effect);

PoliceLights.prototype.step = function() {
	//Setup Layout, Orientation and Mapping...
  var idexR = idex;
  var idexB = this.grid.antipodalIndex(idexR);  

  for(var i = 0; i < this.grid.num_pixels; i++ ) {
		var xy = this.grid.xy(i);
    if (i == idexR) {this.grid.setPixelColor(xy.x, xy.y, [255, 0, 0]);}
    else if (i == idexB) {this.grid.setPixelColor(xy.x, xy.y, [0, 0, 255]);}    
    else {this.grid.setPixelColor(xy.x, xy.y, [0, 0, 0]);}
  }

//Delay here?

  this.current_pixel++;

  // Keep going for now
  return true;
};

// Export public interface
exports.constructor = PoliceLights;
exports.name = NAME;
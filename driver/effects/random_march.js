// Ported from "FAST_SPI LED FX EXAMPLES"
// by teldredge ### www.funkboxing.com ### teldredge1979@gmail.com
// Ported to Node.js by Sean Mitchell 2013

var path = require('path');
var util = require('util');
var Effect = require('../effect');

var NAME = path.basename(__filename, '.js'); // Our unique name

var STEPS = 100;

var bouncedirection = 0, 
		idex = 0, 
		idex_offset = 0, 
		ihue = 0, 
		isat =0, 
		isat = 0, 
		tcount = 0.0, 
		lcount = 0,
		LEDS = [];

function RandomMarch(grid, options)
{
  options = options || {};
  RandomMarch.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
  this.period = options['period'] || 1;
}

// Set up inheritance from Effect
util.inherits(RandomMarch, Effect);

RandomMarch.prototype.step = function() {
		copy_led_array();
		
	  var iCCW;
	  this.color = this.grid.HSVtoRGB(Math.random(0,360), 255, 255);
	
	  LEDS[0].r = this.color[0];
	  LEDS[0].g = this[1];
	  LEDS[0].b = this[2];

    iCCW = this.grid.adjacentCCW(i);
    LEDS[i].r = ledsX[iCCW][0];
    LEDS[i].g = ledsX[iCCW][1];
    LEDS[i].b = ledsX[iCCW][2];    

};

// Export public interface
exports.constructor = RandomMarch;
exports.name = NAME;
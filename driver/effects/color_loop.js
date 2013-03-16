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

function SingleLedColorLoop(grid, options)
{
  options = options || {};
  SingleLedColorLoop.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
  this.wait = options['wait'] || 0;
	this.color = options['color'] || [255,0,0];
}

// Set up inheritance from Effect
util.inherits(SingleLedColorLoop, Effect);

SingleLedColorLoop.prototype.step = function() {
  idex++;
  if (idex > NUM_LEDS) {idex = 0;}

  this.color = this.grid.HSVtoRGB(0, 255, 255);

  var di = abs(TOP_INDEX - idex); //-DISTANCE TO CENTER    
  var t = constrain((10/di)*10, 10, 500); //-DELAY INCREASE AS INDEX APPROACHES CENTER (WITHIN LIMITS)

  for(var i = 0; i < NUM_LEDS; i++ ) {
    if (i == idex) { /* do nothing?*/ }
    else {
      this.color = [0,0,0];
    }
  }

	this.current_pixel++;
  // FastSPI_LED.show();
  // delay(t);
	return this;
};

// Export public interface
exports.constructor = SingleLedColorLoop;
exports.name = NAME;
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
		lcount = 0;

function LightBulb(grid, options)
{
  options = options || {};
  LightBulb.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
  this.temp = options['temp'] || "Direct Sun";
	this.color = [];
}

// Set up inheritance from Effect
util.inherits(LightBulb, Effect);

LightBulb.prototype.step = function() {
	/*if(this.temp == "Candle") {*/ 
	this.color = [255,147,41]
	
	this.temp =  "HIGH NOON SKY";
	/*}*/
	if(this.temp == "-40W TUNG") { this.color = [255,197,143] }
	if(this.temp == "-100W TUNG") { this.color = [255,214,170] }
	if(this.temp == "HALOGEN") { this.color = [255,241,224] }
	if(this.temp == "CARBON ARC") { this.color = [255,250,244] }
	if(this.temp == "HIGH NOON SKY") { this.color = [255,255,251] }
	if(this.temp == "DIRECT SUN") { this.color = [255,255,255] }
	if(this.temp == "OVERCAST SKY") { this.color = [201,226,255] }
	if(this.temp == "CLEAR BLUE SKY") { this.color = [64,156,255] }
	
	for(var i = 0; i < this.grid.num_pixels; i++ ) {
		var xy = this.grid.xy(i);
		this.grid.setPixelColor(xy.x, xy.y, this.color);
  }

	this.current_step++;

	// return false; //we're done here, unless you like random bugs.
	return true;
};

// Return js object containing all params and their types
LightBulb.options = function() {
  return [
    {
      'name': 'temp',
      'type': 'select',
      'default': ["CLEAR BLUE SKY"],
			//Options as in <select><option></option></select>
			'options' : [
				"Candle",
				"-40W TUNG",
				"-100W TUNG",
				"HALOGEN",
				"CARBON ARC",
				"HIGH NOON SKY",
				"DIRECT SUN",
				"OVERCAST SKY",
				"CLEAR BLUE SKY",
			]
    }
  ].concat(Effect.options());
}

// Export public interface
exports.constructor = LightBulb;
exports.name = NAME;
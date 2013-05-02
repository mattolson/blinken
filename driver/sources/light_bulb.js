/*
	Source.Generator.LightBulb
	@author teldredge ### www.funkboxing.com ### teldredge1979@gmail.com
	@author basil caprese [basilcaprese.com]
	@description Creates colors that attempt to match/mimmick light sensor readings off of various lights.
	@param options (object)
		 		 options.temp (string) enum values provided in controller's response
*/

var path = require('path');
var util = require('util');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name

function LightBulb(grid, options)
{
  options = options || {};
  LightBulb.super_.call(this, NAME, grid, options);

  this.options.temp = options.temp || "CLEAR BLUE SKY";
}

// Set up inheritance from Source
util.inherits(LightBulb, Source);

LightBulb.prototype.getColor = function(temp) {
	if (temp == "CANDLE") { return [255,147,41] }
	if (temp == "-40W TUNG") { return [255,197,143] }
	if (temp == "-100W TUNG") { return [255,214,170] }
	if (temp == "HALOGEN") { return [255,241,224] }
	if (temp == "CARBON ARC") { return [255,250,244] }
	if (temp == "HIGH NOON SKY") { return [255,255,251] }
	if (temp == "DIRECT SUN") { return [255,255,255] }
	if (temp == "OVERCAST SKY") { return [201,226,255] }
	if (temp == "CLEAR BLUE SKY") { return [64,156,255] }
};

LightBulb.prototype.step = function() {
  // Update grid
  this.grid.setGridColor(this.getColor(this.options.temp));

  // We're done here
	return false;
};

// Return js object containing all params and their types
LightBulb.options_spec = function() {
  return [
    {
      'name': 'temp',
      'type': 'select',
      'default': "CLEAR BLUE SKY",
			'choices': [
				"CANDLE",
				"-40W TUNG",
				"-100W TUNG",
				"HALOGEN",
				"CARBON ARC",
				"HIGH NOON SKY",
				"DIRECT SUN",
				"OVERCAST SKY",
				"CLEAR BLUE SKY"
			]
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = LightBulb;
exports.name = NAME;

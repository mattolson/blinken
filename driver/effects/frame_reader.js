//Creates a buffer stream from incomming pixel data.
//Works as a getter/setter as well. 

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

function FrameReader(grid, options)
{
  options = options || {};
  FrameReader.super_.call(this, NAME, grid, options);
  this.current_pixel = 0;
  this.period = 1;
	this.frame = options['frame'];
	
	this.frames = [];
	this.rate = 1;
	this.beginBuffer = new Date();

}

// Set up inheritance from Effect
util.inherits(FrameReader, Effect);

FrameReader.prototype.step = function() {

		this.frames.push(this.frame)
		
		for(i=0;i<this.grid.num_pixels;i++){
			var xy = this.grid.xy(i);
		  // this.grid.setPixelColor(xy.x, xy.y, this.frames[0][i].color);
			this.current_pixel++;
		}
		
		this.frames.splice(0, 1);
		
	    // delay(this.wait);
	
		return true;

		
};

FrameReader.options = Effect.options;

// Export public interface
exports.constructor = FrameReader;
exports.name = NAME;
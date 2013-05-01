var path = require('path');
var util = require('util');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name

// NEW!
//   int total=this->grid->getTotal();
//   int r; 
//   int i;
//   int pixel; 
// 
// //Set all pixels to bg
// for(i=0; i < this->grid->getTotal(); i++ ) {
//   //Set color
//   this->grid->q(i, bg);
// }
// delay(wait);
// //  update Lights
// this->grid->show();
// 
// //Pick at random x number of times (x = density)
// for( r=0; r < density; r++ )  {
//   //Pick pixel
//  pixel = random(1,total);
//  this->grid->q(pixel, color);
// }
// //Update lights
// this->grid->show();
// 
// delay(sustain);

function Sparkle(grid, options)
{
  options = options || {};
  Sparkle.super_.call(this, NAME, grid, options);
  this.current_step = 0;

  this.color = options['color'] || [255,255,255];
	// this.density = options['density'] || Math.floor(this.grid.num_pixels*0.1); //30% of the pixels.
	this.period = options['period'] || 100; 
	this.sustain = options['sustain'] || 0;
	this.bg = options['bg'] || [0,0,0];
	
	this.mode = options['mode'] || 'random';
	
}

// Set up inheritance from Source
util.inherits(Sparkle, Source);

Sparkle.prototype.step = function() {

	// Set background to BG;
	this.grid.setGridColor(this.bg);
	
	if(this.mode == 'random') {
		var r,g,b;
		
		r = Math.floor(Math.random()*255); g = Math.floor(Math.random()*255); b = Math.floor(Math.random()*255);
		this.color = [r,g,b];
		this.period = Math.floor(Math.random()*50);
		this.density = Math.floor(this.grid.num_pixels*Math.random());
		
	}
	
	// var xy;
	for(var i=0;i < this.density;i++) {
		var rand = Math.floor( Math.random()*this.grid.num_pixels );
		var xy = this.grid.xy( rand );	
		this.grid.setPixelColor(xy.x, xy.y, this.color);
	}

  // Update state
  this.current_step++;

  return true;
};

Sparkle.options = Source.options;

// Export public interface
exports.constructor = Sparkle;
exports.name = NAME;

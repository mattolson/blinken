var path = require('path');
var util = require('util');
var Effect = require('../effect');

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
  this.current_pixel = 0;

  this.color = options['color'] || [255,0,0];
	this.density = options['density'] || 1;
	this.wait = options['wait'] || 0;
	this.sustain = options['sustain'] || 0;
	this.bg = options['bg'] || [0,0,0];
}

// Set up inheritance from Effect
util.inherits(Sparkle, Effect);

Sparkle.prototype.step = function() {
	// Set background to BG;
	if(this.current_pixel == 0) { this.grid.setGridColor(this.bg); }
	
  // Stop animation once we're out of bounds
  if (this.current_pixel >= this.grid.num_pixels) {
    return false;
  }
	
	var xy = this.grid.xy( Math.random(0, this.grid.num_pixels) );
	this.grid.setPixelColor(xy.x, xy.y, this.color);

  // Update state
  this.current_pixel++;

  // Keep going for now
  return true;
};

Sparkle.options = Effect.options;

// Export public interface
exports.constructor = Sparkle;
exports.name = NAME;
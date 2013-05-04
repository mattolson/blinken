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
}

// Set up inheritance from Source
util.inherits(Sparkle, Source);

Sparkle.prototype.step = function() {
	// Set background color
	this.grid.setGridColor(this.options.bg);
	
	if (this.options.mode == 'crazy') {
    // Choose a random color
		var r,g,b;
		r = Math.floor(Math.random()*255); g = Math.floor(Math.random()*255); b = Math.floor(Math.random()*255);
		this.options.color = [r,g,b];

    // Choose a random period
		this.options.period = Math.floor(Math.random()*50);

    // Choose a random density
		this.options.density = Math.floor(this.grid.num_pixels*Math.random());
	}

  if (this.options.mode == 'random_color') {
    // Choose a random color
		var r,g,b;
		r = Math.floor(Math.random()*255); g = Math.floor(Math.random()*255); b = Math.floor(Math.random()*255);
		this.options.color = [r,g,b];
  }
	
  // Modify a certain number of pixels based on density
	for (var i = 0; i < this.options.density; i++) {
    // Choose a random pixel
		var rand = Math.floor(Math.random()*this.grid.num_pixels);
		var xy = this.grid.xy(rand);	

    // Set its color
		this.grid.setPixelColor(xy.x, xy.y, this.options.color);
	}

  // We changed the grid
  return true;
};

// Return js object containing all params and their types
Sparkle.options_spec = function() {
  return [
    {
      'name': 'color',
      'type': 'color',
      'default': [255,255,255]
    },
    {
      'name': 'sustain',
      'type': 'integer',
      'default': 0
    },
    {
      'name': 'density',
      'type': 'integer',
      'default': 10
    },
    {
      'name': 'bg',
      'type': 'color',
      'default': [0,0,0]
    },
    {
      'name': 'mode',
      'type': 'select',
      'default': 'density',
      'choices': ['density', 'random_color', 'crazy']
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = Sparkle;
exports.name = NAME;

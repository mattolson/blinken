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
}

// Set up inheritance from Source
util.inherits(Sparkle, Source);

Sparkle.prototype.step = function() {
	// Set background to BG;
	this.grid.setGridColor(this.options.bg);
	
	if(this.options.mode == 'random') {
		var r,g,b;
		
		r = Math.floor(Math.random()*255); g = Math.floor(Math.random()*255); b = Math.floor(Math.random()*255);
		this.options.color = [r,g,b];
		this.options.period = Math.floor(Math.random()*50);
		this.options.density = Math.floor(this.grid.num_pixels*Math.random());
	}
	
	for(var i=0;i < this.options.density;i++) {
		var rand = Math.floor( Math.random()*this.grid.num_pixels );
		var xy = this.grid.xy( rand );	
		this.grid.setPixelColor(xy.x, xy.y, this.options.color);
	}

  // Update state
  this.current_step++;

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
      'name': 'bg',
      'type': 'color',
      'default': [0,0,0]
    },
    {
      'name': 'mode',
      'type': 'select',
      'default': 'random',
      'choices': ['random']
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = Sparkle;
exports.name = NAME;

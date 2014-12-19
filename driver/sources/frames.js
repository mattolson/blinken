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

function Frames(grid, options)
{
  this.options = options || {};
  Frames.super_.call(this, NAME, grid, options);
}

// Set up inheritance from Source
util.inherits(Frames, Source);

Frames.prototype.step = function() {
  // Set background color

  // console.log(this.options.frame);

  if(this.options.frame || this.options.frame) return;
  
  for (var i = 0; i < this.grid.num_pixels; i++) {
    var xy = this.grid.xy(i);
    var frame = this.options.frame;
    this.grid.setPixelColor(xy.x, xy.y, [ frame[i*3], frame[i*3+1], frame[i*3+2] ]);
  }
  return true;
};

// Return js object containing all params and their types
Frames.options_spec = function() {
  return [
    {
      'name': 'frame',
      'type': 'color_array',
      'default': []
    }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = Frames;
exports.name = NAME;

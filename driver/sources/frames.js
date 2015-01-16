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
  //console.log("frames.js constructor options");
  //console.log(this.options);
  Frames.super_.call(this, NAME, grid, options);
}

// Set up inheritance from Source
util.inherits(Frames, Source);

Frames.prototype.step = function() {
  // Set background color
    
  if(!this.options.frame) return;
  
  var frame = this.options.frame;
  //console.log("frames.js step");
  //console.log(frame); 
    
  for (var i = 0; i < this.grid.num_pixels; i++) {
    var xy = this.grid.xy(i);
    if(xy.x < frame.length) {
      if(xy.y < frame[xy.x].length) {
        this.grid.setPixelColor(xy.x, xy.y, [ frame[xy.x][xy.y][0], frame[xy.x][xy.y][1], frame[xy.x][xy.y][2] ]);
      }
    }
    //if(frame[i*3] != 0) {
    //    console.log(frame[i*3]);
    //}
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

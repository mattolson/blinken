var path = require('path');
var util = require('util');
var Source = require('../source');
var color_utils = require('../color_utils');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This source simply sets the entire grid to a single color
//
// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
//   color:  [r,g,b], the color to use, defaults to [255,255,255]
//   random_color: boolean, whether to choose a random color   
function FadeTo(grid, options)
{
  options = options || {};
  FadeTo.super_.call(this, NAME, grid, options);

  if (this.options.random_color) {
    this.options.color = color_utils.random_color();
  }

  // console.log('Step '+this.current_step);
  this.number_of_steps = 100;
  this.fade_all_pixels = true;
  this.black_rgb = [0,0,0];
  this.target_grid = [];
  this.current_step = 0;
  this.period = 1;
  // this.grid.setGridColor([255,255,255])
  // buffers ... this.directions = 'p' || 'm' (plus or minus)
}

// Set up inheritance from Source
util.inherits(FadeTo, Source);

FadeTo.prototype.step = function() {

  // console.log('Step '+this.current_step);

  // Set color of the grid
  for(var i=0;i<this.grid.num_pixels;i++) {

    //Current Values;
    var xy = this.grid.xy(i); //Duh
    var current = this.grid.getPixelColor(xy.x, xy.y) ;
    // console.log(current);
    var target = this.options.color; //Where we are going.
    var diffs = [], 
        diff_total = [], 
        step_size = [], 
        directions = [], 
        changeTo = [];

    var is_black = (current.toString() == this.black_rgb.toString());

    for(var m=0;m<current.length;m++){
      var diff;
      //This might seem illogical, but it the p or m system allows for step based algortihm flexibility.
      directions.push( current[m] < target[m] ? 'p' : 'm' );
      diffs.push( diff = (directions[m] == 'p') ? target[m] - current[m] : current[m] - target[m] );	 //Plus or minus, avoiding too much from the Math function (already optimized from using negatives which requires special flags in certain cases)
      // diffs[m] = Math.round( this.fade_all_pixels !== true && is_black) ? 0 : diffs[m]; //If it's black and we want to keep them that way, set to zero, otherwise calculate present difference.
      step_size.push( Math.round(diffs[m] / this.number_of_steps) ); // Calculate the step size for r,g,b
      changeTo[m] = (directions[m] == 'p') ? current[m] + (step_size[m] * (this.current_step+1)) : current[m] - (step_size[m] * (this.current_step+1));  // Calculate the increase or descrease

      // console.log(directions[m] + ' - ' + diffs[m] + ' - ' + step_size[m] + ' - ' + changeTo[m]  );
    }

    this.grid.setPixelColor( xy.x, xy.y, changeTo );
    //Taylor Davis wins.

    //Save a buffer so we remember whre we started (will be helpful for dynamic easing)
    // if (this.current_step == 0 && diffs.length) this.diff_total = diffs; //This is a color array.

  }
  this.current_step++;

  if (this.current_step >= this.number_of_steps) {
    this.current_step = 0; 
    if(this.options.random_color) this.options.color = color_utils.random_color();
  }

  // We changed the grid
  return true;
};

// Return js object containing all params and their types
FadeTo.options_spec = function() {
  result = [
  {
    'name': 'color',
    'type': 'color',
    'default': [255,255,255]
  },
  {
    'name': 'random_color',
    'type': 'boolean',
    'default': true
  }
  ].concat(Source.options_spec());

  return result;
}

// Export public interface
exports.constructor = FadeTo;
exports.name = NAME;

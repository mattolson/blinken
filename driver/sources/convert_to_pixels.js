var path = require('path');
var util = require('util');
var Source = require('../source');
var output = require('../output');
var getPixels = require("get-pixels");

var NAME = path.basename(__filename, '.js'); // Our unique name

function ConvertToPixels(grid, options)
{
  this.options = options || {};
  this.buffer = new Array(),
  this.images = new Array(),
  this.filename, this.curImage,
  this.animateCnt = 0,
  this.imageIx = 0,
  this.imgYOff = 47;

  ConvertToPixels.super_.call(this, NAME, grid, options);
}

// Set up inheritance from Source
util.inherits(ConvertToPixels, Source);

ConvertToPixels.prototype.step = function() {

  if(this.options.refresh) this.refresh();

  this.animateCnt;
  
  if( this.curImage === undefined ) {
    if( this.images.length >= 1 ) {
      this.curImage = this.images.shift();
    } else {
      return;
    }
  }
  
  if( this.curImage === undefined ){
    return;
  }
  
  // look to see if this is an animated image and if so then loop it 
  var dimensions = this.curImage.shape.slice();
  
  if( dimensions.length === 4 ) {
    // this is an animated GIF
    
    if( this.imageIx < dimensions[0] ) {
      var image = this.curImage.pick(imageIx, null, null, null);
      this.grid.device.writeImage(image);
      this.imageIx++;
    }

    if( imageIx >= dimensions[0] ){
      this.curImage = undefined;
      this.imageIx = 0;
    }
  }
  else {
    if( this.imgYOff < 0 ) {
      this.curImage = undefined;
      this.imgYOff = 47;
    } else {
      this.grid.device.writeImageWithOffset(this.curImage, 0, 0, 0, this.imgYOff--, 0, 0);
    }
  }
  return true;
  
};

ConvertToPixels.prototype.refresh = function(){
  getPixels(this.options.refresh, this.read);
  this.options.refresh = false;
}

ConvertToPixels.prototype.read = function(err, pixels){
  var y;
  
  if(err)
  {
    console.log("Bad image path " + filename);
    return;
  }
  else
  {
    images.push(pixels);
  }
}

// Return js object containing all params and their types
ConvertToPixels.options_spec = function() {
  return [
    {
      'name': 'Local_Image_Path',
      'type': 'string',
      'default': './source/convert_to_pixels/default.png'
     },
     {
      'name': 'Remote_Image_Path',
      'type': 'string',
      'default': 'http://localhost:1337/source/convert_to_pixels/default.png'
     },
     {
      'name': 'Upload_Local_File',
      'type': 'file',
      'default': ''
     },
     {
      'name': 'Refresh',
      'type': 'string',
      'default': ''
     }
  ].concat(Source.options_spec());
}

// Export public interface
exports.constructor = ConvertToPixels;
exports.name = NAME;
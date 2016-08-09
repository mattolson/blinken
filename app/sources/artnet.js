var path = require('path');
var util = require('util');
var Source = require('../source');
var ArtNet = require('../lib/artnet-server');

var NAME = path.basename(__filename, '.js'); // Our unique name

var NUM_LINES_PER_UNI = 2;

var _ArtnetSelf;

function ArtnetCb(retData, peer){
//	console.log('this ' + this + 'artnet Data ' + JSON.stringify(retData) + ' peer ' + JSON.stringify(peer));
	//console.log('_ArtnetSelf ' + JSON.stringify(_ArtnetSelf));
	
	// the universe tells us what Y we are starting at
	// copy one line of data, then the next as we have 2 lines of data per Artnet packet.

	if( retData.universe < 1 || retData.universe > 24 ){
		return;
	}
	// the universe tells us what Y we are starting at
	// copy one line of data, then the next as we have 2 lines of data per Artnet packet.

	var y = (retData.universe - 1) * NUM_LINES_PER_UNI;
	//console.log('y ' + y + ' universe ' + retData.universe);

//	console.log("Artnet buf " + JSON.stringify(_ArtnetSelf.buf));
	
	for( var i = 0 ; i < 2 ; i++, y++){
		for(var x = 0; x < _ArtnetSelf.grid.num_pixels_x ; x++) {
			var index = (i * _ArtnetSelf.grid.num_pixels_x * 3) + (x * 3);
			_ArtnetSelf.buf[x][y][0] = retData.data[index++];
			_ArtnetSelf.buf[x][y][1] = retData.data[index++];
			_ArtnetSelf.buf[x][y][2] = retData.data[index];
		}
	}
}

function Artnet(grid, options)
{
	if( _ArtnetSelf !== undefined ){
		console.log('There can be only one!!'); 
		console.log(' Artnet server source.');
		return;
	}
  this.options = options || {};
  this.grid = grid;
  //console.log("artnet.js constructor options");
  //console.log(this.options.port);
  Artnet.super_.call(this, NAME, grid, options);
  console.log("Options " + JSON.stringify(this.options));
  this.buf = new Array(grid.num_pixels_x);
  for(var i = 0 ; i < this.buf.length; i++){
	  var temp = new Array(grid.num_pixels_y);
	  this.buf[i] = temp;
	  for(var j = 0 ; j < temp.length ; j++){
		  this.buf[i][j] = [0, 0, 0];  // RGB == black
	  }
  }
//  console.log("ArtNet " + JSON.stringify(ArtNet));
  this.server = ArtNet.listen("6454", ArtnetCb);
  // this is really bad form but I cannot figure out how to get the listen callback to get this
  
  _ArtnetSelf = this;
}

// Set up inheritance from Source
util.inherits(Artnet, Source);

Artnet.prototype.step = function() {
	// this is a pretty simple step. We just update the grid with the buffer we keep that gets filled in by the
	// Artnet packets.
	
	this.grid.set(this.buf, "xy", false);
    return true;
};

// Return js object containing all params and their types
Artnet.options_spec = function() {
  return [
    {
      'name': 'artnet',
      'port': '6454'
    }
  ].concat(Source.options_spec());
};

// Export public interface
exports.constructor = Artnet;
exports.name = NAME;

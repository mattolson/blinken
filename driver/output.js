/* jshint bitwise:false */

var artnet = require('./lib/artnet-client');
//var config = require('./config');

var WIDTH_PIXELS = 60;
var HEIGHT_PIXELS = 48;

var UNIS_PER_FULL_LINE = 2;
var LINES_PER_UNI = 3;
var PIXELS_PER_UNI = 90;

var uniData = [];  // empty array holds arrays of data
var hosts = []; // empty array holds artnet client
var ledMap;
var callbacks = []; // empty array holds callbacks for ticks, drives animation

function LedCeilingCallback()
{
	var index;
	refresh();
}

// util.inherits(LEDCieling, Display);

function LedMap(len)
{
	var x;
	var y;
	var rightSide = 0;
	var uni;
	var led;

	if(len !== (WIDTH_PIXELS * HEIGHT_PIXELS))
	{
		return;
	}

	var ledMap = []; // create an empty array
	
    // for each line

	for( y = 0; y < HEIGHT_PIXELS; y++ )
	{
		// for each pixel

		for( x = 0; x < WIDTH_PIXELS; x++ )
		{
			var offset;

			// IFL ceiling map is made up of 8 identical controllers  mapped
			// one below the other each with 4 universes of 90 pixels each
			// the universes start in the middle of the Y and go out left and
			// right from there. Also we need to weave our way up and down
			// for how the panels are wired.

			// first pick the universe in the controller

			// divide y by 3 lines per universe times 2 for number of unis to
			// create a full line

			uni = UNIS_PER_FULL_LINE * Math.floor(y / LINES_PER_UNI);

			// we really need to see if we are in the left or right universe

			if( x >= Math.floor(WIDTH_PIXELS / 2) )
			{
				// we are in the second uni for this line

				uni++;
				rightSide = 1;
			}
			else
			{
				rightSide = 0;
			}

			// so now we know we side we are working on we can figure out
			// which LED we are in the IFL universes

			if( rightSide === 0 )
			{
				// we start from the middle LED as 0 and go up as we go left so
				// we need how many pixels we are from center.

				offset = (Math.floor(WIDTH_PIXELS / 2) - 1) - x;

				switch( y % LINES_PER_UNI )
				{
					// this seems complicated but we start with x=0/led=0
					// then x=1/led=5, x=2/led=6, x=3/led=11 this is because
					// of the wiring of the leds. Each case is different

					case 0:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 2 : 3);
					break;
					case 1:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 1 : 4);
					break;
					case 2:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 0 : 5);
					break;
					default:
					// not possible
					break;
				}
			}
			else
			{
				// we start from the middle LED as 0 and go up as we go right

				offset = x - Math.floor(WIDTH_PIXELS / 2);

				switch( y % LINES_PER_UNI )
				{
					// this seems complicated but we start with x=0/led=2
					// then x=1/led=3, x=2/led=8, x=3/led=9 this is because
					// of the wiring of the leds. Each case is different

					case 0:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 0 : 5);
					break;
					case 1:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 1 : 4);
					break;
					case 2:
					led = Math.floor(offset/2) * 6 + (((offset % 2) === 0) ? 2 : 3);
					break;
					default:
					// not possible
					break;
				}
			}

			// we now have the universe and the led within the universe
			// we save them off into an array so that we can map a simple
			// X/Y grid into our leds and have it display  correctly

			var leds = {
				'uni': uni,
				'led': led * 3, // we have an array of red, green, blue ...
			};
			
			ledMap.push(leds);
		}
	}

	// we have a full map of pixel to uni/led we can hand this info back

	return ledMap;
}

exports.getMap = function(){
	return new LedMap(WIDTH_PIXELS * HEIGHT_PIXELS);
}

var width = exports.width = function(){
	return WIDTH_PIXELS;
};

var height = exports.height = function(){
	return HEIGHT_PIXELS;
};

var refresh = exports.refresh = function refresh()
{
	var uni;
	var host;
	
	for( uni = 0 ; uni < 4 ; uni++ )
	{
		for( host = 0 ; host < 8 ; host++ )
		{
			hosts[(host * 4) + uni].send(uniData[(host * 4) + uni]);
		}
	}
};

exports.setup = function()
{
	var host;
	
	// setup the led map now 
	
	// this.map = new LedMap(WIDTH_PIXELS * HEIGHT_PIXELS);
	ledMap = new LedMap(WIDTH_PIXELS * HEIGHT_PIXELS);
	
	// this is the order of hosts and universes for Idea Fab Labs ceiling
	for(host = 107 ; host >= 100 ; host--)
	{
		hosts.push(artnet.createClient("192.168.1."+host, 6454, 4));
		uniData.push(new Array(PIXELS_PER_UNI*3));
		hosts.push(artnet.createClient("192.168.1."+host, 6454, 1));
		uniData.push(new Array(PIXELS_PER_UNI*3));
		hosts.push(artnet.createClient("192.168.1."+host, 6454, 3));
		uniData.push(new Array(PIXELS_PER_UNI*3));
		hosts.push(artnet.createClient("192.168.1."+host, 6454, 2));
		uniData.push(new Array(PIXELS_PER_UNI*3));
	}
	refresh();

	// console.log(hosts);
	// console.log(this.map);
};

exports.setPixel = function(x, y, color)
{
	if( (x > WIDTH_PIXELS) || (y > HEIGHT_PIXELS) )
	{
		return; // there is nothing to do
	}

	var index = (y * WIDTH_PIXELS) + x;
	uniData[ledMap[index].uni][ledMap[index].led] = (color >> 16) & 0xff;
	uniData[ledMap[index].uni][ledMap[index].led + 1] = (color >> 8) & 0xff;
	uniData[ledMap[index].uni][ledMap[index].led + 2] = color & 0xff;
};

// This takes an ndarray which we expect was gotten or is in the format of get-pixels.

exports.writeImage = function(image)
{
	// get the image dimensions
	
	var dimensions = image.shape.slice();
	
	if(dimensions.length !== 3)
	{
		console.log("We can't handle images of " + dimensions.length + " dimensions");
		return;
	}
	
	// since this is a simple image 
	// find out which is larger, the image or our display
	
	var myHeight = Math.min(dimensions[0], HEIGHT_PIXELS);
	var myWidth = Math.min(dimensions[1], WIDTH_PIXELS);
	
	// for now just start at the top left corner and set pixels

	var y, x, z;
	
	for(y = 0 ; y < myHeight ; y++)
	{
		for(x = 0 ; x < myWidth ; x++)
		{
			var index = (y * WIDTH_PIXELS) + x;
			
//			console.log("x/y " + x + "/" + y + " ");

			for(z = 0 ; z < 3 ; z++)
			{
				uniData[ledMap[index].uni][ledMap[index].led + z] = image.get(y, x, z);
//				console.log(z + "[" + image.get(y, x, z) + "] ");
			}
		}
	}
};

exports.relay = function(){

}

exports.writeImageWithOffset = function(image,imgXOff,imgYOff,imgW,imgH,disX,disY)
{
	var pixW, pixH;
	
	// get the image dimensions
	
	var dimensions = image.shape.slice();
	
	if(dimensions.length !== 3)
	{
		// try something
		console.log("What the fuck");
		var temp = image.pick(0,null,null,null);
		var temp2 = image.pick(1,null,null,null);
		var temp3 = image.pick(2,null,null,null);
		
		console.log("temp = " + temp.shape.slice());
		console.log("temp2 = " + temp2.shape.slice());
		console.log("temp3 = " + temp3.shape.slice());
		
		console.log("We can't handle images of " + dimensions.length + " dimensions");
		return;
	}

	if( dimensions[1] < imgXOff )
	{
		console.log("The X offset is greater then the image width");
		return;
	}

	if( (dimensions[1] - imgXOff) < imgW)
	{
		console.log("The X offset " + imgXOff + " + imgW " + imgW + " is greater then the actual image width " + dimensions[1]);
		return;
	}

	if( dimensions[0] < imgYOff )
	{
		console.log("The Y offset is greater then the image width");
		return;
	}
	if( (dimensions[0] - imgYOff) < imgH)
	{
		console.log("The Y offset " + imgYOff + " + imgH " + imgH + " is greater then the actual image height " + dimensions[0]);
		return;
	}

	// we need to figure out which is bigger image piece or display
	
	if( imgW === 0 )
	{
		// the caller didn't specify so try the whole image width
		// minus the offset
		
		pixW = dimensions[1] - imgXOff;
	}
	else
	{
		// start with the min of the image or the passed in value
		
		pixW = Math.min(dimensions[1] - imgXOff, imgW);
	}
	
	if( imgH === 0 )
	{
		// the caller didn't specify so try the whole image height
		// minus the offset
		
		pixH = dimensions[0] - imgYOff;
	}
	else
	{
		// start with the min of the image or the passed in value
		
		pixH = Math.min(dimensions[0] - imgYOff, imgH);
	}

	// which is smaller the display or the piece of image?
	
	var myHeight = Math.min(pixH, HEIGHT_PIXELS);
	var myWidth = Math.min(pixW, WIDTH_PIXELS);
	
	// for now just start at the top left corner and set pixels

	var y, x, z;
	
	for(y = 0 ; y < myHeight ; y++)
	{
		for(x = 0 ; x < myWidth ; x++)
		{
			var index = ((y + disY) * WIDTH_PIXELS) + (x + disX);
			
//			console.log("x/y " + x + "/" + y + " ");

			for(z = 0 ; z < 3 ; z++)
			{
				uniData[ledMap[index].uni][ledMap[index].led + z] = image.get(y + imgYOff, x + imgXOff, z);
//				console.log(z + "[" + image.get(y, x, z) + "] ");
			}
		}
	}
};

exports.writeArray = function(data)
{
	// since this is a simple image 
	// find out which is larger, the image or our display
	var myHeight = Math.min(height, HEIGHT_PIXELS);
	var myWidth = Math.min(width, WIDTH_PIXELS);

	// for now just start at the top left corner and set pixels
	var y, x;
	
	for(y = 0 ; y < myHeight ; y++)
	{
		for(x = 0 ; x < myWidth ; x++)
		{
			var index = (y * WIDTH_PIXELS) + x;
			
//			console.log("x/y " + x + "/" + y + " ");

			// we need to get the single color value 
			
			var color = data[y * width + x];
			
			uniData[ledMap[index].uni][ledMap[index].led] = (color >> 16) & 0xff;
			uniData[ledMap[index].uni][ledMap[index].led + 1] = (color >> 8) & 0xff;
			uniData[ledMap[index].uni][ledMap[index].led + 2] = color & 0xff;
		}
	}
	
	refresh();
	
};


exports.writeLogicalArray = function(data)
{
	// since this is a simple image 
	// find out which is larger, the image or our display
	var myHeight = HEIGHT_PIXELS;
	var myWidth = WIDTH_PIXELS;

	// for now just start at the top left corner and set pixels
	var y, x;
	
	for(y = 0 ; y < myHeight ; y++)
	{
		for(x = 0 ; x < myWidth ; x++)
		{
			var index = (y * myWidth) + x;
			var index2 = ((y * myWidth) + x) * 3;
			
			uniData[ledMap[index].uni][ledMap[index].led] = data[index2];
			uniData[ledMap[index].uni][ledMap[index].led+1] = data[index2+1];
			uniData[ledMap[index].uni][ledMap[index].led+2] = data[index2+2];
		}
	}
	
	refresh();

	//console.log("Artnet write");
	//console.log(data);
	
};
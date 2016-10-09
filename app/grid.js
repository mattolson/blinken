// The grid object maps the 2D logical space to the 1D physical space
// and handles device operations

var fonts = require("./lib/fonts");

function Grid(config) {

  this.output_to_ceiling = true;  // direct output to ceiling on or off
    
  this.display = require('./output');
  this.display.setup();
  this.pixel_map = this.display.getMap(); //Meta.

  // Store dimensions for later
  this.num_panels_x = config.grid.num_panels_x;
  this.num_panels_y = config.grid.num_panels_y;
  this.num_pixels_per_panel_x = config.grid.num_pixels_per_panel_x;
  this.num_pixels_per_panel_y = config.grid.num_pixels_per_panel_y;

  // Figure out overall dimensions
  this.num_pixels_x = this.num_panels_x * this.num_pixels_per_panel_x;
  this.num_pixels_y = this.num_panels_y * this.num_pixels_per_panel_y;
  this.num_pixels = this.num_pixels_x * this.num_pixels_y;

  // Setup data structures for pixels
  // this.pixel_map = new Array(this.num_pixels_x * this.num_pixels_y); // Maps logical index to strand index
  this.pixels = new Buffer(this.num_pixels * 3); // 3 octets per pixel, stores color values

  this.listeners = [];  // list of listeners
  this.off();
  
  // setup the cursor
  
  this.cursor = { x: 0, y: 0 };
  this.foreColor = [0x0, 0x80, 0x0]; // green
  this.setFontType('f5x7');
}


Grid.prototype.index = function(x, y) {
  if (x < 0 || y < 0 || x >= this.num_pixels_x || y >= this.num_pixels_y) {
    return null;
  }
  return y * this.num_pixels_x + x;
};

// Used for iteration, if you want to loop through entire grid
// in source order (left to right, top to bottom)
Grid.prototype.xy = function(i) {
  return {
    x: i % this.num_pixels_x,
    y: Math.floor(i / this.num_pixels_x)
  };
};

Grid.prototype.validateGrid = function(color_grid){
  //Validate a color array, notify user/dev if wrong.
  return true;
};

function setMultiArray(grid, color_grid)
{
	for(var x=0; x<grid.num_pixels_x; x++){
		for(var y=0; y<grid.num_pixels_y; y++) {
			var index = grid.index(x,y);
			if((index !== null) && (x < color_grid.length) && (y < color_grid[x].length) ) {
				grid.pixels[index*3] = color_grid[x][y][0];
				grid.pixels[(index*3)+1] = color_grid[x][y][1];
				grid.pixels[(index*3)+2] = color_grid[x][y][2];
			}  
		}
	}
}

// this all assumes that the color_grid is the same size as the grid in pixels
function setImageData(grid, color_grid){
	for(var x=0; x<grid.num_pixels_x; x++){
		for(var y=0; y<grid.num_pixels_y; y++) {
			var index = grid.index(x,y);
			if((index !== null) && ((index * 4) < color_grid.length)) {
				grid.pixels[index*3] = color_grid[index * 4];
				grid.pixels[(index*3)+1] = color_grid[(index * 4) + 1];
				grid.pixels[(index*3)+2] = color_grid[(index * 4) + 2];				
			}
		}
	}
}

Grid.prototype.set = function(color_grid, mode, strict){
  switch(mode) {

    case "xy":
    	if(Array.isArray(color_grid)){
    		if(Array.isArray(color_grid[0])){
    			setMultiArray(this, color_grid);
    		}
    	}
    	else if(color_grid.constructor.name === "ImageData"){
    		setImageData(this, color_grid.data);
    	}
    break;

    case "logical":
    default:
    	var valid ;
    
    	if(strict) {
    		valid = this.validateGrid(color_grid);
    	}
    	if(!strict || strict && valid) {
    		this.pixels = color_grid;
    	}
    	// else return { error : "some error?" }
    break;
  }
};

Grid.prototype.setPixelColor = function(x, y, rgb) {
  var index = this.index(x,y);

  if (index === null) {
    return;
  }

  // set pixel data
  this.pixels[index*3] = rgb[0];
  this.pixels[(index*3)+1] = rgb[1];
  this.pixels[(index*3)+2] = rgb[2];
    
};

// Set the color of an entire row
Grid.prototype.setRowColor = function(y, rgb){
	for (var x = 0 ; x < this.num_pixels_x; x++) {
		this.setPixelColor(x, y, rgb);
	}
};

// Set the color of an entire column
Grid.prototype.setColColor = function(x, rgb){
	for (var y = 0; y < this.num_pixels_y; y++) {
		this.setPixelColor(x, y, rgb);
	}
};

// Alias
Grid.prototype.setColumnColor = function(x, rgb) { 
  this.setColColor(x, rgb); 
};

// Set color of entire grid
Grid.prototype.setGridColor = function(rgb) {
  for (var i = 0; i < this.num_pixels; i++) {
    this.pixels[i*3] = rgb[0];
    this.pixels[(i*3)+1] = rgb[1];
    this.pixels[(i*3)+2] = rgb[2];
  }
};

// Retrieve pixel color
Grid.prototype.getPixelColor = function(x, y) {
  var index = this.index(x,y);
  if (index === null) {
    return null;
  }

  return [
    this.pixels[(index*3)], // bugfix by mf
    this.pixels[(index*3)+1], 
    this.pixels[(index*3)+2]
  ]; 
};

// Output color values for entire grid as json
Grid.prototype.toJson = function() {
  var json = [];
  for (var y = 0; y < this.num_pixels_y; y++) {
    for (var x = 0; x < this.num_pixels_x; x++) {
      json.push(this.getPixelColor(x,y));
    }
  }
  return json;
};

// Clear pixel data
Grid.prototype.clear = function() {
  this.pixels.fill(0);
}; 

// A faster way of doing setGridColor([0,0,0])
Grid.prototype.off = function() {
  this.clear();
  this.sync();
};

// Write to device
Grid.prototype.sync = function() {

  if (this.output_to_ceiling === true) {
      // Blast out updates
      if (this.display) {
         this.display.writeLogicalArray(this.pixels);
      }
  }

  // Notify listeners
  for (var i = 0; i < this.listeners.length; i++) {
    this.listeners[i]();
  }
};

Grid.prototype.set_output_to_ceiling = function(on_or_off) {
  // allow direct output to the ceiling to be turned on or off
  this.output_to_ceiling = on_or_off;
  //console.log("output_to_ceiling is", on_or_off);
};


// Support list of sync listeners
Grid.prototype.addListener = function(listener) {
  if (typeof(listener) === 'function') {
    this.listeners.push(listener);
  }
};

// Export constructor directly
module.exports = Grid;


Grid.prototype.write = function(c) {
	if (c === '\n')	{
		this.cursor.y += this.fontHeight;
		this.cursor.x  = 0;
	}
	else if (c === '\r') {
		return;
	}
	else {
		this.drawChar(this.cursor.x, this.cursor.y, c.charCodeAt(0));
		this.cursor.x += this.fontWidth+1;
		if ((this.cursor.x > (this.num_pixels_x - this.fontWidth))) {
			this.cursor.y += this.fontHeight;
			this.cursor.x = 0;
		}
	}
};

Grid.prototype.print = function(c)
{
	var str;
	
	if (typeof(c) !== "string") {
		str = c.toString();
	} else {
		str = c;
	}

	for (var i=0; i < str.length; i++)
	{
		this.write(str[i]);
	}	
};

/** \brief Set cursor position.

	cursor position to x,y.
*/
Grid.prototype.setCursor = function(x, y)
{
	this.cursor.x = x;
	this.cursor.y = y;
};

/** \brief Draw pixel.

    Draw pixel using the current fore color and current draw mode in the screen buffer's x,y position.
*/
Grid.prototype.pixel = function(x, y)
{
	this.setPixelColor(x, y, this.foreColor);
};

/** \brief Draw line.

    Draw line using current fore color and current draw mode from x0,y0 to x1,y1 of the screen buffer.
*/
Grid.prototype.line = function(x0, y0, x1, y1)
{
	var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
	var temp;

	if (steep)
	{
		temp = x0;
		x0 = y0;
		y0 = temp;
		
		temp = x1;
		x1 = y1;
		y1 = temp;
	}

	if (x0 > x1)
	{
		temp = x0;
		x0 = x1;
		x1 = temp;
		
		temp = y0;
		y0 = y1;
		y1 = temp;
	}

	var dx, dy;
	dx = x1 - x0;
	dy = Math.abs(y1 - y0);

	var err = dx / 2;
	var ystep;

	if (y0 < y1)
	{
		ystep = 1;
	}
	else
	{
		ystep = -1;
	}

	x0 = Math.round(x0);
	x1 = Math.round(x1);
	y0 = Math.round(y0);
	y1 = Math.round(y1);
	dx = Math.round(dx);
	dy = Math.round(dy);

	for (; x0 < x1; x0++)
	{
		if (steep)
		{
			this.pixel(y0, x0);
		} else
		{
			this.pixel(x0, y0);
		}
		err -= dy;
		if (err < 0)
		{
			y0 += ystep;
			err += dx;
		}
	}
};

/** \brief Draw horizontal line.

    Draw horizontal line using current fore color and current draw mode from x,y to x+width,y of the screen buffer.
*/
Grid.prototype.lineH = function(x, y, width)
{
	this.line(x,y,x+width,y);
};

/** \brief Draw vertical line.

    Draw vertical line using current fore color and current draw mode from x,y to x,y+height of the screen buffer.
*/
Grid.prototype.lineV = function(x, y, height)
{
	this.line(x,y,x,y+height);
};

/** \brief Draw rectangle.

    Draw rectangle using current fore color and current draw mode from x,y to x+width,y+height of the screen buffer.
*/
Grid.prototype.rect = function(x, y, width, height)
{
	var tempHeight;

	this.lineH(x,y, width);
	this.lineH(x,y+height-1, width);

	tempHeight=height-2;

	// skip drawing vertical lines to avoid overlapping of pixel that will
	// affect XOR plot if no pixel in between horizontal lines
	if (tempHeight<1) {
		return;
	}

	this.lineV(x,y+1, tempHeight);
	this.lineV(x+width-1, y+1, tempHeight);
};
	
/** \brief Draw filled rectangle.

    Draw filled rectangle using current fore color and current draw mode from x,y to x+width,y+height of the screen buffer.
*/
Grid.prototype.rectFill = function(x, y, width, height)
{
	for (var i = x; i < x+width ; i++)
	{
		this.lineV(i,y, height);
	}
};

/** \brief Draw circle.

    Draw circle with radius using current fore color and current draw mode at x,y of the screen buffer.
*/
Grid.prototype.circle = function(x0, y0, radius)
{
	radius = Math.round(radius);
	var f = 1 - radius;
	var ddF_x = 1;
	var ddF_y = -2 * radius;
	var x = 0;
	var y = radius;


	this.pixel(x0, y0+radius);
	this.pixel(x0, y0-radius);
	this.pixel(x0+radius, y0);
	this.pixel(x0-radius, y0);

	while (x<y)
	{
		if (f >= 0)
		{
			y--;
			ddF_y += 2;
			f += ddF_y;
		}
		x++;
		ddF_x += 2;
		f += ddF_x;

		this.pixel(x0 + x, y0 + y);
		this.pixel(x0 - x, y0 + y);
		this.pixel(x0 + x, y0 - y);
		this.pixel(x0 - x, y0 - y);

		this.pixel(x0 + y, y0 + x);
		this.pixel(x0 - y, y0 + x);
		this.pixel(x0 + y, y0 - x);
		this.pixel(x0 - y, y0 - x);
	}
};

/** \brief Draw filled circle.

    Draw filled circle with radius using current fore color and current draw mode at x,y of the screen buffer.
*/
Grid.prototype.circleFill = function(x0, y0, radius)
{
	var f = 1 - radius;
	var ddF_x = 1;
	var ddF_y = -2 * radius;
	var x = 0;
	var y = radius;

	for (var i=y0-radius; i<=y0+radius; i++)
	{
		this.pixel(x0, i);
	}

	while (x<y)
	{
		if (f >= 0)
		{
			y--;
			ddF_y += 2;
			f += ddF_y;
		}
		x++;
		ddF_x += 2;
		f += ddF_x;

		for (i=y0-y; i<=y0+y; i++)
		{
			this.pixel(x0+x, i);
			this.pixel(x0-x, i);
		}
		for (i=y0-x; i<=y0+x; i++)
		{
			this.pixel(x0+y, i);
			this.pixel(x0-y, i);
		}
	}
};

/** \brief Get font width.

    The cucrrent font's width return as unsigned char.
*/	
Grid.prototype.getFontWidth = function() {
	return this.fontWidth;
};

/** \brief Get font height.

    The current font's height return as unsigned char.
*/
Grid.prototype.getFontHeight = function() {
	return this.fontHeight;
};

/** \brief Get font starting character.

    Return the starting ASCII character of the currnet font, not all fonts start with ASCII character 0. Custom fonts can start from any ASCII character.
*/
Grid.prototype.getFontStartChar = function() {
	return this.fontStartChar;
};

/** \brief Get font total characters.

    Return the total characters of the current font.
*/
Grid.prototype.getFontTotalChar = function() {
	return this.fontTotalChar;
};

/** \brief Get total fonts.

    Return the total number of fonts loaded into the edOLED's flash memory.
*/
Grid.prototype.getTotalFonts = function() {
	return fonts.keys.length;
};

/** \brief Get font type.

    Return the font type number of the current font.
*/
Grid.prototype.getFontType = function() {
	return this.fontType;
};

/** \brief Set font type.

    Set the current font type number, ie changing to different fonts base on the type provided.
*/
Grid.prototype.setFontType = function(type) {
    if (fonts.fonts.hasOwnProperty(type)) {
        this.font = fonts.fonts[type];
        this.fontWidth = this.font[0];
        this.fontHeight = this.font[1];
        this.fontStartChar = this.font[2];
        this.fontTotalChar =  this.font[3];
        this.fontMapWidth = (this.font[4] * 100) + this.font[5]; // two unsigned chars values into integer 16
    }
};

/** \brief Set color.

    Set the current draw's color. Only WHITE and BLACK available.
*/
Grid.prototype.setColor = function(color) {
	this.foreColor=color;
};


/** \brief Draw character.

    Draw character c using current color and current draw mode at x,y.
*/
Grid.prototype.drawChar = function(x, y, c)
{
	var rowsToDraw;
	var row;
	var tempC;
	var i;
	var j;
	var temp;
	var charPerBitmapRow;
	var charColPositionOnBitmap;
	var charRowPositionOnBitmap;
	var charBitmapStartPosition;

	if ((c < this.fontStartChar) || (c > (this.fontStartChar + this.fontTotalChar - 1)))		// no bitmap for the required c
	return;

	tempC = c - this.fontStartChar;

	// each row (in datasheet is call page) is 8 bits high, 16 bit high character will have 2 rows to be drawn
	rowsToDraw = this.fontHeight / 8;	// 8 is LCD's page size, see SSD1306 datasheet
	
	if (rowsToDraw<=1) rowsToDraw=1;

	// the following draw function can draw anywhere on the screen, but SLOW pixel by pixel draw
	if (rowsToDraw == 1)
	{
		for  (i = 0; i < this.fontWidth + 1 ; i++)
		{
			if (i == this.fontWidth) // this is done in a weird way because for 5x7 font, there is no margin, this code add a margin after col 5
				temp = 0;
			else
				temp = this.font[fonts.fonts.FONTHEADERSIZE + (tempC * this.fontWidth) + i];

			for (j = 0; j < 8; j++)
			{			// 8 is the LCD's page height (see datasheet for explanation)
				if (temp & 0x1)
				{
					this.setPixelColor(x+i, y+j, this.foreColor);
				}
				else
				{
					this.setPixelColor(x+i, y+j, [0,0,0]);
				}
				
				temp >>= 1;
			}
		}
		return;
	}

	// font height over 8 bit
	// take character "0" ASCII 48 as example

	var charPerBitmapRow = this.fontMapWidth / this.fontWidth;  // 256/8 =32 char per row
    var charColPositionOnBitmap = tempC % charPerBitmapRow;  // =16
	var charRowPositionOnBitmap = int(tempC / charPerBitmapRow); // =1
	var charBitmapStartPosition = (charRowPositionOnBitmap * this.fontMapWidth * (this.fontHeight/8)) + (charColPositionOnBitmap * this.fontWidth) ;

	// each row on LCD is 8 bit height (see datasheet for explanation)
	for(row = 0; row < rowsToDraw; row++)
	{
		for (i=0; i < fontWidth; i++)
		{
			temp = this.font[FONTHEADERSIZE + (charBitmapStartPosition + i + (row * this.fontMapWidth))];

			for (j=0;j<8;j++)
			{			// 8 is the LCD's page height (see datasheet for explanation)
				if (temp & 0x1)
				{
					this.setPixelColor(x+i,y+j+(row*8), this.foreColor);
				}
				else
				{
					this.setPixelColor()(x+i,y+j+(row*8), [0, 0, 0]);
				}
				temp >>= 1;
			}
		}
	}
};

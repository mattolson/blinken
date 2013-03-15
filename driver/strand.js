// This is a direct interface to the strand, bypassing the grid for testing purposes
// Follows the same method signatures as Grid for the most part so it can be used from
// handlers.js
var spi = require('spi');

function Strand(device, num_pixels) {
  this.num_pixels = num_pixels;
  this.pixels = new Buffer(this.num_pixels*3); // 3 octets per pixel, stores color values

  // Instantiate SPI device
  this.device = new spi.Spi(device, {
    "mode": spi.MODE['MODE_0'],
    "chipSelect": spi.CS['none'],
    "maxSpeed": 1000000
  }, function(d) { d.open(); });

  this.off();
}

Strand.prototype.setPixelColor = function(index, rgb) {
  if (index >= this.num_pixels) {
    return null;
  }

  // set pixel data
  this.pixels[index*3] = rgb[0];
  this.pixels[(index*3)+1] = rgb[1];
  this.pixels[(index*3)+2] = rgb[2];
};

Strand.prototype.setStrandColor = function(rgb) {
  for (var i = 0; i < this.num_pixels; i++) {
    this.pixels[i*3] = rgb[0];
    this.pixels[(i*3)+1] = rgb[1];
    this.pixels[(i*3)+2] = rgb[2];
  }
};

Strand.prototype.getPixelColor = function(index) {
  if (index >= this.num_pixels) {
    return null;
  }

  return [
    this.pixels[index], 
    this.pixels[(index*3)+1], 
    this.pixels[(index*3)+2]
  ]; 
};

Strand.prototype.toJson = function() {
  var json = new Array(this.num_pixels);
  for (var i = 0; i < this.num_pixels; i++) {
    var led = {};
    led['index'] = i;
    led['rgb'] = this.getPixelColor(i);
    if (led['rgb'] != null) {
      json[i] = led;
    }
  }
  return json;
};

Strand.prototype.clear = function() {
  this.pixels.fill(0);
};

Strand.prototype.off = function() {
  this.clear();
  this.sync();
};

Strand.prototype.sync = function() {
  // Blast out updates
  this.device.write(this.pixels);
};

// Export constructor directly
module.exports = Strand;

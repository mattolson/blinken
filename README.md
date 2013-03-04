# Blinken

We are working with strands of [Adafruit WS2801 LED pixels](https://www.adafruit.com/products/322), configured in a grid installed
on ceiling tiles. For more information on basic wiring and led function, see [Adafruit's tutorial](http://learn.adafruit.com/12mm-led-pixels/).

We're using a [node.js v0.8.21](https://github.com/joyent/node) server on a [Raspberry PI Model B](http://www.raspberrypi.org/) with a 
[breakout kit](http://adafruit.com/products/914) to drive the array.

### Requirements

To get the Raspberry PI ready:

* Download and flash the [Occidentalis v0.2](http://learn.adafruit.com/adafruit-raspberry-pi-educational-linux-distro/occidentalis-v0-dot-2) distribution
to an SD card. See [this page](http://elinux.org/RPi_Easy_SD_Card_Setup) for more details on flashing the OS.
* Download and compile node.js from source. Sadly, the binary distribution in the Raspbian repository did not work for us. Follow 
[this guide](https://gist.github.com/3301813) but use the latest version of node. Compiling node on a 700Mhz ARM chip takes a long time, so grab a beer.

### Installation

* Clone this repository: `git clone git://github.com/mattolson/blinken.git`
* Build/install node modules: `cd driver && npm install`
* Start server: `sudo node index.js`
* [Visit server in browser](http://ip_of_rpi:8888/)

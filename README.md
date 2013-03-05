# Blinken

We are working with strands of [Adafruit WS2801 LED pixels](https://www.adafruit.com/products/322), configured in a grid installed
on ceiling tiles. For more information on basic wiring and led function, see [Adafruit's tutorial](http://learn.adafruit.com/12mm-led-pixels/).

We're using a [NodeJS v0.8.21](https://github.com/joyent/node) server on a [Raspberry PI Model B](http://www.raspberrypi.org/) with a 
[breakout kit](http://adafruit.com/products/914) to drive the array.

### Requirements

To get the Raspberry PI ready:

* Download and flash the [Occidentalis v0.2](http://learn.adafruit.com/adafruit-raspberry-pi-educational-linux-distro/occidentalis-v0-dot-2) distribution
to an SD card. See [this page](http://elinux.org/RPi_Easy_SD_Card_Setup) for more details on flashing the OS.
* Download and compile node.js from source. Sadly, the binary distribution in the Raspbian repository did not work for us. Follow 
[this guide](https://gist.github.com/3301813) but use the latest version of node. Compiling node on a 700Mhz ARM chip takes a long time, so grab a beer.
* Wire up your lights [like so](http://learn.adafruit.com/light-painting-with-raspberry-pi/hardware).

### Installation

* Clone this repository: `git clone git://github.com/mattolson/blinken.git`
* Build/install node modules: `cd driver && npm install`
* Start server: `sudo node index.js`
* Open Chrome and visit [http://ip_of_rpi:8888/](http://ip_of_rpi:8888/)

### Thanks

Big thanks go to [Alexander Weber](https://github.com/tinkerlog) for writing [node-pixel](https://github.com/tinkerlog/node-pixel), upon which 
some of this project is based, and [Russell Hay](https://github.com/RussTheAerialist) for writing [node-spi](https://github.com/RussTheAerialist/node-spi),
a NodeJS interface to the SPI bus.

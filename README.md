# Blinken

We are working with strands of [Adafruit WS2801 LED pixels](https://www.adafruit.com/products/322), configured in a grid installed
on ceiling tiles. For more information on basic wiring and led function, see their [tutorial](http://learn.adafruit.com/12mm-led-pixels/).

We're using a [node.js v0.8.18](http://nodejs.org/) server on a [Raspberry PI Model B](http://www.raspberrypi.org/) to drive the array.

### Requirements

To get the Raspberry PI ready:

* Download and flash the [Occidentalis v0.2](http://learn.adafruit.com/adafruit-raspberry-pi-educational-linux-distro/occidentalis-v0-dot-2) distribution
to an SD card. See [this page](http://elinux.org/RPi_Easy_SD_Card_Setup) for more details on flashing the OS.
* Download and compile node.js from source. Sadly, the binary distribution in the Raspbian repository did not work for us. Follow [this guide](https://gist.github.com/3301813) but use the latest version of node. Compiling node on a 700Mhz ARM chip takes a long time, so grab a beer.


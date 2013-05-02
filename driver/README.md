# blinken-driver

This is a low level API for setting and getting the state of the LED array. For wiring details of our ceiling project, check out
[the wiring diagram](https://github.com/mattolson/blinken/blob/master/docs/panel_wiring.png). To adapt this project for your 
purposes (i.e. use a different physical layout), you'll need to change the Grid constructor.

### Sources

* GET /sources returns list of known sources

### Layers

* GET /layers returns list of layers currently defined
* POST /layers adds a layer to the stack
* GET /layers/:id returns info about a particular layer (:id is the id assigned by the system)
* PUT /layers/:id updates the layer with a new source and/or options
* DELETE /layers/:id removes the layer from the stack

### Grid

* GET /grid returns the current color state of the array
* GET /grid/:x/:y returns the current color state of a particular pixel


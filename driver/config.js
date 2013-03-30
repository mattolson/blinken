//This theoretically sets the also theoretical mapping class to a different mapping mode.
UNITS = true,

PIXELS_PER_UNIT_ROW = '3',
PIXELS_PER_UNIT_COL = '6';
PIXELS_PER_UNIT = PIXELS_PER_UNIT_ROW * PIXELS_PER_UNIT_COL;

UNITS_PER_GRID_ROW = '10';
UNITS_PER_GRID_ROW = '6';

// These are the projected values;
// UNITS_PER_GRID_ROW = '17';
// UNITS_PER_GRID_COL = '10'

//These are theoretical defitions to allow for this to be compatible with the open source, ie, unopinionated and scalable. 
//Sole purpose? API between LEDs and User, based on Node.js, utilizing sockets and realtime interactivity.
// MODE = 'yes';
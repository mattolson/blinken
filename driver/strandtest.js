// Setup strand
var Strand = require('./strand');
var strand = new Strand('/dev/spidev0.0', 72);

strand.setStrandColor(255,255,255);

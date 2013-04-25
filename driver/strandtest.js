// Get number of panels
var num_panels = process.argv[2];
if (typeof(num_panels) === 'undefined') {
  console.log('USAGE: sudo node strandtest.js <num_panels>');
}

// Setup strand
var Strand = require('./strand');
var strand = new Strand('/dev/spidev0.0', num_panels*18);

strand.off();

setTimeout(function() {
  strand.setStrandColor([255,255,255]);
  strand.sync();
}, 1000);


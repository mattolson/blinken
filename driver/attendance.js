var http = require('http');

function Attendance(mixer, sources) {
  this.mixer = mixer;
  this.source_registry = sources;
  this.attendance = 0;
}

Attendance.prototype.run = function() {
  var self = this;
  setInterval(function() {
    self.update();
  }, 10000);
};

Attendance.prototype.update = function() {
  var self = this;

  // Record previous attendance
  var previous_attendance = this.attendance;

  // Get latest attendance numbers
  var url = 'http://ideafablabs.com/api/attendance';
  //var url = 'http://192.168.1.6:8888/attendance';
  http.get(url, function(response) {
    var output = '';
    response.on('data', function(chunk) {
      output += chunk;
    });

    response.on('end', function() {
      console.log("queried for attendance, got " + output);
      var num = Number(output);
      if (!isNaN(num)) {
        self.attendance = num;
      }

      if (previous_attendance == self.attendance) {
        console.log("attendance hasn't changed, skipping this cycle");
      } else {
        // Record active state of layers, and deactivate them all
        var active = [];
        for (var i = 0; i < self.mixer.layers.length; i++) {
          active.push(self.mixer.layers[i].source.active);
          self.mixer.layers[i].source.deactivate();
        }

        // Choose a new source for a temporary layer
        var source = self.choose_source.apply(self);

        // Add a new layer
        var layer = self.mixer.add_layer('Ding! Ding! Ding!', source);

        // Let some time elapse and then revert
        setTimeout(function() {
          // Remove our temporary layer
          self.mixer.remove_layer(layer.id);

          // Restore active bit for other layers
          for (var i = 0; i < self.mixer.layers.length; i++) {
            if (active[i]) {
              self.mixer.layers[i].source.activate();
            }
          }
        }, 5000);
      }
    });
  });
};

// Put the logic for choosing a source based on attendance number here
// given previous and current attendance numbers
Attendance.prototype.choose_source = function() {
  // The list of good choices for this demo
  var choices = ['color_wheel', 'color_wipe', 'pulse_brightness', 'runner', 'sparkle', 'throb'];
  
  // Random choice for now
  var choice = choices[Math.floor(Math.random(choices.length-1))];

  // Setup options
  var options = {};

  var source = this.source_registry.find(choice);
  return new source(this.mixer.grid, options);
};

// Expose constructor directly
module.exports = Attendance;


// This object encapsulates a list of effects and renders them
// on a timer.
function Controller(grid) {
  this.grid = grid;
  this.effects = [];
  this.rendering = false;
  this.timer = null;
}

Controller.prototype.register_effect = function(effect) {
  this.effects.push(effect);
};

Controller.prototype.deregister_effect = function(effect) {
  for (var i = 0; i < this.effects.length; i++) {
    if (this.effects[i] == effect) {
      this.effects.splice(i,1);
      return;
    }
  }
};

Controller.prototype.deregister_all = function() {
  this.effects.length = 0;
};

Controller.prototype.run = function() {
  if (this.timer != null) {
    return;
  }

  var controller = this;
  this.timer = setInterval(function() { 
    if (!controller.rendering) {
      controller.render(); 
    }
  }, 2);
};

Controller.prototype.stop = function() {
  clearInterval(this.timer);
  this.timer = null;
};

Controller.prototype.render = function() {
  // Global lock to make sure this doesn't get called again until we're done
  this.rendering = true;

  // Loop through effects and have them render themselves
  for (var i = 0; i < this.effects.length; i++) {
    if (!this.effects[i].render()) {
      // Effect has requested removal
      this.deregister_effect(this.effects[i]);
    }
  }

  // Blast updates to strip
  this.grid.sync();

  // Remove lock
  this.rendering = false;
};

// Export constructor directly
module.exports = Controller;

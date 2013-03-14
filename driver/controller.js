// This object encapsulates a list of effects and renders them
// on a timer.
function Controller(grid) {
  this.grid = grid;
  this.effects = {};
  this.rendering = false;
  this.timer = null;
}

Controller.prototype.register_effect = function(effect) {
  this.effects[effect.name] = effect;
};

Controller.prototype.deregister_effect = function(effect) {
  delete this.effects[effect.name];
};

Controller.prototype.deregister_all = function() {
  this.effects = {};
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
  }, 1);
};

Controller.prototype.stop = function() {
  clearInterval(this.timer);
  this.timer = null;
};

Controller.prototype.render = function() {
  // Global lock to make sure this doesn't get called again until we're done
  this.rendering = true;

  // Loop through effects and have them render themselves
  for (var effect in this.effects) {
    if (!effect.render()) {
      // Effect has requested removal
      this.deregister_effect(effect);
    }
  }

  // Blast updates to strip
  this.grid.sync();

  // Remove lock
  this.rendering = false;
};

// Export constructor directly
module.exports = Controller;

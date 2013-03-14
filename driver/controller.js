// This object encapsulates a list of effects and renders them
// on a timer.
function Controller(grid) {
  this.grid = grid;
  this.effects = {};
  this.num_effects = 0;
  this.rendering = false;
  this.timer = null;
}

Controller.prototype.register_effect = function(effect) {
  this.effects[effect.name] = effect;
  this.num_effects++;
};

Controller.prototype.deregister_effect = function(effect) {
  delete this.effects[effect.name];
  this.num_effects--;
};

Controller.prototype.deregister_all = function() {
  this.effects = {};
  this.num_effects = 0;
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

  // The grid will have changed if there is at least one effect in our list
  var changed = this.num_effects > 0;

  // Loop through effects and have them render themselves
  for (var index in this.effects) {
    if (!this.effects[index].render()) {
      // Effect has requested removal
      this.deregister_effect(this.effects[index]);
    }
  }

  // Blast updates to strip
  if (changed) {
    this.grid.sync();
  }

  // Remove lock
  this.rendering = false;
};

// Export constructor directly
module.exports = Controller;

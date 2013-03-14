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

  this.timer = setInterval(function() { 
    if (!this.rendering) {
      this.render(); 
    }
  }, 2);
};

Controller.prototype.stop = function() {
  clearInterval(this.timer);
  this.timer = null;
};

Controller.prototype.render = function() {
  this.rendering = true;
  for (var i = 0; i < this.effects.length; i++) {
    if (!this.effects[i].render()) {
      this.deregister_effect(this.effects[i]);
    }
  }
  this.rendering = false;
};

// Export constructor directly
module.exports = Controller;

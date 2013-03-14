// grid = the instantiated Grid object
// period = number if milliseconds between steps
function Effect(grid, period) {
  this.grid = grid;
  this.period = period;
  this.started_at = 0; // when did this effect first begin?
  this.rendered_at = 0; // when was the last time we rendered a step?
}

Effect.prototype.render = function() {
  var current_time = (new Date()).getTime();

  // Update start time
  if (this.started_at == 0) {
    this.started_at = current_time;
  }

  // Check how much time has elapsed since last time. If it's not time
  // yet, return right away.
  if (current_time - this.rendered_at < this.period) {
    return true;
  }

  // Remember the time
  this.rendered_at = current_time;

  // Call on subclass to render next step
  return this.step();
};

// Abstract method, to be overridden by subclasses
Effect.prototype.step = function() {
  return true;
};

// Export constructor directly
module.exports = Effect;

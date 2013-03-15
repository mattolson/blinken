// name = a unique short name for this effect (used for registration)
// grid = the instantiated Grid object
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
function Effect(name, grid, options) {
  options = options || {};
  this.name = name;
  this.grid = grid;
  this.period = options['period'] || 40; // default to 40 ms between steps
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

// Return js object containing all params and their types
Effect.prototype.options = function() {
  return [
    {
      'name': 'period',
      'type': 'integer',
      'value': this.period
    }
  ];
}

// Export constructor directly
module.exports = Effect;

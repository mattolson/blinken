// name = a unique short name for this source (used for registration)
// grid = the instantiated Grid object
// options = {}, optional, valid keys:
//   'period' = number of milliseconds between steps
function Source(name, grid, options) {
  options = options || {};
  this.name = name;
  this.grid = grid;
  this.period = options['period'] || 40; // default to 40 ms between steps
  this.started_at = 0; // when did this effect first begin?
  this.rendered_at = 0; // when was the last time we rendered a step?
}

Source.prototype.render = function() {
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
Source.prototype.step = function() {
  return true;
};

// Return js object containing all params and their types. This is a
// default that should be overridden by subclasses if they have
// additional options.
Source.options = function() {
  return [
    {
      'name': 'period',
      'type': 'integer',
      'default': 40
    }
  ];
};

// Export constructor directly
module.exports = Source;

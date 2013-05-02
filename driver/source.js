// name = a unique short name for this source (used for registration)
// grid = the instantiated Grid object
// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
function Source(name, grid, options) {
  options = options || {};

  this.name = name;
  this.grid = grid;
  this.started_at = 0; // when did this effect first begin?
  this.rendered_at = 0; // when was the last time we rendered a step?

  this.options = {};
  this.options.period = options.period || 40; // default to 40 ms between steps
}

Source.prototype.render = function() {
  var current_time = (new Date()).getTime();

  // Update start time
  if (this.started_at == 0) {
    this.started_at = current_time;
  }

  // Check how much time has elapsed since last time. If it's not time
  // yet, return right away.
  if (current_time - this.rendered_at < this.options.period) {
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

// Validate and update options
Source.prototype.update_options = function(new_options) {
  var spec = this.options_spec();
  for (var i = 0; i < spec.length; i++) {
    var option_name = spec[i].name;
    var option_type = spec[i].type;

    // Check if a valid option was included in the new data
    if (option_name in new_options) {
      var value = null;
      var raw_value = new_options[option_name];

      // Coerce to appropriate type
      switch (option_type) {
        case 'integer':
          value = Number(raw_value);
          if (isNaN(value)) {
            value = null;
          }
          break;
        case 'string':
          value = String(raw_value);
          break;
        case 'color':
          if (Array.isArray(raw_value)) {
            // Coerce each component to a number
            value = raw_value.map(function() {
              return Number(this);
            });

            // Make sure conversion worked for every component
            if (!value.every(function() { !isNaN(this) })) {
              value = null;
            }
          }
          break;
        case 'boolean':
          break;
        case 'select':
          break;
      }

      // Apply new value to self
      if (value != null) {
        this.options[option_name] = value;
      }
    }
  }
};

// Output current state as json
Source.prototype.toJson = function() {
  return {
    'name': this.name,
    'options': this.options
  };
};

// Return js object containing all params and their types. This is a
// default that should be overridden by subclasses if they have
// additional options.
Source.options_spec = function() {
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

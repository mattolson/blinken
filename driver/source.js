var util = require('util');

// name = a unique short name for this source (used for registration)
// grid = the instantiated Grid object
// options = {}, optional, valid keys:
//   period = number of milliseconds between steps
function Source(name, grid, opts) {
  opts = opts || {};

  this.name = name;
  this.grid = grid;
  this.started_at = 0; // when did this effect first begin?
  this.rendered_at = 0; // when was the last time we rendered a step?

  this.options = this.validate_options(opts, true);
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

// Validate options
Source.prototype.validate_options = function(new_options, use_defaults) {
  var validated = {};
  var spec = this.constructor.options_spec();

  // Loop through spec
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
        case 'array':
          if (Array.isArray(raw_value)) {
            value = raw_value;
          }
          break;
        case 'color':
          if (Array.isArray(raw_value)) {
            // Coerce each component to a number
            value = raw_value.map(function(e) {
              return Number(e);
            });

            // Make sure conversion worked for every component
            if (!value.every(function(e) { return !isNaN(e); })) {
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
        console.log(util.format("parsed value '%s' for option '%s'", util.inspect(value), option_name));
        validated[option_name] = value;
      }
    }
  }

  // Provide defaults if desired
  if (use_defaults) {
    for (var i = 0; i < spec.length; i++) {
      var option_name = spec[i].name;
      if (!(option_name in validated)) {
        validated[option_name] = spec[i]['default'];
      }
    }
  }

  return validated;
};

// Validate and update given options
Source.prototype.update_options = function(new_options) {
  var validated = this.validate_options(new_options, false);
  for (option in new_options) {
    this.options[option] = new_options[option];
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

var util = require('util');
var validation = require('./validation');

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
  this.active = true; // source can opt-out of future rendering cycles
  this.options = this.validate_options(opts, true);
}

Source.prototype.getBuffer = function(){
  return this.grid.pixels;
}

Source.prototype.render = function() {
  // Check if still active
  if (!this.active) {
    return false;
  }

  var current_time = (new Date()).getTime();

  // Update start time
  if (this.started_at == 0) {
    this.started_at = current_time;
  }

  // Check how much time has elapsed since last time. If it's not time
  // yet, return right away.
  if (current_time - this.rendered_at < this.options.period) {
    return false;
  }

  // Remember the time
  this.rendered_at = current_time;

  // Call on subclass to render next step
  return this.step();
};

// Abstract method, to be overridden by subclasses. Return true
// if you changed the grid.
Source.prototype.step = function() {
  return false;
};

// Source can opt-out of future render cycles by calling this method.
Source.prototype.deactivate = function() {
  this.active = false;
};

// Reactivate source
Source.prototype.activate = function() {
  this.active = true;
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
          value = validation.to_number(raw_value);
          break;
        case 'string':
          value = validation.to_string(raw_value);
          break;
        case 'color_array':
          value = validation.to_color_array(raw_value);
          //value = raw_value;
          break;
        case 'color':
          value = validation.to_color(raw_value);
          break;
        case 'boolean':
          break;
        case 'select':
          break;
        case 'file':
          break;
      }

      // Apply new value to self
      if (value != null) {
        //console.log(util.format("parsed value '%s' for option '%s'", util.inspect(value), option_name));
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
  console.log("source.js update_options");
  //console.log(new_options);

  // Merge validated options
  var validated = this.validate_options(new_options, false);
  for (option in new_options) {
    this.options[option] = new_options[option];
  }

  // console.dir(this.options[option]);

  // Activate source again
  this.activate();
};

// Output current state as json
Source.prototype.toJson = function() {
  console.log('Source Options->')
  // console.dir(this.options);
  return {
    'name': this.name,
    'active': this.active,
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

module.exports.to_number = function(raw_value) {
  var value = Number(raw_value);
  if (isNaN(value)) {
    value = null;
  }
  return value;
};

module.exports.to_string = function(raw_value) {
  return String(raw_value);
};

var to_color = function(raw_value) {
  var value = null;
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
  return value;
};
module.exports.to_color = to_color;

module.exports.to_color_array = function(raw_value) {
  var value = null;
  if (Array.isArray(raw_value)) {
    value = raw_value.map(function(e) {
      return to_color(e);
    });
  }
  return value;
};

// Keep track of all effects available in the system, for easy
// lookup and instantiation.
function EffectRegistry() {
  this.effects = {};

  // Loop through effects directory and add them to the registry
  var registry = this;
  require("fs").readdirSync("./effects").forEach(function(file) {
    var effect = require("./effects/" + file);
    registry.effects[effect.name] = effect.constructor;
  });
}

EffectRegistry.prototype.find = function(name) {
  return this.effects[name] || null;
};

EffectRegistry.prototype.toJson = function() {
  var json = [];
  for (var effect in this.effects) {
    json.push({
      'name': effect,
      'options': this.effects[effect].options()
    });
  }
  return json;
};

module.exports = new EffectRegistry();

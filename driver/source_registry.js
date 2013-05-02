// Keep track of all sources available in the system, for easy
// lookup and instantiation.
function SourceRegistry() {
  this.sources = {};

  // Loop through sources directory and add them to the registry
  var registry = this;
  require("fs").readdirSync("./sources").forEach(function(file) {
    var source = require("./sources/" + file);
    registry.sources[source.name] = source.constructor;
  });
}

SourceRegistry.prototype.find = function(name) {
  return this.sources[name] || null;
};

SourceRegistry.prototype.toJson = function() {
  var json = [];
  for (var name in this.sources) {
    json.push(this.sources[name].toJson);
  }
  return json;
};

// Expose singleton
module.exports = new SourceRegistry();

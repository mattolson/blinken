var path = require('path');

// Keep track of all sources available in the system, for easy
// lookup and instantiation.
function SourceRegistry() {
  this.sources = {};

  // Loop through sources directory and add them to the registry
  var registry = this;
  var sources_dir = path.resolve(__dirname, 'sources');
  require("fs").readdirSync(sources_dir).forEach(function(file) {
    var source = require(sources_dir + "/" + file);
    registry.sources[source.name] = source.constructor;
  });
}

SourceRegistry.prototype.find = function(name) {
  return this.sources[name] || null;
};

SourceRegistry.prototype.toJson = function() {
  var json = [];
  for (var name in this.sources) {
    json.push({
      'name': name,
      'options': this.sources[name].options_spec()
    });
  }
  return json;
};

// Expose singleton
module.exports = new SourceRegistry();

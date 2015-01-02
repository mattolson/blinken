var path = require('path');

// Keep track of all sources available in the system, for easy
// lookup and instantiation.
function Registry( type ) {

  if(type == 'type') return;
 
  this.type = type;
  this[this.type] = {};



   var registry = this;
  // Loop through directories
  
  var dir = path.resolve(__dirname, this.type);
  require("fs").readdirSync(dir).forEach(function(file) {
    if(file == '.DS_Store') return;
    var module = require(dir + "/" + file);
    registry[registry.type][module.name] = module.constructor;
    // console.log(registry[registry.type][module.name]);
  });

  // console.log(this[this.type])

}

Registry.prototype.find = function(name) {
  return this[this.type][name] || null;
};

Registry.prototype.toJson = function( what ) {
  var json = [];
  for (var name in this[this.type]) {
    json.push({
      'name': name,
      'options': this[this.type][name].options_spec()
    });
  }
  return json;
};

// Expose singleton
module.exports = Registry;
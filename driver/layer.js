// Layer is a container for a single source (for now)
// and gets registered with the mixer for rendering.
function Layer(id, name, source) {
  this.id = id;
  this.name = name;
  this.source = source;
}

// For now, rendering a layer simply means rendering the source
Layer.prototype.render = function() {
  return this.source.render();
};

// Update based on PUT request
Layer.prototype.update = function(data) {
  if ('name' in data) {
    this.name = data.name;
  }

  if ('source' in data && 'options' in data.source) { 
    this.source.update_options(data.source.options);
  }
};

Layer.prototype.toJson = function() {
  console.log('Layer Source Options->')
  // console.dir(this.source.toJson());
  return {
    'id': this.id,
    'name': this.name,
    'source': this.source.toJson()
  };
};

// Export constructor directly
module.exports = Layer;

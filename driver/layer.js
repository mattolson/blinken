// Layer is a container for a single source (for now)
// and gets registered with the mixer for rendering.
function Layer(source, id) {
  this.source = source;
  this.id = id;
}

// For now, rendering a layer simply means rendering the source
Layer.prototype.render = function() {
  return this.source.render();
};

Layer.prototype.toJson = function() {
  return {
    'id': this.id,
    'source': this.source.name
  };
};

// Export constructor directly
module.exports = Layer;

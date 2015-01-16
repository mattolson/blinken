// Channel is a container for a single source (for now)
// and gets registered with the mixer for rendering.
function Channel(id, name, source) {
  this.id = id;
  this.name = name;
  this.source = source;
  this.filters = new Array();
  // this.buffer = new Buffer(Config.grid.num_pixels_x * Config.grid.num_pixels_y * 3)
  //console.log("channel object");
  //console.log(this);
  //console.log("------");
}

// For now, rendering a channel simply means rendering the source
Channel.prototype.render = function() {
  // var source_output = this.source.render();
  // return (source_output) ? this.apply_filters( this.source.getBuffer() ) : source_output;
  return this.source.render();
};

Channel.prototype.apply_filters = function( output ){
  if(!this.filters.length) return output;
  for(filter in this.filters) {
    output = filter.render( output );
  }
  return output;
}

// Update based on PUT request
Channel.prototype.update = function(data) {
  //console.log("channel.js update");
  //console.log(data);

  if ('name' in data) {
    this.name = data.name;
  }

  if ('source' in data && 'options' in data.source) { 
    this.source.update_options(data.source.options);
  }
};

Channel.prototype.display = function(){
   return this.source.grid.pixels;
}

Channel.prototype.toJson = function() {
  //console.log('Channel Source Options->')
  // console.dir(this.source.toJson());
  return {
    'id': this.id,
    'name': this.name,
    'source': this.source.toJson()
  };
};

// Export constructor directly
module.exports = Channel;

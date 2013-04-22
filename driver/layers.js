//

Layers = ;

function Layer(options) {
	this.id = options['id'] || Layers.length;
	this.name = options['name'] || 'Layer '+ idToWord(Layers.length);
	this.layerMode = options['mode'] || 'add';
	this.slug = options['slug'] || "layer-"+idToWord(Layers.length);
	this.generator = options['generator'] || null;
	this.mask = options['mask'] || null; 
	// this.layers = Layers;
}

Layer.prototype.render = function(){
	for(var p=0;p<this.grid.num_pixels;p++) {
		var xy = this.grid.xy(p);
		this.grid.setPixelColor(xy.x, xy.y, Layers[this.slud]);
	}
}

Layer.prototype.getLayers = function(){
	return Layers;
}

Layer.prototype.getLayer = function(id){
	return Layers[id];
}

Layer.prototype.setLayer = function(id, options){
	Layers[id] = Layers[id] ? jsonConcat(Layers[id], options) : options;
}

Layer.prototype.deleteLayer = function(id){
	
}

Layer.prototype.setLayerOrder = function(order_arr){}{
	var buffer = new Array(Layers.length);
	for(var i=0;i<order_arr.length;i++) {
		buffer[order_arr.weight] = Layers[id];
	}
	Layers = buffer;
}

var idToWord = function(id){
	switch(id) {
		case 0: return 'zero';
		case 1: return 'one';
		case 2: return 'two';
		case 3: return 'three';
		case 4: return 'four';
		case 5: return 'five';
		case 6: return 'six';
		case 7: return 'seven';
		case 8: return 'eight';
		case 9: return 'nine';
		case 10: return 'ten';
		case 11: return 'eleven';
		case 12: return 'twelve';
		case 13: return 'thirteen';
	}
}

function jsonConcat(o1, o2) {
 for (var key in o2) {
  o1[key] = o2[key];
 }
 return o1;
}

// Export constructor directly
module.exports = Layer;

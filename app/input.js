var artnet = require('../lib/artnet_server');

var Ans = function(port, channel){
	if(!channel && channel.source) return; //quick validate
	this.grid = this.channel.source.grid;
	this.map = this.channel.source.grid.display.map;
	this.server = artnet.listen(port, onSuccess);
}

//Replaced by passthrough source,
// do something with msg and peer ;)
Ans.prototype.onSuccess = function(msg, peer) {

	console.log("-----------------");
	console.log("Sequence: " + msg.sequence);
	console.log("Physical: " + msg.physical);
	console.log("Universe: " + msg.universe);
	console.log("Length: " + msg.length);
	console.log("Data: " + msg.data);
	console.log("-----------------");
}

//
Ans.prototype.pipeToGrid = function( dmx ){
	for(var u =0;u < this.map.length) { //universes
		for(var p=0; p < this.map[u].length) { //pixels
			if(this.map[u][p] == )
		}
	}
}

module.exports = Ans;
function Display( name ){
	this.name = name;
	this.refreshRate = 100;
}

//Abstract, overwrite
Display.prototype.send( data ) {
	//
}

Display.prototype.refresh( data ){
	this.send(data);
}

module.exports = Display;
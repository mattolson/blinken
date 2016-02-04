function FPS(){
	this.frames = 0;
	this.fps = 0;
	var fps = this;
	this.interval = setInterval(function(){ fps.calculate(); }, 1000);
}

FPS.prototype.frame = function(){ this.frames += 1; }

FPS.prototype.calculate = function(){
	this.fps = this.frames;
	this.frames = 0;
}

FPS.prototype.get = function(){
	return this.fps;
}

module.exports = new FPS();
var path = require('path');
var util = require('util');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name

// This will play a game of snake
//
// options should be step time and min and max size.
//
function randomI(low, high) {
	return Math.floor((Math.random() * (high + 1 - low)) + low);
}

function randomXY()
{
	var xy = {
			x: randomI(0,60),
			y: randomI(0,48)
	};
	
	return xy;
}

function getOffset(direction){
	var offset = {
			x: 0,
			y: 0
	};
	
	switch(direction){
	case "UP":
		offset.y = -1;
		break;
	case "DOWN":
		offset.y = 1;
		break;
	case "LEFT":
		offset.x = -1;
		break;
	case "RIGHT":
		offset.x = 1;
		break;
	}
	
	return(offset);
}

function GenerateFood()
{
	var xy;
	
	while(1)
	{
		xy = randomXY();
		
		var index = (xy.y * this.grid.num_pixels_x) + xy.x;
		
		if( typeof this.map[index] === 'undefined' ||
			this.map[index] === 'empty' )
		{
			// we can place the food here
			
			this.map[index] = 'food';
			return xy;
		}
	}
}

function DrawSnake(parent){
//	console.log("Draw snake this = " + util.inspect(this, false, null));

	var self = this;
	  this.body.forEach(function(element){
		  parent.map[(element.y * parent.grid.num_pixels_x) + element.x] = self.id;
	  });
}

function FindFreeSnake(){
	// look to see if any of the snakes are not being controlled by a socket
	
	for(var loop = 0; loop < this.snakes.length ; loop++){
		if(this.snakes[loop].socket === undefined && this.snakes[loop].state === 'ALIVE'){
			return(this.snakes[loop]);
		}
	}
	
	return undefined;
}

function CheckCollision(){
	var loop;
	
	for(loop = 0; loop < this.snakes.length; loop++){
		var chSnake = this.snakes[loop];

		if( chSnake.state === 'DIED'){
			chSnake.state = 'DEAD'; // we did die, now we are dead
			continue;
		}
		
		if( chSnake.state !== 'ALIVE'){
			continue;
		}
		
		// check each head
		for(var innerLoop = 0; innerLoop < this.snakes.length; innerLoop++){
			var inSnake = this.snakes[innerLoop];
			
			if( inSnake.state !== 'ALIVE'){
				continue;
			}

			// we don't check the head on ourself
			for(var seg = (innerLoop === loop) ? 1 : 0; seg < inSnake.body.length ; seg++){
				if((chSnake.body[0].x === inSnake.body[seg].x) && 
						(chSnake.body[0].y === inSnake.body[seg].y)){
					// we have collided, we are dead
					chSnake.die(this.options.deathScale);
					break;
				}
			}
			
			if(chSnake.state !== 'ALIVE'){
				break;
			}
		}
	}
}

function CheckWalls(snake, offset){
	// get the position of the snake head, this is the only thing that can hit a wall.
	
	var snakeHead = {
			x: snake.body[0].x + offset.x,
			y: snake.body[0].y + offset.y
	};
	
	if (this.options.walls === 'TRUE') {
		// report if we would go past a wall
		if (snakeHead.x >= this.grid.num_pixels_x) {
			return '+X';
		} else if (snakeHead.x < 0) {
			return '-X';
		}

		if (snakeHead.y >= this.grid.num_pixels_y) {
			return '+Y';
		} else if (snakeHead.y < 0) {
			return '-Y';
		}
	}
	
	return 'NONE';
}

function changeDirection(turn, direction){
	var newDirection = direction; // maybe no change
	
	if (turn === "RIGHT"){
		switch(direction){
			case "UP":
				newDirection = "RIGHT";
				break;
			case "DOWN":
				newDirection = "LEFT";
				break;
			case "RIGHT":
				newDirection = "DOWN";
				break;
			case "LEFT":
				newDirection = "UP";
				break;
		}
	} else if (turn === "LEFT"){
		switch(direction){
		case "UP":
			newDirection = "LEFT";
			break;
		case "DOWN":
			newDirection = "RIGHT";
			break;
		case "RIGHT":
			newDirection = "UP";
			break;
		case "LEFT":
			newDirection = "DOWN";
			break;
		}
	}
	
	return newDirection;
}

function MoveSnake(parent) {
	var curDir;
	var x = 0;
	var y = 0;

	// erase the snake first

	this.unDrawSnake();

	var lastTurn = this.turn; // keep track for robot snakes.

	// do any turning 
	
	var newDirection = changeDirection(this.turn, this.direction);
	
	this.turn = 'NONE';
	
	// where would the snake be?
	
	var offset = getOffset(newDirection);
	
	// handle the robot snakes and the wall here 
	
	if (this.socket === undefined){
		var whichWall;
		
		if ((whichWall = parent.checkWalls(this, offset)) !== 'NONE'){
//			console.log("snake " + this.id + " hit a wall " + whichWall + " last Turn " + lastTurn +
//					" offset x:" + offset.x +  " y:" + offset.y + " head.x:" +
//					this.body[0].x + " y:" + this.body[0].y + " direction " + newDirection);
			
			if (lastTurn === 'NONE'){
				// we where just going along and out popped this wall
				// turn to save ourselves
				
				switch(whichWall){
				case '+X':  // going right or left , we need to go up or down depends on if we are
				case '-X':  // in the bottom or top
					if (this.body[0].y > (parent.grid.num_pixels_y/2)){
						newDirection = 'UP';
					} else {
						newDirection = 'DOWN';
					}
					break;
				case '+Y':  // going up or dowwn , we need to go left or right depends on if we are
				case '-Y':  // in the right or left. go opposite
					if (this.body[0].x > (parent.grid.num_pixels_x/2)){
						newDirection = 'LEFT';
					} else {
						newDirection = 'RIGHT';
					}
					break;
				}
			} else {
				// we were trying to turn and the wall got in our way, turn the other way
				
				newDirection = changeDirection(lastTurn === 'RIGHT' ? 'LEFT' : 'RIGHT', this.direction);
			}
			
//			console.log("Our new direction = ", newDirection);

			offset = getOffset(newDirection);
		}
		
		// we are now going a direction that shouldn't hurt
	}
	
	this.direction = newDirection;
	
	for (var i = (this.body.length - 1); i > 0; i--) {
		// is there food at the end

		if (this.body[i].food === true) {
			// if this is the last segment
			if (i === (this.body.length - 1)) {
				// grow by one segment

				var seg = {};
				seg.x = this.body[i].x;
				seg.y = this.body[i].y;
				
				this.body.push(seg);
			}
		}

		this.body[i].food = this.body[i - 1].food;
		this.body[i].x = this.body[i - 1].x;
		this.body[i].y = this.body[i - 1].y;
	}

	// actually move the head
	var lastXy = {x: this.body[0].x, y: this.body[0].y};
	
	this.body[0].x += offset.x;
	this.body[0].y += offset.y;

	if (parent.options.walls === 'FALSE') {
		// wrap any pieces that went off screen

		if (this.body[0].x >= parent.grid.num_pixels_x) {
			this.body[0].x = 0;
		} else if (this.body[0].x < 0) {
			this.body[0].x = parent.grid.num_pixels_x - 1;
		}

		if (this.body[0].y >= parent.grid.num_pixels_y) {
			this.body[0].y = 0;
		} else if (this.body[0].y < 0) {
			this.body[0].y = parent.grid.num_pixels_y - 1;
		}
	} else {
		if (parent.checkWalls(this, {x:0, y:0}) !== 'NONE'){
				this.die(parent.options.deathScale);
		}
	}

	// see if we ate the food
	
	var index = this.body[0].y * parent.grid.num_pixels_x + this.body[0].x;
	
	if (parent.map[index] === 'food'){
		this.body[0].food = true;
		parent.generateFood();
	} else {
		this.body[0].food = false;
	}
}

function ReInit(direction, numSegments, start){
	this.state = 'ALIVE';

	// remove all segments
	
	this.body.length = 0;
	var offset = getOffset(this.direction);

	// to first place the snake we need these inverted

	offset.x = -offset.x;
	offset.y = -offset.y;

	for (var i = 0; i < numSegments; i++) {
		var segment = {};

		segment = {
				x : start.x + offset.x,
				y : start.y + offset.y,
				food : false
		};

		this.body.push(segment);
	}

//	this.drawSnake(this);
}

function Die(scale){
	this.state = 'DIED';  // have a died state for one step.
//	console.log("scale = " + scale);
	this.color[0] /= scale;
	this.color[1] /= scale;
	this.color[2] /= scale;
	
	if (this.socket !== undefined){
		this.socket.emit('died', {id: this.id, color: this.color});
	}
}

function snake(numSegments, color, start, direction, id, socket)
{
	var parent = this;
	
	var ssss = {
			body: [],
			drawSnake: DrawSnake,
			moveSnake: MoveSnake,
			die: Die,
			reInit: ReInit,
			unDrawSnake: function() {
				var self = this;
				this.body.forEach(function(element) {
					parent.map[(element.y * parent.grid.num_pixels_x) + element.x] = 'empty';
				});
			},

			printSnake: function(text){
				console.log(text);
				this.body.forEach(function(element, index){
					console.log("Snake[" + index + "].x = " + element.x + " .y = " + element.y);
				});
			},

			direction: direction,
			turn: "NONE",
			color: color,
			state: "ALIVE",
			id: id,
			socket: socket
	};

	ssss.reInit(direction, numSegments, start);
	ssss.drawSnake(parent);
	return ssss;
}

function socketError(socket, errMsg){
	socket.emit('error', {text: errMsg});
}

function Snakes(grid, options) {
	options = options || {};
	Snakes.super_.call(this, NAME, grid, options);
	var self = this;
	
	this.count = 0;
	this.generateFood = GenerateFood;
	this.checkCollision = CheckCollision;
	this.findFreeSnake = FindFreeSnake;
	this.checkWalls = CheckWalls;
	
	this.snakes = []; // we may have a few snakes
	this.map = []; // this is grid.num_pixels_x * this.grid.num_pixels_y
	this.connections = 0;
	

	io.of('/snakes').on('connection', function(socket) {
		console.log("Connected to snake");
		
		socket.on('disconnect', function() {
			console.log("disconnected from snake");

			// for sure at this point if this connection owns a snake we
			// should kill it now
			if (socket.snake !== undefined) {
				socket.snake.socket = undefined;
			}
		});

		socket.on('attach', function() {
			console.log("got an attach");
			socket.snake = self.findFreeSnake();
			if (socket.snake !== undefined) {
				socket.snake.socket = socket;
				console.log("attached to snake " + socket.snake.id);
				socket.emit('snake', {id: socket.snake.id, color: socket.snake.color});
			} else {
				console.log("cannot attach to snake");
				socket.emit('errorMsg', {text: 'No Snake Available'});
//				socketError(socket, 'No Snake Available');
			}
		});

		socket.on('detach', function() {
			if (socket.snake !== undefined){
				console.log('snake ' + socket.snake.id + ' detached from');
				socket.snake.socket = undefined;
				socket.snake = undefined;
			}
		});
		

		socket.on('turn', function(dir) {
//			console.log("We got turn info " + dir.turn);
			
			// set the direction for the next move
			if ((dir.turn === 'LEFT') || (dir.turn === 'RIGHT')) {
				socket.snake.turn = dir.turn;
			} else {
				console.log("bad turn info from ip-"
						+ socket.request.connection.remoteAddress)
			}
		});
	});
	  
	// generate snakes automatic snakes for when no-one is connected
	var tmpSock;
	var loop;
	
	for(loop = 0; loop < this.options.numSnakes ; loop++){
		var xy = { x: this.options['startx'+loop], y: this.options['starty'+loop] };
		
		this.snakes.push(snake.call(this, this.options['numSegments'+loop],
					this.options['color'+loop], xy,
					this.options['direction'+loop], loop, tmpSock));
	}
	
	// generate food
	
	for(loop = 0 ; loop < this.options.amountFood ; loop++){
		this.generateFood(); // place a piece of food
	}
}

// Set up inheritance from Source
  util.inherits(Snakes, Source);

  function randomI(low, high) {
	  return Math.floor((Math.random() * (high + 1 - low)) + low);
  }

var timeGameOver = 0;

Snakes.prototype.step = function() {
	var self = this;
	var loop;
	var gameOver = 'TRUE'; // assume it is over, if there is any snake alive it isn't

	for (loop = 0; loop < this.snakes.length; loop++) {
		// see if the game is over
		if (this.snakes[loop].state !== 'ALIVE') {
			if (this.snakes[loop].state === 'DIED'){
				console.log("snake " + loop + " died");
				// change state to dead
				this.snakes[loop].state = 'DEAD';
			}
			
			// don't clear the flag
		} else {
			// game can't be over, we have a live snake

			gameOver = 'FALSE';

			// if there are any LIVE snakes not connected to a socket
			// then we can control them.
			
			if (this.snakes[loop].socket === undefined) {
				switch (randomI(0, 15)) {
				case 0:
					this.snakes[loop].turn = 'RIGHT';
					break;
				case 1:
					this.snakes[loop].turn = 'LEFT';
					break;
				}
			}
		}
	}

//	console.log("gameOver " + gameOver);
	
	if (gameOver === 'FALSE') {
		// move all the snakes

		for (loop = 0; loop < this.snakes.length; loop++) {
			if (this.snakes[loop].state === 'ALIVE') {
				this.snakes[loop].moveSnake(this);
			}
		}

		// check to see if anything collided

		this.checkCollision();

		// redraw in the map
		for (loop = 0; loop < this.snakes.length; loop++) {
			this.snakes[loop].drawSnake(this);
		}

	} else {
		timeGameOver++;
		
		if (timeGameOver === 100){
			console.log("timeGameOver " + timeGameOver);
//			timeGameOver = 0;
			// reinit
//			self.snakes.forEach(function(element, index){
//				var xy = { x: self.options['startx'+index], y: self.options['starty'+index] };
				
//				element.reInit(element.direction, self.options['numSegments'+index], xy);
//				element.color = self.options['color'+index];
//				element.drawSnake(self);
//			});
		}
	}
	
	
	// clear our grid
	this.grid.setGridColor([ 0, 0, 0 ]);

	// actually write to the grid

	this.map.forEach(function(element, index) {
		var width = self.grid.num_pixels_x;
		if (element === 'food') {
			self.grid.setPixelColor(index % width, Math.floor(index / width), self.options.foodColor);
		} else if (element >= 0 && element < self.snakes.length) {
			self.grid.setPixelColor(index % width, Math.floor(index / width), self.snakes[element].color);
			// console.log("drawing S" + element + ": at X: " + index %
			// width + " Y: " + Math.floor(index / width));
		}
	});

	// We changed the grid
	return true;
};

// Return js object containing all params and their types
Snakes.options_spec = function() {
	return [ {
		'name' : 'walls',
		'type' : 'string',
		'default' : 'FALSE'
	},  {
		'name' : 'deathScale',
		'type' : 'integer',
		'default' : 3
	},  {
		'name' : 'foodColor',
		'type' : 'color',
		'default' : [ 0, 255, 0 ]
	},  {
		'name' : 'amountFood',
		'type' : 'integer',
		'default' : 30
	},  {
		'name' : 'numSnakes',
		'type' : 'integer',
		'default' : 2
	},  {
		'name' : 'numSegments0',
		'type' : 'integer',
		'default' : 3
	}, {
		'name' : 'color0',
		'type' : 'color',
		'default' : [ 255, 0, 0 ]
	}, {
		'name' : 'startx0',
		'type' : 'integer',
		'default' : 20
	}, {
		'name' : 'starty0',
		'type' : 'integer',
		'default' : 20
	}, {
		'name' : 'direction0',
		'type' : 'string',
		'default' : 'UP'
	},  {
		'name' : 'numSegments1',
		'type' : 'integer',
		'default' : 3
	}, {
		'name' : 'color1',
		'type' : 'color',
		'default' : [ 0, 0, 255 ]
	}, {
		'name' : 'startx1',
		'type' : 'integer',
		'default' : 35
	}, {
		'name' : 'starty1',
		'type' : 'integer',
		'default' : 5
	}, {
		'name' : 'direction1',
		'type' : 'string',
		'default' : 'RIGHT'
	}

	].concat(Source.options_spec());
}

// Export public interface
exports.constructor = Snakes;
exports.name = NAME;

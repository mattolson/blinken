var path = require('path');
var util = require('util');
var Source = require('../source');

var NAME = path.basename(__filename, '.js'); // Our unique name


// Constrain a paddle's position to within the display's border
function constrainPosition(position)
{
    var newPaddlePosY = position;

    if (position - this.paddle.halfHeight < 0)
    {
        newPaddlePosY = this.paddle.halfHeight;
    }
    else if (position + this.paddle.halfHeight > this.grid.num_pixels_y)
    {
        newPaddlePosY = this.grid.num_pixels_y - this.paddle.halfHeight;
    }

    return newPaddlePosY;
}

// Update the positions of the paddles:

function updatePaddlePositions()
{
    if (this.options.playMode !== 'Auto') {
        // we need to figure out where we get this info from
        // Update player 1's paddle:

        //if (BUTTON_UP.pinRead() == LOW)
        //{
        //	this.player1.posY--;
        //	if (this.player1.posY - this.paddle.halfHeight < 0)
        //	{
        //		this.player1.posY = this.paddle.halfHeight;
        //	}
        //}
        //if (BUTTON_DOWN.pinRead() == LOW)
        //{
        //	this.player1.posY++;
        //	if (this.player1.posY - this.paddle.halfHeight > this.grid.num_pixels_y)
        //	{
        //		this.player1.posY = this.grid.num_pixels_y - this.paddle.halfHeight;
        //	}
        //}
        //this.player1.posY = constrainPosition(this.player1.posY);
        //
    }
    else {
        // Update AI's paddle:
        // Follow along with the ball's position:
        if (this.player1.dir === 'DWN') {
            if (this.player1.posY < (this.grid.num_pixels_y - this.paddle.halfHeight)) {
                this.player1.posY += this.player1.velY;
            }
            else {
                // Can't go down any more. Go up
                this.player1.dir = 'UP';
                this.player1.posY -= 1;
            }
        }
        else
        {
            if(this.player1.posY > this.paddle.halfHeight)
            {
                this.player1.posY -= this.player1.velY + .05;
            }
            else {
                // Can't go down any more. Go up
                this.player1.dir = 'DWN';
                this.player1.posY += 1;
            }
        }
    }

    // Move player 2 paddle:

	if ((this.options.playMode === 'Single') || (this.options.playMode === 'Auto'))
	{
		// Update AI's paddle:
		// Follow along with the ball's position:
		if (this.player2.posY < this.ball.posY)
		{
            this.player2.posY += this.enemyVelY;
		}
		else if(this.player2.posY > this.ball.posY)
		{
            this.player2.posY -= this.enemyVelY;
		}
	}
	//else if (playMode === 'Multi')
	//{
		//if (BUTTON_A.pinRead() == LOW)
		//{
		//	this.player2.posY--;
		//	if (this.player2.posY - this.paddle.halfHeight < 0)
		//	{
		//		this.player2.posY = this.paddle.halfHeight;
		//	}
		//}
		//if (BUTTON_B.pinRead() == LOW)
		//{
		//	this.player2.posY++;
		//	if (this.player2.posY - this.paddle.halfHeight > this.grid.num_pixels_y)
		//	{
		//		this.player2.posY = this.grid.num_pixels_y - this.paddle.halfHeight;
		//	}
		//}
	//}

    this.player2.posY = constrainPosition.call(this, this.player2.posY);
   // this.player1.posX = Math.round(this.player1.posX);
   // this.player1.posY = Math.round(this.player1.posY);
   // this.player2.posX = Math.round(this.player2.posX);
   // this.player2.posY = Math.round(this.player2.posY);

}

// Move the ball and re-calculate its position:
function moveBall()
{
	this.ball.posY += this.ball.velY;
	this.ball.posX += this.ball.velX;

	// Top and bottom wall collisions
	if (this.ball.posY < this.ball.radius)
	{
		this.ball.posY = this.ball.radius;
		this.ball.velY *= -1.0;
	}
	else if (this.ball.posY > this.grid.num_pixels_y - this.ball.radius)
	{
		this.ball.posY = this.grid.num_pixels_y - this.ball.radius;
		this.ball.velY *= -1.0;
	}

	// Left and right wall collisions
	if (this.ball.posX < this.ball.radius)
	{
		this.ball.posX = this.ball.radius;
		this.ball.velX = this.ball.speedX;
		this.player2.score++;
        this.player2.showScore = 5;
	}
	else if (this.ball.posX > this.grid.num_pixels_x - this.ball.radius)
	{
		this.ball.posX = this.grid.num_pixels_x - this.ball.radius;
		this.ball.velX *= -1.0 * this.ball.speedX;
		this.player1.score++;
        this.player1.showScore = 5;
	}

	// Paddle collisions
	if (this.ball.posX < this.player1.posX + this.ball.radius + this.paddle.halfWidth)
	{
		if (this.ball.posY > this.player1.posY - this.paddle.halfHeight - this.ball.radius &&
			this.ball.posY < this.player1.posY + this.paddle.halfHeight + this.ball.radius)
		{
			this.ball.velX = this.ball.speedX;
			this.ball.velY = 2.0 * (this.ball.posY - this.player1.posY) / this.paddle.halfHeight;
		}
	}
	else if (this.ball.posX > this.player2.posX - this.ball.radius - this.paddle.halfWidth)
	{
		if (this.ball.posY > this.player2.posY - this.paddle.halfHeight - this.ball.radius &&
			this.ball.posY < this.player2.posY + this.paddle.halfHeight + this.ball.radius)
		{
			this.ball.velX = -1.0 * this.ball.speedX;
			this.ball.velY = 2.0 * (this.ball.posY - this.player2.posY) / this.paddle.halfHeight;
		}
	}

    this.ball.posX = Math.round(this.ball.posX);
    this.ball.posY = Math.round(this.ball.posY);
}

// Draw the paddles, ball and score:
function drawGame()
{
    // clear our grid
    this.grid.setGridColor([ 0, 0, 0 ]);

	drawScore.call(this, this.player1.score, this.player2.score);

    if (this.player1.showScore > 0)
    {
        this.player1.showScore--;
        // draw a blue line from 0,1 - 0,48
        this.grid.setColor(this.player1.color);
        this.grid.lineV(59, 1, 47);
    }
    if (this.player2.showScore > 0)
    {
        this.player2.showScore--;
        // draw a blue line from 0,1 - 0,48
        this.grid.setColor(this.player2.color);
        this.grid.lineV(0, 1, 47);
    }
    this.grid.setColor(this.player1.color);
	drawPaddle.call(this, this.player1.posX, this.player1.posY);
    this.grid.setColor(this.player2.color);
	drawPaddle.call(this, this.player2.posX, this.player2.posY);
    this.grid.setColor([0, 128, 0]);
    drawBall.call(this, this.ball.posX, this.ball.posY);
}

// Draw the two score integers on the screen
function drawScore(player1, player2)
{
    if( player1) {
        this.grid.setColor(this.player1.color);
        this.grid.lineH(0, 0, player1);
    }

    if( player2) {
        this.grid.setColor(this.player2.color);
        this.grid.lineH(60 - player2, 0, player2);
    }

    this.grid.setColor([0, 128, 0]);

//	this.grid.setCursor(10, 2);
//	this.grid.print(player1);
//	this.grid.setCursor(50, 2);
//	this.grid.print(player2);
}

// Draw a paddle, given it's x and y coord's
function drawPaddle(x, y)
{
	this.grid.rect(x - this.paddle.halfWidth,
		y - this.paddle.halfHeight,
		this.paddle.width,
		this.paddle.height);
}

// Draw a ball, give it's x and y coords
function drawBall(x, y)
{
    this.grid.setPixelColor(x, y, [0, 128, 0]);
//	this.grid.circle(x, y, this.ball.radius);
}

// Check if either player has won.
// Returns:
//	0 - Neither player has won.
//  1 - Player 1 has won
//  2 - Player 2 has won
function checkWin()
{
	if (this.player1.score >= this.options.scoreToWin)
	{
		return 1;
	}
	else if (this.player2.score >= this.options.scoreToWin)
	{
		return 2;
	}

	return 0;
}

// Draw the win screen.
// Keep it up for 5 seconds.
// Then go back to the splash screen.
function drawWin(player)
{
    // clear our grid
    this.grid.setGridColor([ 0, 0, 0 ]);

	this.grid.setCursor(8, 2);

	if (player === 1)
	{
	    this.grid.setColor(this.player1.color);
		this.grid.print("Player 1");
	}
	else if (player === 2)
	{
        this.grid.setColor(this.player2.color);
		this.grid.print("Player 2");
	}
	this.grid.setCursor(18, 12);
	this.grid.print("Wins!");
}

//function cleanUp()
//{
//    // clear our grid
//    this.grid.setGridColor([ 0, 0, 0 ]);
//}

function Pong(grid, options) {
	options = options || {};
	Pong.super_.call(this, NAME, grid, options);
//	var self = this;
//	this.connections = 0;

	io.of('/pong').on('connection', function(socket) {
		console.log("Connected to pong");
		
		socket.on('disconnect', function() {
			console.log("disconnected from pong");
		});

		socket.on('attach', function() {
			console.log("got an attach");
		});

		socket.on('detach', function() {
		});
		

		socket.on('turn', function(dir) {
		});
	});

    // Game Variables: some of these we will fill in right after this, It seemed easier

    this.paddle = {
        width: 0.0,
        height:  0.0,
        halfWidth: 0.0,
        halfHeight: 0.0
    };

    this.player1 = {
        score: 0,
        posX: 0.0,
        posY: 0.0,
        velY: this.options.velY1,
        dir: 'DWN',
        showScore: 0,
        color: [255, 0, 0]
    };

    this.player2 = {
        score: 0,
        posX: 0.0,
        posY: 0.0,
        velY:  this.options.velY2,
        dir: 'BALL',
        showScore: 0,
        color: [0, 0, 255]
    };

    this.enemyVelY = 0.5;

    this.ball = {
        radius: 0.5,
        speedX: 1.0,
        posX: 0.0,
        posY: 0.0,
        velX: 0.0,
        velY: 0
    };

	// setup initial pong game

    this.stepCnt = 0;

    // these probably never change

	this.paddle.width = 1;
    this.paddle.height =  this.grid.num_pixels_y / 4.0;
    this.paddle.halfWidth = this.paddle.width / 2.0;
    this.paddle.halfHeight = this.paddle.height / 2.0;

    // these should be set to this when we reset the game

    this.player1.posX = 1.0 + this.paddle.halfWidth;
    this.player2.posX = this.grid.num_pixels_x - 1.0 - this.paddle.halfWidth;
    this.ball.velX = -1.0 * this.ball.speedX;
    this.ball.posX = this.grid.num_pixels_x  / 2.0;
    this.ball.posY = this.grid.num_pixels_y / 2.0;
    this.enemyVelY = 0.5;

    // clear our grid
    this.grid.setGridColor([ 0, 0, 0 ]);

    this.grid.setCursor(12, 5);
    this.grid.print("Press A");
    this.grid.setCursor(0, 13);
    this.grid.print("for single");
    this.grid.setCursor(12, 30);
    this.grid.print("Press B");
    this.grid.setCursor(4, 38);
    this.grid.print("for multi");
}

// Set up inheritance from Source
util.inherits(Pong, Source);

//var timeGameOver = 0;

Pong.prototype.step = function() {
    if (++this.stepCnt < 100) {
        return true;
    }

	updatePaddlePositions.call(this);
	moveBall.call(this);
	drawGame.call(this);

	if( checkWin.call(this) !== 0 )
	{
		drawWin.call(this, checkWin.call(this));
		//cleanUp();
	}
	
	// We changed the grid
	return true;
};

// Return js object containing all params and their types
Pong.options_spec = function() {
	return [ {
		'name' : 'scoreToWin',
		'type' : 'integer',
		'default' : 10
	}, {
		'name' : 'playMode',
		'type' : 'string',
		'default' : 'Auto'
	}, {
        'name' : 'velY1',
        'type' : 'float',
        'default' : 3
    }, {
        'name' : 'velY2',
        'type' : 'float',
        'default' : 0.5
    }


    ].concat(Source.options_spec());
};

// Export public interface
exports.constructor = Pong;
exports.name = NAME;

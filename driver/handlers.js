// Setup grid
var Grid = require('./grid').Grid;
var grid = new Grid('/dev/spidev0.0', 2, 1, 3, 6);

// Output current leds as json
function renderLeds(request, response) {
  response.send(grid.toJson());
}

// Handle change events on the socket
function changeLed(socket, x, y, r, g, b) {
  // Change the color
  grid.setPixelColor(x, y, r, g, b);
  grid.sync();

  // Get pixel color (for debugging: make sure it worked)
  var pixelColor = grid.getPixelColor(x, y);

  // send the changed led to all other clients
  socket.broadcast.emit("changed:led", {
    x: x, 
    y: y, 
    r: pixelColor.r, 
    g: pixelColor.g, 
    b: pixelColor.b
  }); 
}

/*
var MAX_STEPS = 10;
var animation = {
  running: false,
  step: 0
};

function syncLeds() {
  for (var i = 0; i < MAX_LEDS; i++) {
    var led = leds[i];
    pixels.set(i, led.r, led.g, led.b);
  }
  pixels.sync();
}

function startAnimation(socket, leds) {
  animation.running = true;
  animate(socket, leds);
}

function stopAnimation(socket) {
  animation.running = false;
  animation.step = 0;
  for (i = 0; i < leds.length; i++) {
    leds[i].r = ledBuffer[i].or;
    leds[i].g = ledBuffer[i].og;
    leds[i].b = ledBuffer[i].ob;
  }
  socket.emit("update", leds);
  syncLeds();
}

function animate(socket, leds) {
  if (!animation.running) {
    return;
  }
  if (animation.step == 0) {
    // save old values
    for (i = 0; i < leds.length; i++) {
      ledBuffer[i].or = leds[i].r;
      ledBuffer[i].og = leds[i].g;
      ledBuffer[i].ob = leds[i].b;      
      ledBuffer[i].r = leds[i].r;
      ledBuffer[i].g = leds[i].g;
      ledBuffer[i].b = leds[i].b;       
    } 
    // compute deltas
    for (i = 0; i < leds.length-1; i++) {
      ledBuffer[i].dr = (ledBuffer[i+1].or - ledBuffer[i].or) / MAX_STEPS;
      ledBuffer[i].dg = (ledBuffer[i+1].og - ledBuffer[i].og) / MAX_STEPS;
      ledBuffer[i].db = (ledBuffer[i+1].ob - ledBuffer[i].ob) / MAX_STEPS;
    }
    ledBuffer[leds.length-1].dr = (ledBuffer[0].or - ledBuffer[leds.length-1].or) / MAX_STEPS;
    ledBuffer[leds.length-1].dg = (ledBuffer[0].og - ledBuffer[leds.length-1].og) / MAX_STEPS;
    ledBuffer[leds.length-1].db = (ledBuffer[0].ob - ledBuffer[leds.length-1].ob) / MAX_STEPS;
    animation.step = MAX_STEPS;
    socket.emit("update", leds);
    socket.broadcast.emit("update", leds);
  }
  for (i = 0; i < leds.length; i++) {
    ledBuffer[i].r += ledBuffer[i].dr;
    ledBuffer[i].g += ledBuffer[i].dg;
    ledBuffer[i].b += ledBuffer[i].db;
    leds[i].r = Math.round(ledBuffer[i].r); 
    leds[i].g = Math.round(ledBuffer[i].g); 
    leds[i].b = Math.round(ledBuffer[i].b);
    //leds[i].b = Math.max(leds[i].b, 0.0); 
    //console.log("i: " + i + ", " + leds[i].b);
  }
  animation.step--;
  syncLeds();
  if (animation.running) {
    setTimeout(function() { 
      animate(socket, leds); 
    }, 100);
  }
}
*/

// Register socket handlers
exports.registerSocketHandlers = function(socket) {
  socket.on("change:led", function(data) {
    // Massage input value
    var x = parseInt(data.x);
    var y = parseInt(data.y);
    var r = parseInt(data.r);
    var g = parseInt(data.g);
    var b = parseInt(data.b);
    r = r < 0 ? 0 : (r > 255 ? 255 : r);
    g = g < 0 ? 0 : (g > 255 ? 255 : g);
    b = b < 0 ? 0 : (b > 255 ? 255 : b);

    changeLed(socket, x, y, r, g, b);
  });

  socket.on("off", function(data) {
    grid.off();
  });

  //socket.on("startAnimation", function(data) {
  //  startAnimation(socket, leds);
  //});

  //socket.on("stopAnimation", function(data) {
  //  stopAnimation(socket);
  //});
}

// Register http handlers
exports.registerHttpHandlers = function(app) {
  app.get('/leds', renderLeds);
}

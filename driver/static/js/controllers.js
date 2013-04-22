'use strict';

var LedsJson, ListEffectsJson;

blink

	.controller('Layers', function(){
		$scope.layers = [];
		$scope.layerOrder = []; //Index of layer in layers array ordered by index of this array. Get it?
	})
	
	.controller('Library', function(){
		$scope.assets;
	})
	
	.controller('Preview', function(){
		
	});

/* Controllers */	
function LedCtrl($scope, $http, socket, $timeout, Effects, Leds, Grid) {

  var mouseDown = false;
  var currentLed;
  var lastX = 0;
  var lastY = 0;
  var numPixelsX = 60;
  var numPixelsY = 51;

  $scope.leds, $scope.effects, $scope.layers, $scope.searchFilters, $scope.scale = 1;

	var options;

  // Let's get an effects list  via the Effects service.
	// var effect = Effects.get();
	ListEffectsJson = function(data) {
	    $scope.effects = data;
			for(var i=0;i<$scope.effects.length;i++){
				for(var k=0;k<$scope.effects[i].options.length;k++){
					$scope.effects[i].options[k].current = $scope.effects[i].options[k].default;
				}
			}
			console.log($scope.effects);
	}
	var url = "http://192.168.1.6:8888/effects";
	$http.jsonp(url);
	
	//Let's get the LED's via the Leds service.
	// var leds = Leds.get();
	LedsJson = function(data) {
	    $scope.leds = data;
			console.log('Updating LED Data');
	}
	// 
	var updateLeds = $timeout(function myFunction() {
		    // do sth
		var url = "http://192.168.1.6:8888/leds";
		// console.log('timeout');
		$http.jsonp(url);
	     updateLeds = $timeout(myFunction, 2000);
	 },1);
	
	$scope.toggleFilter = function(filter){
		filter.on = filter.on ? false : true; //toggle
	}

  // fetch all effects from server at startup
  // $scope.effects = Effects.get();

  $scope.turnOff = function() {
    socket.emit("off", {});
  }

	$scope.registerEffect = function(effect) {
		socket.emit("off", {});
    socket.emit("effect:register", effect);
  }

  // submit a changed led via socket
  $scope.submitLed = function(led) {
    socket.emit("change:led", {
      x: led.x, 
      y: led.y, 
      rgb: led.rgb
    });
  }

  // // handle incoming change events
  socket.on("changed:led", function(data) {
    var index = (data.y * numPixelsX) + data.x;
	  $scope.leds[index].rgb = data.rgb;
  });

  socket.on("update", function(data) {
    $scope.leds = data;
		if(console) console.log('Socket');
  });

	socket.on('connect', function(){
		if(console) console.log('Connected to socket');
	});

  //--- mouse events -----

  // $scope.mouseMove = function(event) {
  //   onLedMove(event.clientX, event.clientY);
  // }
  // 
  // $scope.mouseDown = function(led, event) {
  //   onLedDown(led, event.clientX, event.clientY);
  //   event.preventDefault();
  // }
  // 
  // $scope.mouseUp = function(event) {
  //   mouseDown = false;
  // }
  // 
  // $scope.mouseOut = function(event) {
  //   if (typeof event !== "undefined" && event.relatedTarget.id == "body") {
  //     mouseDown = false;
  //   }
  // }

  //--- touch events on mobile -----

  $scope.touchStart = function(led, event) {
    onLedDown(led, event.touches[0].clientX, event.touches[0].clientY);
  }

  $scope.touchMove = function(event) {
    onLedMove(event.touches[0].clientX, event.touches[0].clientY);
    event.preventDefault();
  }

  function onLedDown(led, clientX, clientY) {
    mouseDown = true;
    lastX = clientX;
    lastY = clientY;
    var index = (led.y * numPixelsX) + led.x;
    currentLed = $scope.leds[index];
    if (typeof currentLed.hue === "undefined") {
      currentLed.hue = 0.5;
      currentLed.light = 0.5;
    }
  }

  function onLedMove(clientX, clientY) {
    if (mouseDown) {
      var deltaX = (clientX - lastX) / 200;
      var deltaY = (clientY - lastY) / 100;
      var newHue = currentLed.hue + deltaX;
      var newLight = currentLed.light + deltaY;
      currentLed.hue = (newHue > 0.0 && newHue < 1.0) ? newHue : currentLed.hue;
      currentLed.light = (newLight > 0.0 && newLight < 1.0) ? newLight : currentLed.light;
      currentLed.rgb = hsvToRgb(currentLed.hue, 1.0, currentLed.light);
      $scope.submitLed(currentLed);
      lastX = clientX;
      lastY = clientY;
    }
  }

  function hsvToRgb(h, s, v){
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
  }
}


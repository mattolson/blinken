'use strict';

var app = angular.module('blinken', ['teTouchevents','ngResource'])

	.factory('socket', function ($rootScope) {
    var socket = io.connect('192.168.1.6:8888');
		// var socket = io.connect('localhost:8888');
    return {
      on: function (eventName, callback) {
						socket.on(eventName, function () {  
          		var args = arguments;
          		$rootScope.$apply(function () {
            		callback.apply(socket, args);
          		});
						});
      		},
      emit: function (eventName, data, callback) {
							socket.emit(eventName, data, function () {
          			var args = arguments;
          			$rootScope.$apply(function () {
            		if (callback) {
              		callback.apply(socket, args);
            		}
          		});
						})
     			}
  	};
  })
	
	.factory('Leds', function ($resource) {
		var data = null;
		var Leds = $resource('http://192.168.1.6:8888/leds', {8888: ':8888'} , { get: {method: 'JSONP'} });
		// var Leds = $resource('http://localhost:8888/leds.jsonp', {8888: ':8888'} ,{ get: {method: 'JSONP'} } ); //for local testing.
				return Leds;
	})
	
	.factory('Effects', function ($resource) {
		var Effects = $resource('http://192.168.1.6:8888/effects', {8888: ':8888'} , { get: {method: 'JSONP'} });
		// var Effects = $resource('http://localhost:8888/effects.jsonp', {8888: ':8888'} ,{ get: {method: 'JSONP'} } ); //for local testing.
				return Effects;
	});
	// // TEMPORARY (until we have an interface for setting options)
	
	//   if (effect == 'throb') {
	//     options['period'] = 40;
	//     options['start_color'] = [0,0,0];
	//     options['end_color'] = [255,255,255];
	//   }
	//   else if (effect == 'color_wipe') {
	//     options['period'] = 40;
	//     options['color'] = [255,0,0];
	//   }
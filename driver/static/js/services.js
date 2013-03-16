'use strict';

var app = angular.module('app', ['teTouchevents','ngResource'])

	.factory('socket', function ($rootScope) {
    // var socket = io.connect('192.168.0.106:8888');
		var socket = io.connect('localhost:8888');
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
		alert('hellow');
		// var Leds = $resource('http://192.168.0.106:8888/leds', {8888: ':8888'} , { get: {method: 'JSONP'} });
		var Leds = $resource('http://localhost:8888/leds.jsonp', {8888: ':8888'} ,{ get: {method: 'JSONP'} } ); //for local testing.
				return Leds;
	})
	
	.factory('Effects', function ($resource) {
		// var Effects = $resource('http://192.168.0.106:8888/effects', {8888: ':8888'} , { get: {method: 'JSONP'} });
		var Effects = $resource('http://localhost:8888/effects.jsonp', {8888: ':8888'} ,{ get: {method: 'JSONP'} } ); //for local testing.
				return Effects;
	})
	
	.directive('documentwidth', function(){
		return {
			// restrict: 'E',
			link : function($scope, $element){
				console.log('documentwidth directive controller.')
				//
				console.log(document.width+'*'+document.height);
				//
				$scope.ledBounds = document.height/60 * $scope.scale;
				$scope.ledPadding = Math.round($scope.ledBounds/2/2);
				$scope.ledPixel = Math.round($scope.ledBounds/2);
				
				$scope.ledRes = Math.round($scope.ledBounds+($scope.ledPadding*2));
				
				$scope.ledsWidth = $scope.ledRes*51;
				
				console.log('docheight:'+document.height+' bounds:'+$scope.ledBounds+' padding:'+$scope.ledPadding+' pixel:'+$scope.ledPixel+' res:'+$scope.ledRes);
				
			}
		}
	})
	
	.directive('tabs', function() {
	    return {
	      restrict: 'E',
	      transclude: true,
	      scope: {},
	      controller: function($scope, $element) {
	        var panes = $scope.panes = [];

	        $scope.select = function(pane) {
	          angular.forEach(panes, function(pane) {
	            pane.selected = false;
	          });
	          pane.selected = true;
	        }

	        this.addPane = function(pane) {
	          if (panes.length == 0) $scope.select(pane);
	          panes.push(pane);
	        }
	      },
	      template:
	        '<div class="tabbable">' +
	          '<ul class="nav nav-tabs">' +
	            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
	              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
	            '</li>' +
	          '</ul>' +
	          '<div class="tab-content" ng-transclude></div>' +
	        '</div>',
	      replace: true
	    };
	  })
		.directive('pane', function() {
	    return {
	      require: '^tabs',
	      restrict: 'E',
	      transclude: true,
	      scope: { title: 'bind' },
	      link: function(scope, element, attrs, tabsCtrl) {
	        tabsCtrl.addPane(scope);
	      },
	      template:
	        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
	        '</div>',
	      replace: true
	    };
	  })	
		.directive('slider', function() {
		    return {
		        restrict:'A',
		        link:function(scope,element,attrs){
		           // undefined attrs on the element will use the jquery UI defaults	
		           element.slider({
		                min: attrs.min,
		                max: attrs.max,
		                value: attrs.value,
		                step: attrs.step,
		                slide: function( event, ui ) {
		                    if(ui.value == 3){
		                        $(this).find('a').css('margin-left','-31%')
		                    }else if(ui.value == 2){
		                        $(this).find('a').css('margin-left','-15%')
		                    }else if(ui.value == 1){
		                        $(this).find('a').css('margin-left','0%')
		                    }else{
		                        $(this).find('a').css('margin-left','-15%')
		                    }
		            		if(event.target.id =="slider1"){
		            			scope.hello = ui.value;	
		            		}else if(event.target.id == "slider2"){
		            			scope.goodbye = ui.value;
		            		}
		                scope.$apply();
		            }
		            });
		        }
		    };
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
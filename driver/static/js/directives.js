var blink = angular.module('blinken', ['wijmo']);

blink

	.directive('ngIf', function() {
	    return {
	        link: function(scope, element, attrs) {
	            if(scope.$eval(attrs.ngIf)) {
	                // remove '<div ng-if...></div>'
	                element.replaceWith(element.children())
	            } else {
	                element.replaceWith(' ')
	            }
	        }
	    }
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
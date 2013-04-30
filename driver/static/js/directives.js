'use strict';

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
	
	.directive('uiSlider',['ui.config', function(uiConfig) {
	    'use strict';
	    uiConfig.uiSlider = uiConfig.uiSlider || {}; 
	    return {
	        restrict: 'A',
         scope: {
             values: '=ngModel',
						 option: '=option'
         },
         link:function(scope,elm,$attrs,uiEvent ) {

          var expression,
          options = {
            range: true,
            values: scope.values,
            slide: function(event,ui){
              scope.$apply(function(){
						 		scope.option.current = ui.value;
            	})
						}
          };
         
				 if ($attrs.uiSlider) {
           expression = scope.$eval($attrs.uiSlider);
         } else {
           expression = {};
         }

          //Set the options from the directive's configuration
         angular.extend(options, uiConfig.devCalendar, expression);
         // console.log(options);
         elm.slider(options);
         }
     };
	}])
	
	.directive('asset', function(){
		return {
			link: function($scope, el, attrs){
				var type = attrs.assetType;
				if(!type) type = 'generator'
				if(!includes($scope.searchFilters, type)) $scope.searchFilters.push({ 'name' : type, 'on' : true});	
			}
		}
	})
	
	.directive('masonry', function ($compile, $timeout) {
	    return {
	        restrict: 'AC',
	        link: function ($scope, elem, attrs) {
						$scope.$watch('loaded', function(){
							// elem.html($compile(elem.html())($scope));
							// if($scope.loaded === true) elem.parents('section:first').masonry('reload'); 
								if($scope.loaded === true) elem.parents('section:first').masonry({
									itemSelector: '.block',
									columnWidth: function( containerWidth ) {
									    return containerWidth / 5;
									  }
								}); 
						});
	 					
	           // elem.imagesLoaded(function () {      
	           // 	               // console.log(elem.html());
	           // 	              
	           // 	           });
	        }
	    };        
	})
	
	.directive('searchFilter', function( $compile){
		return {
			link: function($scope, el, attrs){
				$scope.$watch('searchFilters', function(){
					var $list = $('ul', el);
					var $li = angular.element('<li ng-repeat="filter in searchFilters" click="toggleFilter(filter.on)">{{filter.name}}</li>');
					var html = $compile($li)($scope);
					$list.html(html);
				});
			}
		}
	})
	
	.directive('spectrum', function() {
	  return {
	    // scope: { color: '=' },
	    link: function( scope, elem, attrs ) {
	      // scope.$watch('c', function( pos ) {
	      // 	        elem.animate({ 'margin-left': +pos + basePos  }, 'slow');
	      // 	      });
				var opts = scope.$eval(attrs.spectrum);
				$(elem).spectrum({
				    color: opts.color
						// showInput: true,
				    // className: 'color',
				    // 				    showInitial: true,
				    // 				    showPalette: true,
				    // 				    showSelectionPalette: true,
				    // 				    maxPaletteSize: 10,
				    // 				    preferredFormat: "hex",
				    // 				    localStorageKey: "spectrum.demo",
				    // 				    move: function (color) {
				    // 
				    // 				    },
				    // 				    show: function () {
				    // 
				    // 				    },
				    // 				    beforeShow: function () {
				    // 
				    // 				    },
				    // 				    hide: function () {
				    // 
				    // 				    },
				    // 				    change: function() {
				    // 
				    // 				    },
				});
	    }
	  };
	});
	
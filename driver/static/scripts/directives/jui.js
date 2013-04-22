'use strict';

describe('Module: jui', function () {
    beforeEach(module('jui'));
    beforeEach(function(){
        this.addMatchers({
            toBeEqual: function(expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    describe('Module: jui:draggable', function () {
        var element;

        it('should apply the zero-configuration usabe of draggable', inject(function ($rootScope, $compile) {
            element = angular.element('<div jui:draggable></div>');
            element = $compile(element)($rootScope);
            expect($(element).is('.ui-draggable')).toBeTruthy();
        }));

        it('should trigger dragcreate event', inject(function ($rootScope, $compile) {
            element = angular.element('<div jui:draggable event:create="onCreate"></div>');

            $rootScope.hello = 'Hello';
            $rootScope.onCreate = function () {}

            spyOn($rootScope, 'onCreate').andCallThrough();
            element = $compile(element)($rootScope);

            expect($rootScope.onCreate).toHaveBeenCalled();
            expect($rootScope.onCreate.calls[0].args[0].type).toBe('dragcreate');
        }));

    });

    describe('Module: jui:droppable', function () {
        var element;

        it('should apply the zero-configuration usage of draggable plugin', inject(function ($rootScope, $compile) {
            element = angular.element('<div jui:droppable></div>');
            element = $compile(element)($rootScope);
            expect($(element).is('.ui-droppable')).toBeTruthy();
        }));

        it('should override all options if them was defined on the DOM element', inject(function ($rootScope, $compile) {
            element = angular.element('<div jui:droppable ' +
                'opt:disabled="true" ' +
                'opt:activeClass="\'ui-state-highlight\'" ' +
                'opt:accept="\'.test\'" ' +
                'opt:addClasses="false" ' +
                'opt:greedy="true" ' +
                'opt:hoverClass="true" ' +
                'opt:tolerance="\'pointer\'" ' +
                'opt:scope="\'tasks\'"></div>');
            element = $compile(element)($rootScope);

            expect($(element).droppable('option')).toBeEqual({
                disabled : true,
                accept : '.test',
                activeClass : 'ui-state-highlight',
                addClasses : false,
                greedy : true,
                hoverClass : true,
                scope : 'tasks',
                tolerance : 'pointer'
            });
        }));

        it('should modify options of the plugin when something is changed on the scope (raw)', inject(function($rootScope, $compile){
            $rootScope.activeClass = 'ui-state-highlight';

            element = angular.element('<div jui:droppable opt:activeClass="activeClass"></div>');
            element = $compile(element)($rootScope);

            expect($(element).droppable('option', 'activeClass')).toBe('ui-state-highlight');

            $rootScope.activeClass = 'ui-state-highlight2';
            $rootScope.$digest();
            expect($(element).droppable('option', 'activeClass')).toBe('ui-state-highlight2');
        }));

        it('should modify options of the plugin when something is changed on the scope (function)', inject(function($rootScope, $compile){
            $rootScope.activeClass = function(){
                return 'ui-state-highlight';
            };

            element = angular.element('<div jui:droppable opt:activeClass="activeClass()"></div>');
            element = $compile(element)($rootScope);

            expect($(element).droppable('option', 'activeClass')).toBe('ui-state-highlight');

            $rootScope.activeClass = function(){
                return 'ui-state-highlight2';
            };
            $rootScope.$digest();
            expect($(element).droppable('option', 'activeClass')).toBe('ui-state-highlight2');
        }));
    });

    describe('Module: jui:resizable', function () {
        var element;

        it('should apply the zero-configuration usage of resizable plugin', inject(function ($rootScope, $compile) {
            element = angular.element('<div jui:resizable></div>');
            element = $compile(element)($rootScope);
            expect($(element).is('.ui-resizable')).toBeTruthy();
        }));

    });

});

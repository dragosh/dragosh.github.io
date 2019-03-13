'use strict';

var Widget = require('./widget.mock'); // mock the b$ widget class
var Welcome = require('../../index'); // main file

var ngModule = window.module; // alias
var ngInject = window.inject; // alias


xdescribe('Welcome Application', function() {
    beforeEach(function() {
        this.welcome = Welcome(new Widget()).render();
        ngModule(this.welcome.module.name);
        ngInject(function($controller,  $rootScope) {
            var scope = $rootScope.$new();
            this.createController = function(ctrlName) {
                return $controller(ctrlName, {scope : scope});
            };
        })
    });

    it('should be defined', function() {
        expect(this.welcome).toBeDefined();
    });

    xdescribe('Main Controller', function() {
        beforeEach(function() {
            this.mainCtrl = this.createController('MainCtrl');
        })
        it('should have a main controller', function() {
            expect(this.mainCtrl).toBeObject();
        });

        it('should contain a animation preference', function() {
            expect(this.mainCtrl.animation).toBe('parallax');
        });
    });

});

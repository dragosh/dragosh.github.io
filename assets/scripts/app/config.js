// Set the require.js configuration for your application.
require.config({

	// baseUrl: '',
	// Initialize the application with the main application file
	deps: ['main'],
	paths: {
		// Bower directory
		vendors: '../vendors',
		libs: '../components',
		// Libraries
		jquery: '../components/jquery/jquery',
		backbone: '../components/backbone/backbone',
		underscore: '../components/underscore/underscore',
		handlebars: '../components/handlebars/handlebars',
		layoutmanager: '../components/layoutmanager/backbone.layoutmanager'

	},

	shim: {
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},

		underscore: {
			exports: '_'
		},

		handlebars: {
			exports: 'Handlebars'
		},
		layoutmanager: {
			deps: ['backbone', 'jquery']
		},
		//plugins / vendors
		'vendors/jquery.imagesloaded': {
			deps: ['jquery']
		},
		'vendors/jquery.easing': {
			deps: ['jquery']
		},
		'vendors/jquery.timemachine': {
			deps: ['jquery']
		},
		'vendors/jquery.rcarousel': {
			deps: ['jquery']
		},
		'vendors/jquery.rslider': {
			deps: ['jquery']
		},
		'vendors/jquery.touchSwipe': {
			deps: ['jquery']
		},
		'vendors/froogaloop': {
			deps: []
		},
		'vendors/fastclick': {
			deps: []
		}
	},
	map: {

	}

});

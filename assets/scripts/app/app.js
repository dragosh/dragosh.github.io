define([
    'handlebars', // template engine
    'helpers/handlebars_helper', // template engine helpers
    'layoutmanager', // backbone view manager plugin
    'vendors/jquery.imagesloaded',
    'vendors/jquery.easing',
    'vendors/jquery.rslider',
    'vendors/jquery.rcarousel',
    'vendors/jquery.timemachine',
    'vendors/jquery.touchSwipe', //touch events
    'vendors/fastclick', //remove the click delay on touch devices
    'vendors/froogaloop'

],
function(Handlebars) {
    'use strict';
/*
|--------------------------------------------------------------------------
|   Create the Main app Object Here
|--------------------------------------------------------------------------
*/
    var app = {

        root: '/',
        config:{
            'projectsUrl': 'assets/data/projects.json'
        },// Default Config
        player: null,
        dom: {
            nav : '#nav',
            main: '#main',
            page: '#page',
            tl  : '#timeline'
        }, //store DOM elements for later use
        eventBus: _.extend({}, Backbone.Events), //Event Bus

        onBeforeRender: function(){
            //get the window width / height
            this.setViewport();
        },
        onDomChangeTitle: function (title) {
            $(document).attr('title', title);
        },
        onAddProject: function(Views,collection) {

            app.timeLineView = new Views.ProjectsTimeLine({
                serialize: {
                    projects: collection.toJSON()
                }
            });

            collection.forEach( function(modelItem){
                app.layout.projectsViews.push(new Views.Project({model: modelItem}));
            });
        },
        setViewport: function() {
            var $nav = $(app.dom.nav);
            app.viewPort = {
                w: $(window).innerWidth(),
                h: $(window).innerHeight()
            };
            $nav.css({
                top:  (app.viewPort.h / 2) - ( $nav.height() / 2 )
            }).fadeIn('slow');
        },
    };


    app.eventBus.on('app:addProject',app.onAddProject);
    //Event Aggregator listner
    app.eventBus.on('layout:beforeRender', app.onBeforeRender , app);
    //Event Aggregator trigger
    app.eventBus.trigger('domchange:title', 'New page title');

    $(window).on('resize',app.setViewport);


/*
|--------------------------------------------------------------------------
|   Don't modify bellow unless you know what you are doing
|--------------------------------------------------------------------------
*/
    //create the cache object for templates
    var JST = window.JST = window.JST || {};

    Backbone.Layout.configure({

        manage: true, // Set all View's to be managed by LayoutManager.

        fetch: function(path) {
            var _compile = function(contents) {
                return (! _.isEmpty(contents) ) ? Handlebars.compile( contents ) : null;
            };

            if (JST[path]) {
                return JST[path];
            }
            // if is starting with # then fetch it from the DOM
            if(! _.isNull(path.match(/^#(.+)$/))) {
                JST[path] =  _compile($(path).html());
                return JST[path];
            }

            path = '/assets/templates/' + path + '.html';
            // To put this method into async-mode, simply call `async` and store the
            // return value (callback function).

            var done = this.async();
            $.get(path, function(contents) {
                JST[path] = _compile(contents);
                done(JST[path]);

            }, 'text');

        },
        render: function(template, context) {
            return template(context);

        }
    });

    /*
    |--------------------------------------------------------------------------
    |  Add google analitycs plugin  https://github.com/kendagriff/backbone.analytics
    */
    (function() {

        var _loadUrl = Backbone.History.prototype.loadUrl;

        Backbone.History.prototype.loadUrl = function(fragmentOverride) {

            var matched = _loadUrl.apply(this, arguments),
                fragment = this.fragment = this.getFragment(fragmentOverride);

            if (!/^\//.test(fragment)) { fragment = '/' + fragment; }

            //console.log('_trackPageview:' , fragment);
            if (window._gaq !== undefined) { window._gaq.push(['_trackPageview', fragment]); }

            return matched;
        };

    }).call(this);

    /*
    |--------------------------------------------------------------------------
    | Patch Backbone route to trim '/' from the fragment
    */
    (function(_getFragment){

        Backbone.History.prototype.getFragment = function(){
            return _getFragment.apply(this, arguments).replace(/^\/+|\/+$/g, '');
        };

    })(Backbone.History.prototype.getFragment);

    // Mix Backbone.Events, and layout management into the app object.
    return _.extend(app, {

        useLayout: function(options) {
            var defaults = {};
            return new Backbone.Layout(_.extend(defaults, options));
        }



    }, Backbone.Events);

});

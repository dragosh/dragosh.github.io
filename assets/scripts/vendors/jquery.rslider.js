;(function ( $, window, document, undefined ) {

    'use strict';

    var pluginName = 'rslider',

        defaults = {
            namespace:          'rs',
            maxwidth:           800,
            maxheight:          450,
            progressBarWidth:   458,
            progressBarHeight:  11,
            start:              0,
            controls:           true,
            item:               'li',
            autoplay:           2000,// delay between slides, if 0 then autoplay is stoped
            speed:              500,
            ease:               'linear',
            onReady:            function(){},
            onStart:            function(){},
            onEnd:              function(){}
        },
        methods = {

            //initilize the plugin
            init: function () {

                this._items     = this.$el.find(this.options.item).length;
                this._itemW     = this.options.maxwidth;
                this._itemH     = this.options.maxheight;
                this._current   = parseInt(this.options.start,10);
                this._interval  = 0;
                this._isPlaying = false;
                this._call('init',this._items);
                this.$el.trigger(this.options.namespace + ':init');
                //
                this.$el.find(this.options.item).css('float','left');
                //Create
                this._create();
                //Preload
                this._preload();
                //Start once the preloader is done
                this.$el.one(this.options.namespace + ':ready', function(){

                    this.play();

                    if(this.options.start > 0) {
                        this.slide(this.options.start);
                    }
                    //Events Listner
                    if(this.options.controls === true) {
                        //prev
                        this.$prev.on('click',function(ev) {
                            this.slide('prev');
                            ev.preventDefault();
                        }.bind(this));

                        //next
                        this.$next.on('click',function(ev) {
                            this.slide('next');
                            ev.preventDefault();
                        }.bind(this));
                    }

                    //over & out
                    this.$el.add('.controls').on('mouseenter mouseleave',function(ev) {
                        switch(ev.type) {
                            case 'mouseenter': this.pause();
                                break;
                            default: this.play();
                        }
                    }.bind(this));

                }.bind(this));
            },
            //Slide method
            slide: function(dir) {

                //set the current position
                var pos = this._current;
                if(typeof dir === 'string') {
                    pos += ( ~~(dir === 'next')  || -1);
                    //check for the last element
                    this._current = ( pos < 0 ) ? this._items - 1 :  pos % this._items;
                } else if(typeof dir === 'number') {
                    //if is valid slide number
                    if( dir < 0 || dir > this._items) {
                        throw new Error('Unknown slide number');
                    } else{
                        this._current = dir;
                    }
                } else{
                    //throw error
                    throw new Error('Unknown slide number');
                }
                this._transition();

            },
            //Pause the slideshow
            pause: function() {
                clearInterval(this._interval);
                this._interval = 0;
                this._isPlaying = false;
            },
            // Start the slideshow
            play: function() {
                if(typeof this.options.autoplay === 'number' && this.options.autoplay > 0) {
                    this._isPlaying = true;
                    this._interval = setInterval(function(){
                        this.slide('next');
                    }.bind(this),this.options.autoplay);
                }
            },


            _preload: function() {

                if($.isFunction( $.fn.imagesLoaded ) ) {
                    // show progess bar
                    this.$progress.fadeIn();
                    //this.$el.prevAll('.controls').andSelf().hide();

                    this.$el.imagesLoaded({
                        callback: function(){
                            this._call('ready',this._items);
                            this.$el.trigger(this.options.namespace + ':ready');
                            this.$progress.fadeTo('slow', 0, function() {
                                this.$el.prevAll('.controls').fadeIn();
                            }.bind(this));

                        }.bind(this),
                        progress: function (isBroken, $images, $proper, $broken) {
                            var pregressW = Math.round( ( ( $proper.length + $broken.length ) * 100 ) / $images.length ) + '%';
                            this.$progress.children().css({ width: pregressW});
                        }.bind(this)
                    });

                } else {
                    // show progress fallback
                    // display the preloader for now
                }
            },

            //creates the Dom Wrapper & Slider
            _create: function() {
                // Build Wrapper
                this.$wrapper = $('<div/>',{
                    css: {
                        position: 'relative',
                        overflow: 'hidden',
                        width: this._itemW,
                        height: this._itemH
                    },
                    'class': this.options.namespace + '-wrapper'
                });

                // Hide it Wrapp it
                this.$el.wrap(this.$wrapper);

                // create progress bar
                this._createProgress();
                // create controls
                if(this.options.controls === true) {
                    this._createControls();
                }
                //set slider width
                this.$el.width(this._itemW * this._items);

            },

            //Create progress bar and append it to wrapper
            _createProgress: function(){

                this.$progress = $('<div />',{
                    css:{
                        width: this.options.progressBarWidth,
                        height: this.options.progressBarHeight,
                        //left: Math.round(this._itemW / 2) - ( this.options.progressBarWidth / 2),
                        position: 'absolute'
                    },
                    'class': this.options.namespace + '-progress'
                });
                if( $.isFunction( $.fn.imagesLoaded ) ) {
                    $('<div class="bar" />')
                        .height(this.options.progressBarHeight)
                        .width(0)
                        .appendTo(this.$progress);
                }
                this.$progress.hide().insertBefore(this.$el);
            },
            //Create conrols (arrows or navigation items) append it to wrapper
            _createControls: function(){
                //create the arrows
                var cssProp = {
                    position: 'absolute',
                    top:0,
                    left:'auto',
                    width: 50,
                    height:'100%',
                    cursor:'pointer',
                    textAlign: 'center',
                    lineHeight: this._itemH + 'px'
                };
                this.$prev = $('<a/>',{
                    text: 'Prev',
                    'class': 'controls prev',
                    css: cssProp
                });
                //set it to right
                cssProp.right = 0;
                this.$next = $('<a/>',{
                    text: 'Next',
                    'class': 'controls next',
                    css: cssProp
                });
                //add the arrows to the wrapper
                this.$prev.add(this.$next).insertBefore(this.$el);
            },
            // transition method
            _transition: function() {
                this._call('start',this._current);
                this.$el.trigger(this.options.namespace + ':start');
                this.$el.stop().animate({
                    marginLeft: -(this._current * this._itemW)
                }, this.options.speed,this.options.ease,
                    function(){
                        this._call('end',this._current);
                        this.$el.trigger(this.options.namespace + ':end');
                    }.bind(this)
                );
            },
            // Callback function definition
            _call: function(fn) {
                var clb = 'on'+fn.charAt(0).toUpperCase() + fn.slice(1); //append the on prefix for callback functions
                var args = Array.prototype.slice.call( arguments, 1 );
                if (typeof this.options[clb] === 'function') { // make sure the callback is a function
                    args.push(this.el,this);
                    this.options[clb].apply(this, args ); // brings the scope to the callback
                }
            }
        };


    function Plugin( el, options ) {
        this.el = el;
        this.$el = $(el);
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    //extend the methods
    Plugin.prototype = methods;

    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {

            return this.each(function () {

                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, 'plugin_' + pluginName)) {

                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });

        // If the first parameter is a string and it doesn't start
        // with an underscore or "contains" the `init`-function,
        // treat this as a call to a public method.
        } else if ( typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call
            // to make it possible
            // to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);
                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                    $.data(this, 'plugin_' + pluginName, null);
                }
            });

            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };

})(jQuery, window, document);

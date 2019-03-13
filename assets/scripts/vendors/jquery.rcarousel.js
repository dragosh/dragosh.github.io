;(function ( $, window, document, undefined ) {

    "use strict";

    var pluginName = 'rcarousel',

        defaults = {
            namespace:          'rc',
            minWidth:           800,
            itemWidth:          160,
            itemHeight:         90,
            progressBarWidth:   100,
            progressBarHeight:  2,
            start:              0,
            item:               'li',
            speed:              600,
            ease:               'linear',
            onClick:            function(){}

        },
        methods = {

            //initilize the plugin
            init: function () {
                this._callback('init',this._items);
                this.$el.trigger(this.options.namespace + ':init');
                this._width = (function() {
                    // TO DO  for responsiveness
                    return this.options.minWidth;
                }).call(this);

                this._items     = this.$el.find(this.options.item).length;
                this._itemW     = this.options.itemWidth;
                this._itemH     = this.options.itemHeight;
                //how many items fit in the carousel width
                this._fitCount  = Math.floor( this._width / this._itemW );
                this._pages     = Math.floor(this._items / this._fitCount);
                this._current   = parseInt(this.options.start,10);
                this._currentPage = parseInt(this.options.start/this._fitCount, 10);
                //Create
                this._create();
                //Preload
                this._preload();
                //select the start element
                this.select(this._current);
                //Start once the preloader is done
                this.$el.one(this.options.namespace + ":ready", function(){

                    this.attachEvents();

                }.bind(this));
            },
            //Select item method
            select: function(step) {

                var pos = this._current;
                var dir = step;
                if(typeof step === 'string') {
                    pos += ( ~~(step === 'next')  || -1);
                    //check for the last element
                    this._current = ( pos < 0 ) ? this._items - 1 :  pos % this._items;
                } else if(typeof step === 'number') {
                    dir = 'next';
                    //if is valid slide number
                    if( step < 0 || step > this._items) {
                        throw new Error("Invalid slide number");
                    } else{
                        this._current = step;
                    }
                } else{
                    //throw error
                    throw new Error("Invalid slide number");
                }
                //first deselect the rest
                this.$el.find(this.options.item).siblings().removeClass('selected');
                //get the element to pass it to callback
                var $item = this.$el.find(this.options.item).eq(this._current);
                //selecte it
                $item.addClass('selected');
                //trigger the selected callback
                this._callback('selected',this._current,$item);

                // Check the slide page
                var page = Math.floor(this._current/this._fitCount);
                //log(page);
                if( page != this._currentPage ) {
                    this.selectPage(dir);
                }


            },
            // slide to page functionality almost same as select exept deals with pages insstead of items
            selectPage: function(step) {
                var page = this._currentPage;
                var dir = step;
                if(typeof step === 'string') {
                    page += ( ~~(step === 'next')  || -1);
                    if( page < 0 ) {
                        if(this._items % this._fitCount === 0 ) {
                            this._currentPage = this._pages - 1
                        } else {
                            this._currentPage = this._pages;
                        }
                    }
                    else{
                        if(this._items % this._fitCount === 0 ) {
                            this._currentPage = page % this._pages;
                        } else{
                            this._currentPage = ( this._currentPage < this._pages || step =='prev') ? page : 0;
                        }
                    }
                } else if(typeof step === 'number') {
                    dir = 'next';
                    if( step < 0 || step > this._pages) {
                        throw new Error("Invalid page number");
                    } else{
                        page = ( step >= this._pages ) ? step - 1 : step;
                        this._currentPage = page;
                    }
                }else{
                    //throw error
                    throw new Error("Invalid page number");
                }

                var coord = ( - this._currentPage) * (this._itemW * this._fitCount);
                if(this._pages === this._currentPage) {
                    coord =  coord + ( this._fitCount - this._items % this._fitCount) * this._itemW;
                    //log(coord);
                }

                this._transition(coord);

            },

            //Initialize the events Hendlers
            attachEvents: function($el) {

                // //on element
                this.$el.find(this.options.item).on("click",function(ev) {
                    var index = $(ev.currentTarget).index();
                    this.select(index);
                    ev.preventDefault();
                }.bind(this));

            },
            //some css resets just in case
            _cssReset: function($el){
                $el.css({
                    'list-style-type':'none',
                    'margin':0,
                    'padding':0
                });
            },
            //preload images
            _preload: function() {
                if( typeof this.$progress === 'undefined') return;

                if($.isFunction( $.fn.imagesLoaded ) ) {
                    // show progess bar
                    //this.$progress.fadeIn();
                    //this.$el.hide();

                    var dfd = this.$el.imagesLoaded({
                        callback: function(){
                            this._callback('ready');
                            this.$el.trigger(this.options.namespace + ':ready');
                            this.$progress.fadeTo("slow", 0, function() {
                                this.$el.fadeIn();
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
                 //reset some styles
                this._cssReset(this.$el);
                this.$el.find(this.options.item).css({
                    'display':'inline-block',
                    'float':'left',
                    'line-height':0,
                    'width': this._itemW,
                    'height': this._itemH
                });
                // Build Wrapper
                this.$wrapper = $('<div/>',{
                    css: {
                        position: 'relative',
                        overflow: 'hidden',
                        width: this._width,
                        height: this._itemH
                    },
                    'class': this.options.namespace + '-wrapper'
                });
                // Hide it Wrapp it
                this.$el.wrap(this.$wrapper);
                // create progress bar
                this._createProgress();
                //set slider width
                this.sliderWidth = this._itemW * this._items;
                this.$el.width(this.sliderWidth);

            },

            //Create progress bar and append it to wrapper
            _createProgress: function(){
                this.$progress = $('<div />',{
                    css:{
                        width: this.options.progressBarWidth,
                        height: this.options.progressBarHeight,
                        top: Math.round(this._itemH / 2) - ( this.options.progressBarHeight / 2),
                        left: Math.round(this._width / 2) - ( this.options.progressBarWidth / 2),
                        position: 'absolute'
                    },
                    'class': this.options.namespace + '-progress'
                });

                if( $.isFunction( $.fn.imagesLoaded ) ) {
                    var $progresbar = $('<div class="bar" />')
                        .height(this.options.progressBarHeight)
                        .width(0)
                        .appendTo(this.$progress);
                }
                this.$progress.hide().insertBefore(this.$el);
            },

            // transition method
            _transition: function(coord) {

                this._callback('start',this._current);
                this.$el.trigger(this.options.namespace + ':start');
                this.$el.stop().animate({
                    marginLeft: coord
                }, this.options.speed, this.options.ease,
                    function(){
                        this._callback('end',this._current);
                        this.$el.trigger(this.options.namespace + ':end');
                    }.bind(this)
                );
            },
            // Callback function definition
            _callback: function(fn,options) {
                var clb = 'on'+fn.charAt(0).toUpperCase() + fn.slice(1); //append the on prefix for callback functions
                var args = Array.prototype.slice.call( arguments, 1 );
                if (typeof this.options[clb] === 'function') { // make sure the callback is a function
                    args.push(this,this);
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

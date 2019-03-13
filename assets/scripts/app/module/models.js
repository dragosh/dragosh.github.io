define([
    'app',
    'backbone'
],

function(app, Backbone) {

    'use strict';

    var Models = {};

    Models.Project = Backbone.Model.extend({
        //wrapp it in a fuction to prevent
        //re-evaluating every time a new instance is created
        defaults: function(){
            return{
                //define the defauls here
            };
        },
    });
    Models.Projects = Backbone.Collection.extend({
        url: app.config.projectsUrl,
        parse: function(response) {
            this.count = response.result.count;
            return response.result.data;
        }
    });



    return Models;

});

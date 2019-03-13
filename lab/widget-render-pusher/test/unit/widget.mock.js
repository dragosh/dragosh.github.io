

var Widget = module.exports = function Widget () {
     // body...
    this.loading = function(){};
    this.loaded = function(){};
};

Widget.prototype.getPreference = function(name) {
     switch (name) {
        case 'animation': return 'parallax'; break;
    }
}
Widget.prototype.setPreference = function() {}

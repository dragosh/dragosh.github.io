/*----------------------------------------------------------------*/
/* Webpack test entry point
/*----------------------------------------------------------------*/
// var mock = require('mock');
// window.gadgets = mock.gadgets;
// window.b$ = { portal: mock.Portal() };

require('angular');
require('angular-mocks');

var testsContext = [
    require.context('./', true, /^((?![\\/]node_modules|bower_components[\\/]).)*\.[Ss]pec$/),
    require.context('../../scripts', true, /^((?![\\/]node_modules|bower_components[\\/]).)*\.[Ss]pec$/),
    require.context('../../components', true, /^((?![\\/]node_modules|bower_components[\\/]).)*\.[Ss]pec$/)
];

testsContext.forEach(function(context) {
    context.keys().forEach(context);
});

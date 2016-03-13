/**
 * Angular reservation module
 * @author hmartos
 */
(function() {
	//Module definition with dependencies
	angular.module('angular.reservation', []);

})();
/**
 * Angular reservation module
 * @author hmartos
 */
(function() {
    //Directive
    angular.module('angular.reservation').directive('reservation', ['$document', '$compile', function($document, $compile) {
        return {
            restrict: 'AE',
            templateUrl: 'index.html'
        };
    }]);

})();
angular.module("angular.reservation").run(["$templateCache", function($templateCache) {$templateCache.put("index.html","<div>\r\n	<h1 class=\"my-class\">Welcome!</h1>\r\n</div>");}]);
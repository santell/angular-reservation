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
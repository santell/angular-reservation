/**
 * Reservation directive
 * @author hmartos
 */
(function() {
    //Directive
    angular.module('angular.reservation').directive('reservation', ['$document', '$compile', function($document, $compile) {
        return {
            restrict: 'E',
            controller: 'ReservationCtrl',
            controllerAs: 'reservationCtrl',
            templateUrl: 'index.html'
        };
    }]);

})();
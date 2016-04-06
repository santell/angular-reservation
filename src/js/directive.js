/**
 * Reservation directive
 * @author hmartos
 */
(function() {
    //Directive
    angular.module('hm.reservation').directive('reservation', [function() {
        return {
            restrict: 'E',
            scope: {
                datepickerOptions: '='
            },
            controller: 'ReservationCtrl',
            controllerAs: 'reservationCtrl',
            templateUrl: 'index.html'
        };
    }]);

})();
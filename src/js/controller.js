/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('angular.reservation').controller('ReservationCtrl', [reservationCtrl]);

    function reservationCtrl() {
        //Capture the this context of the Controller using vm, standing for procedureModel
        var vm = this;

        vm.selectedTab = 0;

        vm.selectedDate = new Date();


        //METHODS
        vm.onSelectDate = function() {
            vm.selectedTab = 1;
        }
    }

})();
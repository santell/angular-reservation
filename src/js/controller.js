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

        vm.date = null;
        vm.minDate = new Date();

        vm.selectedTab = 0;

    }

})();
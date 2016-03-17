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

        vm.selectedHour = "";

        //Hardcoded data
        vm.availableHours = ["10:00", "10.30", "11.30", "12.30", "13.00", "17.00", "17.30", "18.00", "18.30", "19.00"];


        //METHODS
        vm.onSelectDate = function() {
            vm.selectedTab = 1;
        }

        vm.selectHour = function(hour) {
            vm.selectedHour = hour;
            vm.selectedTab = 2;
        }
    }

})();
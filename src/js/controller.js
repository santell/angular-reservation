/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('hm.reservation').controller('ReservationCtrl', ['reservationAPIFactory', 'reservationConfig', 'reservationService', reservationCtrl]);

    function reservationCtrl(reservationAPIFactory, reservationConfig, reservationService) {
        //Capture the this context of the Controller using vm, standing for procedureModel
        var vm = this;

        vm.selectedTab = 0;
        vm.secondTabLocked = true;
        vm.thirdTabLocked = true;

        vm.selectedDate = new Date();

        vm.selectedHour = "";

        vm.userData = {};

        vm.loader = false;

        vm.dateFormat = reservationConfig.dateFormat;

        //TODO Add calendar options as a configurable option
        vm.calendarOptions = {
            minDate: new Date(),
            showWeeks: false
        };


        //METHODS
        vm.onSelectDate = function() {
            vm.secondTabLocked = false;
            vm.selectedTab = 1;
            getAvailableHours();
            vm.loader = true;
        }

        vm.selectHour = function(hour) {
            vm.thirdTabLocked = false;
            vm.selectedHour = hour;
            vm.selectedTab = 2;
        }

        vm.reserve = function() {
            reserve();
        }


        //PRIVATE METHODS

        /**
         * Get available hours for a selected date
         */
        function getAvailableHours() {
            var params = {selectedDate: vm.selectedDate};

            reservationAPIFactory.getAvailableHours(params).then(function () {
                vm.loader = false;

                var level = reservationAPIFactory.level;
                var message = reservationAPIFactory.message;

                //Success call without error
                if (level == 'SUCCESS') {
                    console.log("Success");

                    //Success call with error
                } else if(level == 'ERROR') {
                    console.log("Error");

                    //Internal server error
                } else if(level == 'SERVER_ERROR') {
                    console.log("Internal server error");

                    //Connection error
                } else if(level == 'CONNECTION_ERROR') {
                    console.log("Connection error");
                }
            });

            //Hardcoded data
            vm.availableHours = ["10:00", "10.30", "11.30", "12.30", "13.00", "17.00", "17.30", "18.00", "18.30", "19.00"];
        }

        /**
         * Do reserve POST with selectedDate, selectedHour and userData as parameters of the call
         */
        function reserve() {
            reservationService.onBeforeReserve(vm.selectedDate, vm.selectedHour, vm.userData);

            vm.loader = true;

            var params = {selectedDate: vm.selectedDate, selectedHour: vm.selectedHour, userData: vm.userData};

            reservationAPIFactory.reserve(params).then(function () {
                vm.loader = false;

                var level = reservationAPIFactory.level;
                var message = reservationAPIFactory.message;

                //Completed reserve callback
                reservationService.onCompletedReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);

                //Success
                if (level == 'SUCCESS') {
                    console.log("Success");
                    //Successful reserve calback
                    reservationService.onSuccessfulReserve(vm.selectedDate, vm.selectedHour, vm.userData);

                //Error
                } else {
                    console.log("Error");
                    //Error reserve callback
                    reservationService.onErrorReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);
                }

                //Hardcoded callbacks
                //reservationService.onSuccessfulReserve(vm.selectedDate, vm.selectedHour, vm.userData);
                //reservationService.onCompletedReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);
            });
        }
    }

})();
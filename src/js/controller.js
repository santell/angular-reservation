/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('angular.reservation').controller('ReservationCtrl', ['$filter', '$mdDialog', 'reservationAPIFactory', reservationCtrl]);

    function reservationCtrl($filter, $mdDialog, reservationAPIFactory) {
        //Capture the this context of the Controller using vm, standing for procedureModel
        var vm = this;

        vm.selectedTab = 0;
        vm.secondTabLocked = true;
        vm.thirdTabLocked = true;

        vm.selectedDate = new Date();

        vm.selectedHour = "";

        vm.userData = {};

        vm.showLoader = false;


        //METHODS
        vm.onSelectDate = function() {
            vm.showLoader = true;
            vm.secondTabLocked = false;
            vm.selectedTab = 1;
            getAvailableHours();
        }

        vm.selectHour = function(hour) {
            vm.thirdTabLocked = false;
            vm.selectedHour = hour;
            vm.selectedTab = 2;
        }

        vm.showConfirm = function(event) {
            var confirm = $mdDialog.confirm()
                .title($filter('translate')('confirmTitle'))
                .textContent($filter('translate')('confirmText', {name: vm.userData.name, selectedDate: $filter('date')(vm.selectedDate, 'dd/MM/yyyy'), selectedHour:vm.selectedHour}))
                .ariaLabel($filter('translate')('confirmTitle'))
                .targetEvent(event)
                .ok($filter('translate')('confirmOK'))
                .cancel($filter('translate')('confirmCancel'));

            $mdDialog.show(confirm).then(function() {
                //OK handler
                vm.showLoader = true;
                reserve();
            }, function() {
                //Cancel handler
                console.log("Reservation cancelled");
            });
        }


        //PRIVATE METHODS

        /**
         * Get available hours for a selected date
         */
        function getAvailableHours() {
            var params = {selectedDate: vm.selectedDate};

            reservationAPIFactory.getAvailableHours(params).then(function () {
                vm.showLoader = false;

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

                //Hardcoded data
                vm.availableHours = ["10:00", "10.30", "11.30", "12.30", "13.00", "17.00", "17.30", "18.00", "18.30", "19.00"];
            });
        }

        /**
         * Do reserve POST with selectedDate, selectedHour and userData as parameters of the call
         */
        function reserve() {
            var params = {selectedDate: vm.selectedDate, selectedHour: vm.selectedHour, userData: vm.userData};

            reservationAPIFactory.reserve(params).then(function () {
                vm.showLoader = false;

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
        }
    }

})();
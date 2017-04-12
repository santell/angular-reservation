/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('hm.reservation').controller('ReservationCtrl', ['$scope', '$filter', '$translate', 'reservationAPIFactory', 'reservationConfig', 'reservationService', reservationCtrl]);

    function reservationCtrl($scope, $filter, $translate, reservationAPIFactory, reservationConfig, reservationService) {
        //Capture the this context of the Controller using vm, standing for viewModel
        var vm = this;

        vm.selectedTab = 0;
        vm.secondTabLocked = true;
        vm.thirdTabLocked = true;

        var today = new Date();
        today.setHours(0,0,0,0); //Date at start of today
        vm.selectedDate = today;

        vm.selectedHour = "";

        vm.userData = {};

        vm.loader = false;

        vm.dateFormat = reservationConfig.dateFormat;

        vm.datepickerTemplate = reservationConfig.datepickerTemplate;
        vm.availableHoursTemplate = reservationConfig.availableHoursTemplate;
        vm.noAvailableHoursTemplate = reservationConfig.noAvailableHoursTemplate;
        vm.clientFormTemplate = reservationConfig.clientFormTemplate;

        vm.datepickerOptions = $scope.datepickerOptions;

        $translate.use(reservationConfig.language);


        //METHODS
        vm.onSelectDate = function() {
            vm.secondTabLocked = false;
            vm.selectedTab = 1;
            onBeforeGetAvailableHours();
            vm.loader = true;
        }

        vm.selectHour = function(hour) {
            vm.thirdTabLocked = false;
            vm.selectedHour = hour;
            vm.selectedTab = 2;
        }

        vm.reserve = function() {
            onBeforeReserve();
        }


        //PRIVATE METHODS

        /**
         * Function executed before get available hours function.
         */
        function onBeforeGetAvailableHours() {
            reservationService.onBeforeGetAvailableHours(vm.selectedDate).then(function () {
                getAvailableHours();

            }, function() {
                console.log("onBeforeGetAvailableHours: Rejected promise");
            });
        }

        /**
         * Get available hours for a selected date
         */
        function getAvailableHours() {
            var selectedDateFormatted = $filter('date')(vm.selectedDate, vm.dateFormat);
            var params = {selectedDate: selectedDateFormatted};

            reservationAPIFactory.getAvailableHours(params).then(function () {
                vm.loader = false;

                var status = vm.availableHoursStatus = reservationAPIFactory.status;
                var message = vm.availableHoursMessage = reservationAPIFactory.message;

                //Completed get available hours callback
                reservationService.onCompletedGetAvailableHours(status, message, vm.selectedDate);

                //Success
                if (status == 'SUCCESS') {
                    vm.availableHours = reservationAPIFactory.availableHours;
                    //Successful get available hours callback
                    reservationService.onSuccessfulGetAvailableHours(status, message, vm.selectedDate, vm.availableHours);

                //Error
                } else {
                    //Error get available hours callback
                    reservationService.onErrorGetAvailableHours(status, message, vm.selectedDate);
                }
            });
        }

        /**
         * Function executed before reserve function
         */
        function onBeforeReserve() {
            reservationService.onBeforeReserve(vm.selectedDate, vm.selectedHour, vm.userData).then(function () {
                reserve();

            }, function() {
                console.log("onBeforeReserve: Rejected promise");
            });
        }

        /**
         * Do reserve POST with selectedDate, selectedHour and userData as parameters of the call
         */
        function reserve() {
            vm.loader = true;

            var selectedDateFormatted = $filter('date')(vm.selectedDate, vm.dateFormat);
            var params = {selectedDate: selectedDateFormatted, selectedHour: vm.selectedHour, userData: vm.userData};

            reservationAPIFactory.reserve(params).then(function () {
                vm.loader = false;

                var status = vm.reservationStatus = reservationAPIFactory.status;
                var message = vm.reservationMessage = reservationAPIFactory.message;

                //Completed reserve callback
                reservationService.onCompletedReserve(status, message, vm.selectedDate, vm.selectedHour, vm.userData);

                //Success
                if (status == 'SUCCESS') {
                    //Successful reserve calback
                    reservationService.onSuccessfulReserve(status, message, vm.selectedDate, vm.selectedHour, vm.userData);

                //Error
                } else {
                    //Error reserve callback
                    reservationService.onErrorReserve(status, message, vm.selectedDate, vm.selectedHour, vm.userData);
                }
            });
        }
    }

})();
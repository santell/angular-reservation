/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('hm.reservation').controller('ReservationCtrl', ['$uibModal', '$filter', 'reservationAPIFactory', reservationCtrl]);

    function reservationCtrl($uibModal, $filter, reservationAPIFactory) {
        //Capture the this context of the Controller using vm, standing for procedureModel
        var vm = this;

        vm.selectedTab = 0;
        vm.secondTabLocked = true;
        vm.thirdTabLocked = true;

        vm.selectedDate = new Date();

        vm.selectedHour = "";

        vm.userData = {};


        //TODO Add calendar options as a configurable option
        vm.calendarOptions = {
            minDate: new Date(),
            showWeeks: false
        };

        //TODO Add date format as a configurable option
        vm.dateFormat = "dd/MM/yyyy";


        //METHODS
        vm.onSelectDate = function() {
            vm.secondTabLocked = false;
            vm.selectedTab = 1;
            getAvailableHours();
        }

        vm.selectHour = function(hour) {
            vm.thirdTabLocked = false;
            vm.selectedHour = hour;
            vm.selectedTab = 2;
        }

        vm.showConfirm = function(name) {
            openConfirmModal(name);
        }


        //PRIVATE METHODS

        /**
         * Opens confirmation modal
         */
         function openConfirmModal(name) {
            var modalInstance = $uibModal.open({
                templateUrl: 'confirmModal.html', //TODO Add as an option in config
                size: 'sm',
                controller: ['name', 'selectedDate', 'selectedHour', confirmModalCtrl],
                controllerAs: 'confirmModalCtrl',
                resolve: {
                    name: function () {
                        return name;
                    },
                    selectedDate: function () {
                        return $filter('date')(vm.selectedDate, vm.dateFormat);
                    },
                    selectedHour: function () {
                        return vm.selectedHour;
                    }
                }
            });

            modalInstance.result.then(function () {
                console.log("Accepted");

            }, function () {
                console.log("Cancelled");
            })
        }

        /**
         * Controller for confirm modal
         */
        function confirmModalCtrl(name, selectedDate, selectedHour) {
            var vm = this;

            vm.translationParams = {
                name: name,
                selectedDate: selectedDate,
                selectedHour: selectedHour
            }
        }

        /**
         * Get available hours for a selected date
         */
        function getAvailableHours() {
            var params = {selectedDate: vm.selectedDate};

            reservationAPIFactory.getAvailableHours(params).then(function () {
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
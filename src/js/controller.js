/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('hm.reservation').controller('ReservationCtrl', ['$scope', '$uibModal', '$filter', 'reservationAPIFactory', 'reservationConfig', reservationCtrl]);

    function reservationCtrl($scope, $uibModal, $filter, reservationAPIFactory, reservationConfig) {
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

        vm.showConfirm = function() {
            openConfirmModal();
        }


        //PRIVATE METHODS

        /**
         * Opens confirmation modal
         */
         function openConfirmModal() {
            var modalInstance = $uibModal.open({
                templateUrl: 'confirmModal.html', //TODO Add as an option in config
                size: 'sm',
                controller: ['userData', 'selectedDate', 'selectedHour', confirmModalCtrl],
                controllerAs: 'confirmModalCtrl',
                resolve: {
                    userData: function () {
                        return vm.userData;
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
                reserve();

            }, function () {
                console.log("Cancelled");
            })
        }

        /**
         * Controller for confirm modal
         */
        function confirmModalCtrl(userData, selectedDate, selectedHour) {
            var vm = this;

            //TODO Pass this as a configuration option
            vm.showUserData = true;

            vm.userData = userData;

            vm.translationParams = {
                name: userData.name,
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

        //TODO Callbacks in directive??
        /**
         * Do reserve POST with selectedDate, selectedHour and userData as parameters of the call
         */
        function reserve() {
            vm.loader = true;

            var params = {selectedDate: vm.selectedDate, selectedHour: vm.selectedHour, userData: vm.userData};

            reservationAPIFactory.reserve(params).then(function () {
                vm.loader = false;

                var level = reservationAPIFactory.level;
                var message = reservationAPIFactory.message;

                //Success call without error
                if (level == 'SUCCESS') {
                    console.log("Success");
                    //TODO Success callback
                    //successCallback();

                    //Success call with error
                } else if(level == 'ERROR') {
                    console.log("Error");
                    //TODO Error callback
                    //errorCallback

                    //Internal server error
                } else if(level == 'SERVER_ERROR') {
                    console.log("Internal server error");
                    //TODO Server error callback??

                    //Connection error
                } else if(level == 'CONNECTION_ERROR') {
                    console.log("Connection error");
                    //TODO Connection error callback??
                }

                //alert(JSON.stringify($scope.successCallback()));
                $scope.successCallback();
                //Hardcoded callbacks
                //successCallback();
                //errorCallback();
            });
        }

        //TODO Move to parent app
        function successCallback() {
            vm.reservationState = "SUCCESS";
        }

        //TODO Move to parent app
        function errorCallback() {
            vm.reservationState = "ERROR"
        }
    }

})();
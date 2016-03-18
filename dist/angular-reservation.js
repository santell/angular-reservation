/**
 * Angular reservation module
 * @author hmartos
 */
(function() {
	//Module definition with dependencies
	angular.module('angular.reservation', ['ngMaterial', 'pascalprecht.translate']);

})();
/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('angular.reservation').controller('ReservationCtrl', ['reservationAPIFactory', reservationCtrl]);

    function reservationCtrl(reservationAPIFactory) {
        //Capture the this context of the Controller using vm, standing for procedureModel
        var vm = this;

        vm.selectedTab = 0;

        vm.selectedDate = new Date();

        vm.selectedHour = "";

        vm.uaerData = {};


        //METHODS
        vm.onSelectDate = function() {
            vm.selectedTab = 1;
            getAvailableHours();
        }

        vm.selectHour = function(hour) {
            vm.selectedHour = hour;
            vm.selectedTab = 2;
        }

        vm.reserve = function() {
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


        //PRIVATE METHODS

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
    }

})();
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
/**
 * Factory for reservation
 * @author hmartos
 */
(function() {
    function reservationAPIFactory($http) {

        var reservationAPI = {};

        // Error details
        reservationAPI.level = "";
        reservationAPI.message = "";


        //METHODS

        //Call to get list of available hours
        reservationAPI.getAvailableHours = function(params) {
            return $http({
                method: 'POST',
                data: params,
                url: 'http://myAPI/' + 'getAvailableHours',
                responseType: 'json'

            }).then(function(response) {
                //Success handler
                console.log(response.data);
                reservationAPI.level = response.data.level;
                reservationAPI.message = response.data.message;

            }, function(response) {
                reservationAPI.errorManagement(response.status);
            });
        }

        //Call to do a reserve
        reservationAPI.reserve = function(params) {
            return $http({
                method: 'POST',
                data: params,
                url: 'http://myAPI/' + 'reserve',
                responseType: 'json'

            }).then(function(response) {
                //Success handler
                console.log(response.data);
                reservationAPI.level = response.data.level;
                reservationAPI.message = response.data.message;

            }, function(response) {
                reservationAPI.errorManagement(response.status);
            });
        }


        //Error management function, handles different kind of status codes
        reservationAPI.errorManagement = function(status) {
            switch (status) {
                case 500: //Server error
                    reservationAPI.level = "SERVER_ERROR";
                    break;
                default: //Other error, typically connection error
                    reservationAPI.level = "CONNECTION_ERROR";
                    break;
            }
        }

        return reservationAPI;
    }
    angular.module('angular.reservation').factory('reservationAPIFactory', ['$http', reservationAPIFactory]);
})();
angular.module("angular.reservation").run(["$templateCache", function($templateCache) {$templateCache.put("index.html","<div class=\"tabs\">\r\n    <md-content>\r\n        <md-tabs md-border-bottom md-selected=\"reservationCtrl.selectedTab\" md-center-tabs md-swipe-content>\r\n            <md-tab>\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">date_range</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <md-calendar ng-model=\"reservationCtrl.selectedDate\" ng-change=\"reservationCtrl.onSelectDate()\"></md-calendar>\r\n                </md-tab-body>\r\n            </md-tab>\r\n\r\n            <md-tab>\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">schedule</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <md-content>\r\n                        <md-list>\r\n                            <md-list-item class=\"md-1-line\" ng-repeat=\"item in reservationCtrl.availableHours\">\r\n                                <div class=\"md-list-item-text\">\r\n                                    <h3>{{item}}</h3>\r\n                                </div>\r\n                                <md-button class=\"md-secondary\" ng-click=\"reservationCtrl.selectHour(item)\">Select</md-button>\r\n                                <md-divider ng-if=\"!$last\"></md-divider>\r\n                            </md-list-item>\r\n                        </md-list>\r\n                    </md-content>\r\n                </md-tab-body>\r\n            </md-tab>\r\n\r\n            <md-tab>\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">person</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <form name=\"reservationCtrl.reserveForm\" ng-submit=\"reservationCtrl.reserveForm.$valid && reservationCtrl.reserve()\" novalidate>\r\n                        <md-content class=\"md-no-momentum\">\r\n                            <md-input-container class=\"md-icon-float md-block\">\r\n                                <label>Name</label>\r\n                                <md-icon aria-label=\"person\" class=\"material-icons\">person</md-icon>\r\n                                <input ng-model=\"reservationCtrl.userData.name\" type=\"text\" ng-required=\"true\">\r\n                            </md-input-container>\r\n\r\n                            <md-input-container class=\"md-icon-float md-block\">\r\n                                <label>Phone</label>\r\n                                <md-icon aria-label=\"person\" class=\"material-icons\">phone</md-icon>\r\n                                <input ng-model=\"reservationCtrl.userData.phone\" type=\"text\" ng-required=\"true\">\r\n                            </md-input-container>\r\n\r\n                            <md-input-container class=\"md-icon-float md-block\">\r\n                                <label>Email</label>\r\n                                <md-icon aria-label=\"person\" class=\"material-icons\">email</md-icon>\r\n                                <input ng-model=\"reservationCtrl.userData.email\" type=\"email\" ng-required=\"true\">\r\n                            </md-input-container>\r\n                        </md-content>\r\n\r\n                        <section layout=\"row\" layout-sm=\"column\" layout-align=\"center center\" layout-wrap=\"\">\r\n                            <md-button type=\"submit\" ng-disabled=\"false\" class=\"md-raised md-primary\">Reserve</md-button>\r\n                        </section>\r\n                    </form>\r\n                </md-tab-body>\r\n            </md-tab>\r\n        </md-tabs>\r\n    </md-content>\r\n</div>");}]);
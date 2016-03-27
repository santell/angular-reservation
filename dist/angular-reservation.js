/**
 * Angular reservation module
 * @author hmartos
 */
(function() {
	//Module definition with dependencies
	angular.module('hm.reservation', ['ui.bootstrap', 'pascalprecht.translate']);

})();
/**
 * Provider for reservation module
 * @author hmartos
 */
(function() {
    angular.module('hm.reservation').provider('reservationConfig', [reservationConfigProvider]);

    function reservationConfigProvider() {

        var config = {
            getAvailableHoursAPIUrl: "http://localhost:8080/API/getAvailableHours", //API url endpoint to load list of available hours
            reserveAPIUrl: "http://localhost:8080/API/reserve" //API url endpoint to do a reserve
        };

        //Public API for the provider
        return ({
            $get: function() {
                return config;
            },
            set: function (values) {
                angular.extend(config, values);
            }
        });

    }
})();
/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('hm.reservation').controller('ReservationCtrl', ['$filter', 'reservationAPIFactory', reservationCtrl]);

    function reservationCtrl($filter, reservationAPIFactory) {
        //Capture the this context of the Controller using vm, standing for procedureModel
        var vm = this;

        vm.selectedTab = 0;
        vm.secondTabLocked = true;
        vm.thirdTabLocked = true;

        vm.selectedDate = new Date();

        vm.selectedHour = "";

        vm.userData = {};

        vm.showLoader = false;

        //Calendar options
        vm.calendarOptions = {
            minDate: new Date(),
            showWeeks: false
        };


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
            /*var confirm = $mdDialog.confirm()
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
            });*/
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
/**
 * Reservation directive
 * @author hmartos
 */
(function() {
    //Directive
    angular.module('hm.reservation').directive('reservation', [function() {
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
    function reservationAPIFactory($http, reservationConfig) {

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
                url: reservationConfig.getAvailableHoursAPIUrl,
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
                url: reservationConfig.reserveAPIUrl,
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
    angular.module('hm.reservation').factory('reservationAPIFactory', ['$http', 'reservationConfig', reservationAPIFactory]);
})();
/**
 * Internationalization file with translations
 * @author hmartos
 */
(function() {
    "use strict";
    angular.module('hm.reservation').config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('es', {
            date: "Fecha",
            time: "Hora",
            client: "Cliente",
            name: "Nombre",
            save: "Guardar",
            cancel: "Cancelar",
            select: "Seleccionar",
            phone: "Teléfono",
            email: "Email",
            reserve: "Reservar",
            confirmOK: "Sí, reservar",
            confirmCancel: "No, cancelar",
            confirmTitle: "Confirmar reserva",
            confirmText: "{{name}}, ¿Estás seguro de que deseas reservar el día {{selectedDate}} a las {{selectedHour}}?.",
        });

        $translateProvider.translations('en', {
            date: "Date",
            time: "Time",
            client: "Client",
            name: "Name",
            save: "Save",
            cancel: "Cancel",
            select: "Select",
            phone: "Phone",
            email: "Email",
            reserve: "Reserve",
            confirmOK: "Yes, reserve",
            confirmCancel: "No, cancel",
            confirmTitle: "Confirm reservation",
            confirmText: "{{name}}, Are you sure you want to reserve date {{selectedDate}} at {{selectedHour}}?.",
        });

        //Available languages map
        $translateProvider.registerAvailableLanguageKeys(['es', 'en'], {
            'es_*': 'es',
            'en_*': 'en'
        });

        //Determine preferred language
        $translateProvider.determinePreferredLanguage();

        //Escapes HTML in the translation
        $translateProvider.useSanitizeValueStrategy('escaped');

    }]);
})();
angular.module("hm.reservation").run(["$templateCache", function($templateCache) {$templateCache.put("index.html","<div>\r\n    <uib-tabset active=\"reservationCtrl.selectedTab\" justified=\"true\" style=\"border: 2px dotted gainsboro\">\r\n        <uib-tab index=\"0\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-calendar\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5>{{\"date\" | translate}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <uib-datepicker ng-model=\"reservationCtrl.selectedDate\" ng-change=\"reservationCtrl.onSelectDate()\" datepicker-options=\"reservationCtrl.calendarOptions\"></uib-datepicker>\r\n        </uib-tab>\r\n\r\n        <uib-tab index=\"1\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5>{{\"time\" | translate}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <div class=\"list-group\">\r\n                <a class=\"list-group-item\" href=\"\" ng-repeat=\"item in reservationCtrl.availableHours\" ng-click=\"reservationCtrl.selectHour(item)\" ng-class=\"{\'selected\': reservationCtrl.selectedHour == item}\">\r\n                    {{item}}\r\n                </a>\r\n            </div>\r\n        </uib-tab>\r\n\r\n        <uib-tab index=\"2\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5>{{\"client\" | translate}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <form class=\"form-horizontal\" name=\"reservationCtrl.reserveForm\" novalidate>\r\n                <fieldset>\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"name\">{{\"name\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <input id=\"name\" name=\"name\" class=\"form-control\" placeholder=\"{{\'name\' | translate}}\" type=\"text\" required>\r\n                            </div>\r\n\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"phone\">{{\"phone\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-earphone\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <input id=\"phone\" name=\"phone\" class=\"form-control\" placeholder=\"{{\'phone\' | translate}}\" type=\"text\" required>\r\n                            </div>\r\n\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"email\">{{\"email\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-envelope\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <input id=\"email\" name=\"email\" class=\"form-control\" placeholder=\"{{\'email\' | translate}}\" type=\"text\" required>\r\n                            </div>\r\n\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group\">\r\n                        <div class=\"col-md-12\">\r\n                            <button id=\"reserve\" name=\"reserve\" class=\"btn btn-success\">{{\"reserve\" | translate}}</button>\r\n                        </div>\r\n                    </div>\r\n                </fieldset>\r\n            </form>\r\n        </uib-tab>\r\n    </uib-tabset>\r\n</div>\r\n\r\n<!--\r\n<div class=\"tabs\">\r\n    <md-content>\r\n        <md-tabs md-selected=\"reservationCtrl.selectedTab\" md-center-tabs md-swipe-content md-dynamic-height md-border-bottom>\r\n            <md-tab>\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">date_range</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <md-calendar ng-model=\"reservationCtrl.selectedDate\" ng-change=\"reservationCtrl.onSelectDate()\"></md-calendar>\r\n                </md-tab-body>\r\n            </md-tab>\r\n\r\n            <md-tab ng-disabled=\"reservationCtrl.secondTabLocked\">\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">schedule</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <md-content style=\"min-height: 60px\">\r\n                        <md-progress-circular ng-show=\"reservationCtrl.showLoader\" md-diameter=\"50\" md-mode=\"indeterminate\"></md-progress-circular>\r\n\r\n                        <md-list>\r\n                            <md-list-item class=\"md-1-line\" ng-repeat=\"item in reservationCtrl.availableHours\">\r\n                                <div class=\"md-list-item-text\">\r\n                                    <h3>{{item}}</h3>\r\n                                </div>\r\n                                <md-button class=\"md-secondary\" ng-click=\"reservationCtrl.selectHour(item)\">{{\"select\" | translate}}</md-button>\r\n                                <md-divider ng-if=\"!$last\"></md-divider>\r\n                            </md-list-item>\r\n                        </md-list>\r\n                    </md-content>\r\n                </md-tab-body>\r\n            </md-tab>\r\n\r\n            <md-tab ng-disabled=\"reservationCtrl.thirdTabLocked\">\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">person</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <md-content style=\"min-height: 60px\">\r\n                        <md-progress-circular ng-show=\"reservationCtrl.showLoader\" md-diameter=\"50\" md-mode=\"indeterminate\"></md-progress-circular>\r\n\r\n                        <form name=\"reservationCtrl.reserveForm\" ng-show=\"!reservationCtrl.showLoader\" novalidate>\r\n                            <md-content class=\"md-no-momentum\">\r\n                                <md-input-container class=\"md-icon-float md-block\">\r\n                                    <label>{{\"name\" | translate}}</label>\r\n                                    <md-icon aria-label=\"person\" class=\"material-icons\">person</md-icon>\r\n                                    <input ng-model=\"reservationCtrl.userData.name\" type=\"text\" ng-required=\"true\">\r\n                                </md-input-container>\r\n\r\n                                <md-input-container class=\"md-icon-float md-block\">\r\n                                    <label>{{\"phone\" | translate}}</label>\r\n                                    <md-icon aria-label=\"person\" class=\"material-icons\">phone</md-icon>\r\n                                    <input ng-model=\"reservationCtrl.userData.phone\" type=\"text\" ng-required=\"true\">\r\n                                </md-input-container>\r\n\r\n                                <md-input-container class=\"md-icon-float md-block\">\r\n                                    <label>{{\"email\" | translate}}</label>\r\n                                    <md-icon aria-label=\"person\" class=\"material-icons\">email</md-icon>\r\n                                    <input ng-model=\"reservationCtrl.userData.email\" type=\"email\" ng-required=\"true\">\r\n                                </md-input-container>\r\n                            </md-content>\r\n\r\n                            <section layout=\"row\" layout-sm=\"column\" layout-align=\"center center\" layout-wrap=\"\">\r\n                                <md-button type=\"button\" ng-click=\"reservationCtrl.showConfirm($event)\" ng-disabled=\"!reservationCtrl.reserveForm.$valid\" class=\"md-raised md-primary\">{{\"reserve\" | translate}}</md-button>\r\n                            </section>\r\n                        </form>\r\n                    </md-content>\r\n                </md-tab-body>\r\n            </md-tab>\r\n        </md-tabs>\r\n    </md-content>\r\n</div>-->\r\n");}]);
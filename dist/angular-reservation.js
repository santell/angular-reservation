/**
 * Angular reservation module
 * @author hmartos
 */
(function() {
	//Module definition with dependencies
	angular.module('hm.reservation', ['ui.bootstrap', 'pascalprecht.translate', 'ngMessages']);

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
            required: "Este campo no puede estar vacío",
            minLength: "El número mínimo de carácteres es {{minLength}}",
            maxLength: "El número máximo de carácteres es {{maxLength}}",
            invalidCharacters: "Caracteres no permitidos",
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
            required: "This field is required",
            minLength: "Minimum length of {{minLength}} is required",
            maxLength: "Maximum length of {{maxLength}} is required",
            invalidCharacters: "Not allowed characters",
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
angular.module("hm.reservation").run(["$templateCache", function($templateCache) {$templateCache.put("confirmModal.html","<div class=\"modal-header\">\r\n    <h3 class=\"modal-title\">{{\"confirmTitle\" | translate}}</h3>\r\n</div>\r\n\r\n<div class=\"modal-body\">\r\n    <h5>{{\"confirmText\" | translate : confirmModalCtrl.translationParams}}</h5>\r\n\r\n    <div class=\"col-md-12\" ng-repeat=\"(key, value) in confirmModalCtrl.userData\" ng-if=\"confirmModalCtrl.showUserData\">\r\n        <label class=\"col-md-6 control-label\">{{key | translate}}</label>\r\n\r\n        <h5 class=\"col-md-6\">{{value}}</h5>\r\n    </div>\r\n</div>\r\n\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"$dismiss()\">{{\"confirmCancel\" | translate}}</button>\r\n    <button class=\"btn btn-success\" type=\"button\" ng-click=\"$close()\">{{\"confirmOK\" | translate}}</button>\r\n</div>");
$templateCache.put("index.html","<div>\r\n    <uib-tabset active=\"reservationCtrl.selectedTab\" justified=\"true\" style=\"border: 2px dotted gainsboro\">\r\n        <uib-tab index=\"0\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-calendar\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5 ng-if=\"reservationCtrl.secondTabLocked\">{{\"date\" | translate}}</h5>\r\n                <h5 ng-if=\"!reservationCtrl.secondTabLocked\">{{reservationCtrl.selectedDate | date: reservationCtrl.dateFormat}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <uib-datepicker ng-model=\"reservationCtrl.selectedDate\" ng-change=\"reservationCtrl.onSelectDate()\" datepicker-options=\"reservationCtrl.calendarOptions\"></uib-datepicker>\r\n        </uib-tab>\r\n\r\n        <uib-tab index=\"1\" disable=\"reservationCtrl.secondTabLocked\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5 ng-if=\"reservationCtrl.thirdTabLocked\">{{\"time\" | translate}}</h5>\r\n                <h5 ng-if=\"!reservationCtrl.thirdTabLocked\">{{reservationCtrl.selectedHour}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <div class=\"list-group\">\r\n                <a class=\"list-group-item\" href=\"\" ng-repeat=\"item in reservationCtrl.availableHours\" ng-click=\"reservationCtrl.selectHour(item)\" ng-class=\"{\'selected\': reservationCtrl.selectedHour == item}\">\r\n                    {{item}}\r\n                </a>\r\n            </div>\r\n        </uib-tab>\r\n\r\n        <uib-tab index=\"2\" disable=\"reservationCtrl.thirdTabLocked\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5>{{\"client\" | translate}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <!-- TODO Add name model to showConfirm function -->\r\n            <form class=\"form-horizontal\" name=\"reserveForm\" ng-submit=\"reserveForm.$valid && reservationCtrl.showConfirm()\" novalidate>\r\n                <fieldset>\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"name\">{{\"name\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <input id=\"name\" name=\"name\" class=\"form-control\" placeholder=\"{{\'name\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.name\"\r\n                                       autofocus=\"true\" ng-pattern=\"/^[\\w\\s\\-]*$/\" ng-minlength=\"3\" ng-maxlength=\"100\" required>\r\n                            </div>\r\n\r\n                            <div class=\"help-block\" ng-messages=\"reserveForm.name.$error\" ng-if=\"reserveForm.$submitted\">\r\n                                <p ng-message=\"minlength\" class=\"text-danger\">{{\"minLength\" | translate: \'{minLength: \"3\"}\'}}</p>\r\n                                <p ng-message=\"maxlength\" class=\"text-danger\">{{\"maxLength\" | translate: \'{maxLength: \"100\"}\'}}</p>\r\n                                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidCharacters\" | translate}}</p>\r\n                                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"phone\">{{\"phone\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-earphone\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <!-- TODO Change pattern, change invalidCharacters by invalidNumber-->\r\n                                <input id=\"phone\" name=\"phone\" class=\"form-control\" placeholder=\"{{\'phone\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.phone\"\r\n                                       ng-pattern=\"/^[\\w\\s\\-]*$/\" required>\r\n                            </div>\r\n\r\n                            <div class=\"help-block\" ng-messages=\"reserveForm.phone.$error\" ng-if=\"reserveForm.$submitted\">\r\n                                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidCharacters\" | translate}}</p>\r\n                                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"email\">{{\"email\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-envelope\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <!-- TODO Change pattern, change invalidCharacters by invalidEmail-->\r\n                                <input id=\"email\" name=\"email\" class=\"form-control\" placeholder=\"{{\'email\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.email\"\r\n                                       ng-pattern=\"/^[\\w\\s\\-]*$/\" required>\r\n                            </div>\r\n\r\n                            <div class=\"help-block\" ng-messages=\"reserveForm.email.$error\" ng-if=\"reserveForm.$submitted\">\r\n                                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidCharacters\" | translate}}</p>\r\n                                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group\">\r\n                        <div class=\"col-md-12\">\r\n                            <button id=\"reserve\" type=\"submit\" name=\"reserve\" class=\"btn btn-success\">{{\"reserve\" | translate}}</button>\r\n                        </div>\r\n                    </div>\r\n                </fieldset>\r\n            </form>\r\n        </uib-tab>\r\n    </uib-tabset>\r\n</div>");}]);
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
            reserveAPIUrl: "http://localhost:8080/API/reserve", //API url endpoint to do a reserve
            dateFormat: "dd/MM/yyyy",
            language: "en"
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
    angular.module('hm.reservation').controller('ReservationCtrl', ['$scope', '$uibModal', '$filter', 'reservationAPIFactory', 'reservationConfig', 'reservationService', reservationCtrl]);

    function reservationCtrl($scope, $uibModal, $filter, reservationAPIFactory, reservationConfig, reservationService) {
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

                //Success
                if (level == 'SUCCESS') {
                    console.log("Success");
                    reservationService.onSuccessfulReserve(vm.selectedDate, vm.selectedHour, vm.userData);

                //Error
                } else {
                    console.log("Error");
                    reservationService.onCompletedReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);
                }

                //Hardcoded callbacks
                //reservationService.onSuccessfulReserve(vm.selectedDate, vm.selectedHour, vm.userData);
                //reservationService.onCompletedReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);
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
 * Service for reservation management
 * @author hmartos
 */
(function() {
    function reservationService() {

        //Success callback
        this.onSuccessfulReserve = function(reservedDate, reservedHour, userData) {
            console.log("Executing successful reserve callback");
        }

        //Completed callback
        this.onCompletedReserve = function(statusLevel, message, selectedDate, selectedHour, userData) {
            console.log("Executing completed reserve callback");
        }

    }
    angular.module('hm.reservation').service('reservationService', [reservationService]);
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
$templateCache.put("index.html","<div>\r\n    <uib-tabset active=\"reservationCtrl.selectedTab\" justified=\"true\" style=\"border: 2px dotted gainsboro\">\r\n        <uib-tab index=\"0\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-calendar\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5 ng-if=\"reservationCtrl.secondTabLocked\">{{\"date\" | translate}}</h5>\r\n                <h5 ng-if=\"!reservationCtrl.secondTabLocked\">{{reservationCtrl.selectedDate | date: reservationCtrl.dateFormat}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <uib-datepicker ng-model=\"reservationCtrl.selectedDate\" ng-change=\"reservationCtrl.onSelectDate()\" datepicker-options=\"reservationCtrl.calendarOptions\"></uib-datepicker>\r\n        </uib-tab>\r\n\r\n        <uib-tab index=\"1\" disable=\"reservationCtrl.secondTabLocked\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5 ng-if=\"reservationCtrl.thirdTabLocked\">{{\"time\" | translate}}</h5>\r\n                <h5 ng-if=\"!reservationCtrl.thirdTabLocked\">{{reservationCtrl.selectedHour}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <div ng-include=\"\'loader.html\'\" style=\"text-align: center\" ng-if=\"reservationCtrl.loader\"></div>\r\n\r\n            <div class=\"list-group\" ng-if=\"!reservationCtrl.loader\">\r\n                <a class=\"list-group-item\" href=\"\" ng-repeat=\"item in reservationCtrl.availableHours\" ng-click=\"reservationCtrl.selectHour(item)\" ng-class=\"{\'selected\': reservationCtrl.selectedHour == item}\">\r\n                    {{item}}\r\n                </a>\r\n            </div>\r\n        </uib-tab>\r\n\r\n        <uib-tab index=\"2\" disable=\"reservationCtrl.thirdTabLocked\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" style=\"font-size: 18px\"></span>\r\n                <h5>{{\"client\" | translate}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <form class=\"form-horizontal\" name=\"reserveForm\" ng-submit=\"reserveForm.$valid && reservationCtrl.showConfirm()\" novalidate>\r\n                <div ng-include=\"\'loader.html\'\" style=\"text-align: center\" ng-if=\"reservationCtrl.loader\"></div>\r\n\r\n                <fieldset ng-if=\"!reservationCtrl.loader\">\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"name\">{{\"name\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <input id=\"name\" name=\"name\" class=\"form-control\" placeholder=\"{{\'name\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.name\"\r\n                                       autofocus=\"true\" ng-pattern=\"/^[\\w\\s\\-]*$/\" ng-minlength=\"3\" ng-maxlength=\"100\" required>\r\n                            </div>\r\n\r\n                            <div class=\"help-block\" ng-messages=\"reserveForm.name.$error\" ng-if=\"reserveForm.$submitted\">\r\n                                <p ng-message=\"minlength\" class=\"text-danger\">{{\"minLength\" | translate: \'{minLength: \"3\"}\'}}</p>\r\n                                <p ng-message=\"maxlength\" class=\"text-danger\">{{\"maxLength\" | translate: \'{maxLength: \"100\"}\'}}</p>\r\n                                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidCharacters\" | translate}}</p>\r\n                                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"phone\">{{\"phone\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-earphone\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <!-- TODO Change pattern, change invalidCharacters by invalidNumber-->\r\n                                <input id=\"phone\" name=\"phone\" class=\"form-control\" placeholder=\"{{\'phone\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.phone\"\r\n                                       ng-pattern=\"/^[\\w\\s\\-]*$/\" required>\r\n                            </div>\r\n\r\n                            <div class=\"help-block\" ng-messages=\"reserveForm.phone.$error\" ng-if=\"reserveForm.$submitted\">\r\n                                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidCharacters\" | translate}}</p>\r\n                                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group col-md-12\">\r\n                        <label class=\"col-md-4 control-label\" for=\"email\">{{\"email\" | translate}}</label>\r\n                        <div class=\"col-md-8\">\r\n                            <div class=\"input-group\">\r\n                                <span class=\"input-group-addon\">\r\n                                    <span class=\"glyphicon glyphicon-envelope\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\r\n                                </span>\r\n                                <!-- TODO Change pattern, change invalidCharacters by invalidEmail-->\r\n                                <input id=\"email\" name=\"email\" class=\"form-control\" placeholder=\"{{\'email\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.email\"\r\n                                       ng-pattern=\"/^[\\w\\s\\-]*$/\" required>\r\n                            </div>\r\n\r\n                            <div class=\"help-block\" ng-messages=\"reserveForm.email.$error\" ng-if=\"reserveForm.$submitted\">\r\n                                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidCharacters\" | translate}}</p>\r\n                                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"form-group\">\r\n                        <div class=\"col-md-12\">\r\n                            <button id=\"reserve\" type=\"submit\" name=\"reserve\" class=\"btn btn-success\">{{\"reserve\" | translate}}</button>\r\n                        </div>\r\n                    </div>\r\n                </fieldset>\r\n\r\n                <uib-alert type=\"success\" ng-if=\"reservationCtrl.reservationState == \'SUCCESS\'\">Success!</uib-alert>\r\n                <uib-alert type=\"danger\" ng-if=\"reservationCtrl.reservationState == \'ERROR\'\">Error!</uib-alert>\r\n            </form>\r\n        </uib-tab>\r\n    </uib-tabset>\r\n</div>");
$templateCache.put("loader.html","<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1\" width=\"50px\" height=\"50px\" viewBox=\"0 0 28 28\">\r\n    <!-- 28= RADIUS*2 + STROKEWIDTH -->\r\n\r\n    <title>Material design circular activity spinner with CSS3 animation</title>\r\n    <style type=\"text/css\">\r\n        /**************************/\r\n        /* STYLES FOR THE SPINNER */\r\n        /**************************/\r\n\r\n        /*\r\n         * Constants:\r\n         *      RADIUS      = 12.5\r\n         *      STROKEWIDTH = 3\r\n         *      ARCSIZE     = 270 degrees (amount of circle the arc takes up)\r\n         *      ARCTIME     = 1333ms (time it takes to expand and contract arc)\r\n         *      ARCSTARTROT = 216 degrees (how much the start location of the arc\r\n         *                                should rotate each time, 216 gives us a\r\n         *                                5 pointed star shape (it\'s 360/5 * 2).\r\n         *                                For a 7 pointed star, we might do\r\n         *                                360/7 * 3 = 154.286)\r\n         *\r\n         *      SHRINK_TIME = 400ms\r\n         */\r\n\r\n        .qp-circular-loader {\r\n            width:28px;  /* 2*RADIUS + STROKEWIDTH */\r\n            height:28px; /* 2*RADIUS + STROKEWIDTH */\r\n        }\r\n        .qp-circular-loader-path {\r\n            stroke-dasharray: 58.9;  /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            stroke-dashoffset: 58.9; /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            /* hides things initially */\r\n        }\r\n\r\n        /* SVG elements seem to have a different default origin */\r\n        .qp-circular-loader, .qp-circular-loader * {\r\n            -webkit-transform-origin: 50% 50%;\r\n            -moz-transform-origin: 50% 50%;\r\n        }\r\n\r\n        /* Rotating the whole thing */\r\n        @-webkit-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        @-moz-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        .qp-circular-loader {\r\n            -webkit-animation-name: rotate;\r\n            -webkit-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -webkit-animation-iteration-count: infinite;\r\n            -webkit-animation-timing-function: linear;\r\n            -moz-animation-name: rotate;\r\n            -moz-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -moz-animation-iteration-count: infinite;\r\n            -moz-animation-timing-function: linear;\r\n        }\r\n\r\n        /* Filling and unfilling the arc */\r\n        @-webkit-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-moz-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-webkit-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @-webkit-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n        .qp-circular-loader-path {\r\n            -webkit-animation-name: fillunfill, rot, colors;\r\n            -webkit-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -webkit-animation-iteration-count: infinite, infinite, infinite;\r\n            -webkit-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -webkit-animation-play-state: running, running, running;\r\n            -webkit-animation-fill-mode: forwards;\r\n\r\n            -moz-animation-name: fillunfill, rot, colors;\r\n            -moz-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -moz-animation-iteration-count: infinite, infinite, infinite;\r\n            -moz-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -moz-animation-play-state: running, running, running;\r\n            -moz-animation-fill-mode: forwards;\r\n        }\r\n\r\n    </style>\r\n\r\n    <!-- 3= STROKEWIDTH -->\r\n    <!-- 14= RADIUS + STROKEWIDTH/2 -->\r\n    <!-- 12.5= RADIUS -->\r\n    <!-- 1.5=  STROKEWIDTH/2 -->\r\n    <!-- ARCSIZE would affect the 1.5,14 part of this... 1.5,14 is specific to\r\n         270 degress -->\r\n    <g class=\"qp-circular-loader\">\r\n        <path class=\"qp-circular-loader-path\" fill=\"none\" d=\"M 14,1.5 A 12.5,12.5 0 1 1 1.5,14\" stroke-width=\"3\" stroke-linecap=\"round\"/>\r\n    </g>\r\n</svg>");}]);
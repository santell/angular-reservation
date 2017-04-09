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
            getAvailableHoursAPIUrl: "http://localhost:8080/API/availableHours", //API url endpoint to load list of available hours
            reserveAPIUrl: "http://localhost:8080/API/reserve", //API url endpoint to do a reserve
            dateFormat: "yyyy-MM-dd",
            language: "en",
            showConfirmationModal: true,
            datepickerTemplate: "datepicker.html",
            availableHoursTemplate: "availableHours.html",
            noAvailableHoursTemplate: "noAvailableHours.html",
            clientFormTemplate: "clientForm.html",
            confirmationModalTemplate: "confirmationModal.html"
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
            vm.selectedDate = $filter('date')(vm.selectedDate, vm.dateFormat);
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
            var params = {selectedDate: vm.selectedDate};

            reservationAPIFactory.getAvailableHours(params).then(function () {
                vm.loader = false;

                var level = reservationAPIFactory.level;
                var message = reservationAPIFactory.message;

                //Completed get available hours callback
                reservationService.onCompletedGetAvailableHours(level, message, vm.selectedDate);

                //Success
                if (level == 'SUCCESS') {
                    vm.availableHours = reservationAPIFactory.availableHours;
                    //Successful get available hours callback
                    reservationService.onSuccessfulGetAvailableHours(level, message, vm.selectedDate, vm.availableHours);

                //Error
                } else {
                    //Error get available hours callback
                    reservationService.onErrorGetAvailableHours(level, message, vm.selectedDate);
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

            var params = {selectedDate: vm.selectedDate, selectedHour: vm.selectedHour, userData: vm.userData};

            reservationAPIFactory.reserve(params).then(function () {
                vm.loader = false;

                var level = vm.reservationState = reservationAPIFactory.level;
                var message = vm.reservationMessage = reservationAPIFactory.message;

                //Completed reserve callback
                reservationService.onCompletedReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);

                //Success
                if (level == 'SUCCESS') {
                    //Successful reserve calback
                    reservationService.onSuccessfulReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);

                //Error
                } else {
                    //Error reserve callback
                    reservationService.onErrorReserve(level, message, vm.selectedDate, vm.selectedHour, vm.userData);
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
            scope: {
                datepickerOptions: '='
            },
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
                method: 'GET',
                params: params,
                url: reservationConfig.getAvailableHoursAPIUrl,
                responseType: 'json'

            }).then(function(response) {
                //Success handler
                console.log(response.data);
                reservationAPI.level = response.data.level;
                reservationAPI.message = response.data.message;
                reservationAPI.availableHours = response.data.availableHours;

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
    function reservationService($q, $filter, $uibModal, reservationConfig) {

        //Before get available hours callback
        this.onBeforeGetAvailableHours = function(selectedDate) {
            console.log("Executing before get available hours callback");
            var deferred = $q.defer();

            deferred.resolve();
            //deferred.reject();

            return deferred.promise;
        }

        //Completed get available hours callback
        this.onCompletedGetAvailableHours = function(statusLevel, message, selectedDate) {
            console.log("Executing completed get available hours callback");
        }

        //Success get available hours callback
        this.onSuccessfulGetAvailableHours = function(statusLevel, message, selectedDate, availableHours) {
            console.log("Executing successful get available hours callback");
        }

        //Error get available hours callback
        this.onErrorGetAvailableHours = function(statusLevel, message, selectedDate) {
            console.log("Executing error get available hours callback");
        }

        //Before reserve callback
        this.onBeforeReserve = function(selectedDate, selectedHour, userData) {
            console.log("Executing before reserve callback");
            var deferred = $q.defer();

            if(reservationConfig.showConfirmationModal) {
                openConfirmationModal(deferred, selectedDate, selectedHour, userData);

            } else {
                deferred.resolve();
                //deferred.reject();
            }

            return deferred.promise;
        }


        //Completed reserve callback
        this.onCompletedReserve = function(statusLevel, message, selectedDate, selectedHour, userData) {
            console.log("Executing completed reserve callback");
        }

        //Success reserve callback
        this.onSuccessfulReserve = function(level, message, reservedDate, reservedHour, userData) {
            console.log("Executing successful reserve callback");
        }

        //Error reserve callback
        this.onErrorReserve = function(level, message, selectedDate, selectedHour, userData) {
            console.log("Executing error reserve callback");
        }

        /**
         * Opens confirmation modal
         */
        function openConfirmationModal(deferred, selectedDate, selectedHour, userData) {
            var modalInstance = $uibModal.open({
                templateUrl: reservationConfig.confirmationModalTemplate,
                size: 'sm',
                controller: ['selectedDate', 'selectedHour', 'userData', confirmationModalCtrl],
                controllerAs: 'confirmationModalCtrl',
                resolve: {
                    selectedDate: function () {
                        return $filter('date')(selectedDate, reservationConfig.dateFormat);
                    },
                    selectedHour: function () {
                        return selectedHour;
                    },
                    userData: function () {
                        return userData;
                    }
                }
            });

            modalInstance.result.then(function () {
                console.log("Accepted");
                deferred.resolve();

            }, function () {
                console.log("Cancelled");
                deferred.reject();
            })
        }

        /**
         * Controller for confirmation modal
         */
        function confirmationModalCtrl(selectedDate, selectedHour, userData) {
            var vm = this;

            vm.selectedDate = selectedDate;
            vm.selectedHour = selectedHour;
            vm.userData = userData;

            vm.translationParams = {
                name: userData.name,
                selectedDate: selectedDate,
                selectedHour: selectedHour
            }
        }

    }
    angular.module('hm.reservation').service('reservationService', ['$q', '$filter', '$uibModal', 'reservationConfig', reservationService]);
})();
/**
 * Internationalization file with translations
 * @author hmartos
 */
(function() {
    "use strict";
    angular.module('hm.reservation').config(['$translateProvider', function($translateProvider) {
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
            invalidPhone: "Invalid phone number",
            invalidEmail: "Invalid email address",
            reserve: "Reserve",
            confirmOK: "Yes, reserve",
            confirmCancel: "No, cancel",
            confirmTitle: "Confirm reservation",
            confirmText: "{{name}}, Are you sure you want to reserve date {{selectedDate}} at {{selectedHour}}?.",
            noAvailableHours: "There are not available hours for selected date, please select another date"
        });

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
            invalidPhone: "Número de teléfono no válido",
            invalidEmail: "Email no válido",
            reserve: "Reservar",
            confirmOK: "Sí, reservar",
            confirmCancel: "No, cancelar",
            confirmTitle: "Confirmar reserva",
            confirmText: "{{name}}, ¿Estás seguro de que deseas reservar el día {{selectedDate}} a las {{selectedHour}}?.",
            noAvailableHours: "No hay horas disponibles para la fecha seleccionada, por favor selecciona otra fecha"
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
angular.module("hm.reservation").run(["$templateCache", function($templateCache) {$templateCache.put("availableHours.html","<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in reservationCtrl.availableHours\" ng-click=\"reservationCtrl.selectHour(item)\" ng-class=\"{\'selected\': reservationCtrl.selectedHour == item}\">\n    <span>{{item}}</span>\n</a>\n\n<!--<div class=\"col-md-3 availableHour\" ng-repeat=\"item in reservationCtrl.availableHours\" ng-click=\"reservationCtrl.selectHour(item)\" ng-class=\"{\'selected\': reservationCtrl.selectedHour == item}\">-->\n<!--<span>{{item}}</span>-->\n<!--</div>-->");
$templateCache.put("clientForm.html","<div class=\"col-md-12 clientForm\">\n    <div class=\"form-group col-md-12\">\n        <label class=\"col-md-3 control-label\" for=\"name\">{{\"name\" | translate}}</label>\n        <div class=\"col-md-9\">\n            <div class=\"input-group\">\n            <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\n            </span>\n\n                <input id=\"name\" name=\"name\" class=\"form-control\" placeholder=\"{{\'name\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.name\"\n                       autofocus=\"true\" ng-pattern=\"/^[\\w\\s\\-\\x7f-\\xff]*$/\" ng-minlength=\"2\" ng-maxlength=\"100\" required>\n            </div>\n\n            <div class=\"help-block\" ng-messages=\"reserveForm.name.$error\" ng-if=\"reserveForm.$submitted\">\n                <p ng-message=\"minlength\" class=\"text-danger\">{{\"minLength\" | translate: \'{minLength: \"2\"}\'}}</p>\n                <p ng-message=\"maxlength\" class=\"text-danger\">{{\"maxLength\" | translate: \'{maxLength: \"100\"}\'}}</p>\n                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidCharacters\" | translate}}</p>\n                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"form-group col-md-12\">\n        <label class=\"col-md-3 control-label\" for=\"phone\">{{\"phone\" | translate}}</label>\n        <div class=\"col-md-9\">\n            <div class=\"input-group\">\n            <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-earphone\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\n            </span>\n\n                <input id=\"phone\" name=\"phone\" class=\"form-control\" placeholder=\"{{\'phone\' | translate}}\" type=\"tel\" ng-model=\"reservationCtrl.userData.phone\"\n                       ng-pattern=\"/^[0-9]*$/\" ng-minlength=\"5\" ng-maxlength=\"15\" required>\n            </div>\n\n            <div class=\"help-block\" ng-messages=\"reserveForm.phone.$error\" ng-if=\"reserveForm.$submitted\">\n                <p ng-message=\"minlength\" class=\"text-danger\">{{\"minLength\" | translate: \'{minLength: \"5\"}\'}}</p>\n                <p ng-message=\"maxlength\" class=\"text-danger\">{{\"maxLength\" | translate: \'{maxLength: \"15\"}\'}}</p>\n                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidPhone\" | translate}}</p>\n                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"form-group col-md-12\">\n        <label class=\"col-md-3 control-label\" for=\"email\">{{\"email\" | translate}}</label>\n        <div class=\"col-md-9\">\n            <div class=\"input-group\">\n            <span class=\"input-group-addon\">\n                <span class=\"glyphicon glyphicon-envelope\" aria-hidden=\"true\" style=\"font-size: 14px\"></span>\n            </span>\n\n                <input id=\"email\" name=\"email\" class=\"form-control\" placeholder=\"{{\'email\' | translate}}\" type=\"text\" ng-model=\"reservationCtrl.userData.email\"\n                       ng-pattern=\"/[\\w|.|-]*@\\w*\\.[\\w|.]*/\" required>\n            </div>\n\n            <div class=\"help-block\" ng-messages=\"reserveForm.email.$error\" ng-if=\"reserveForm.$submitted\">\n                <p ng-message=\"pattern\" class=\"text-danger\">{{\"invalidEmail\" | translate}}</p>\n                <p ng-message=\"required\" class=\"text-danger\">{{\"required\" | translate}}</p>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"col-md-12\">\n        <button id=\"reserve\" type=\"submit\" name=\"reserve\" class=\"btn btn-success pull-right\">{{\"reserve\" | translate}}</button>\n    </div>\n\n    <div class=\"col-md-12\">\n        <div uib-alert class=\"alert-success text-center\" ng-if=\"reservationCtrl.reservationState == \'SUCCESS\'\" style=\"margin-top: 1em\">\n            <span>Success!</span>\n            <p ng-if=\"reservationCtrl.reservationMessage\">{{reservationCtrl.reservationMessage}}</p>\n        </div>\n\n        <div uib-alert class=\"alertt-danger text-center\" ng-if=\"reservationCtrl.reservationState == \'ERROR\'\" style=\"margin-top: 1em\">\n            <span>Error!</span>\n            <p ng-if=\"reservationCtrl.reservationMessage\">{{reservationCtrl.reservationMessage}}</p>\n        </div>\n    </div>\n</div>");
$templateCache.put("confirmationModal.html","<div class=\"modal-header\">\n    <h3 class=\"modal-title\">{{\"confirmTitle\" | translate}}</h3>\n</div>\n\n<div class=\"modal-body\">\n    <h5>{{\"confirmText\" | translate : confirmationModalCtrl.translationParams}}</h5>\n\n    <div ng-repeat=\"(key, value) in confirmationModalCtrl.userData track by $index\">\n        <label class=\"control-label\">{{key | translate}}</label>\n\n        <h5>{{value}}</h5>\n    </div>\n</div>\n\n<div class=\"modal-footer\">\n    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"$dismiss()\">{{\"confirmCancel\" | translate}}</button>\n    <button class=\"btn btn-success\" type=\"button\" ng-click=\"$close()\">{{\"confirmOK\" | translate}}</button>\n</div>");
$templateCache.put("datepicker.html","<div uib-datepicker class=\"datepicker\" ng-model=\"reservationCtrl.selectedDate\" ng-change=\"reservationCtrl.onSelectDate()\" datepicker-options=\"reservationCtrl.datepickerOptions\"></div>");
$templateCache.put("index.html","<div class=\"box\">\n    <uib-tabset active=\"reservationCtrl.selectedTab\" justified=\"true\">\n        <uib-tab index=\"0\">\n            <uib-tab-heading>\n                <span class=\"glyphicon glyphicon-calendar\" aria-hidden=\"true\" class=\"icon-size\"></span>\n                <h5 ng-if=\"reservationCtrl.secondTabLocked\">{{\"date\" | translate}}</h5>\n                <h5 ng-if=\"!reservationCtrl.secondTabLocked\">{{reservationCtrl.selectedDate | date: reservationCtrl.dateFormat}}</h5>\n            </uib-tab-heading>\n\n            <div ng-include=\"reservationCtrl.datepickerTemplate\"></div>\n        </uib-tab>\n\n        <uib-tab index=\"1\" disable=\"reservationCtrl.secondTabLocked\">\n            <uib-tab-heading>\n                <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" class=\"icon-size\"></span>\n                <h5 ng-if=\"reservationCtrl.thirdTabLocked\">{{\"time\" | translate}}</h5>\n                <h5 ng-if=\"!reservationCtrl.thirdTabLocked\">{{reservationCtrl.selectedHour}}</h5>\n            </uib-tab-heading>\n\n            <div ng-include=\"\'loader.html\'\" class=\"text-center\" ng-if=\"reservationCtrl.loader\"></div>\n\n            <div class=\"availableHour\" ng-if=\"!reservationCtrl.loader && reservationCtrl.availableHours.length > 0\">\n                <div ng-include=\"reservationCtrl.availableHoursTemplate\"></div>\n            </div>\n\n            <div ng-if=\"!reservationCtrl.loader && reservationCtrl.availableHours.length == 0\">\n                <div ng-include=\"reservationCtrl.noAvailableHoursTemplate\"></div>\n            </div>\n        </uib-tab>\n\n        <uib-tab index=\"2\" disable=\"reservationCtrl.thirdTabLocked\">\n            <uib-tab-heading>\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" class=\"icon-size\"></span>\n                <h5>{{\"client\" | translate}}</h5>\n            </uib-tab-heading>\n\n            <form class=\"form-horizontal\" name=\"reserveForm\" ng-submit=\"reserveForm.$valid && reservationCtrl.reserve()\" novalidate>\n                <div ng-include=\"\'loader.html\'\" class=\"text-center\" ng-if=\"reservationCtrl.loader\"></div>\n\n                <fieldset ng-if=\"!reservationCtrl.loader\">\n                    <div ng-include=\"reservationCtrl.clientFormTemplate\"></div>\n                </fieldset>\n            </form>\n        </uib-tab>\n    </uib-tabset>\n</div>\n");
$templateCache.put("loader.html","<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1\" width=\"50px\" height=\"50px\" viewBox=\"0 0 28 28\">\n    <!-- 28= RADIUS*2 + STROKEWIDTH -->\n\n    <title>Material design circular activity spinner with CSS3 animation</title>\n    <style type=\"text/css\">\n        /**************************/\n        /* STYLES FOR THE SPINNER */\n        /**************************/\n\n        /*\n         * Constants:\n         *      RADIUS      = 12.5\n         *      STROKEWIDTH = 3\n         *      ARCSIZE     = 270 degrees (amount of circle the arc takes up)\n         *      ARCTIME     = 1333ms (time it takes to expand and contract arc)\n         *      ARCSTARTROT = 216 degrees (how much the start location of the arc\n         *                                should rotate each time, 216 gives us a\n         *                                5 pointed star shape (it\'s 360/5 * 2).\n         *                                For a 7 pointed star, we might do\n         *                                360/7 * 3 = 154.286)\n         *\n         *      SHRINK_TIME = 400ms\n         */\n\n        .qp-circular-loader {\n            width:28px;  /* 2*RADIUS + STROKEWIDTH */\n            height:28px; /* 2*RADIUS + STROKEWIDTH */\n        }\n        .qp-circular-loader-path {\n            stroke-dasharray: 58.9;  /* 2*RADIUS*PI * ARCSIZE/360 */\n            stroke-dashoffset: 58.9; /* 2*RADIUS*PI * ARCSIZE/360 */\n            /* hides things initially */\n        }\n\n        /* SVG elements seem to have a different default origin */\n        .qp-circular-loader, .qp-circular-loader * {\n            -webkit-transform-origin: 50% 50%;\n            -moz-transform-origin: 50% 50%;\n        }\n\n        /* Rotating the whole thing */\n        @-webkit-keyframes rotate {\n            from {-webkit-transform: rotate(0deg);}\n            to {-webkit-transform: rotate(360deg);}\n        }\n        @-moz-keyframes rotate {\n            from {-webkit-transform: rotate(0deg);}\n            to {-webkit-transform: rotate(360deg);}\n        }\n        .qp-circular-loader {\n            -webkit-animation-name: rotate;\n            -webkit-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\n            -webkit-animation-iteration-count: infinite;\n            -webkit-animation-timing-function: linear;\n            -moz-animation-name: rotate;\n            -moz-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\n            -moz-animation-iteration-count: infinite;\n            -moz-animation-timing-function: linear;\n        }\n\n        /* Filling and unfilling the arc */\n        @-webkit-keyframes fillunfill {\n            from {\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\n                /* 0.1 a bit of a magic constant here */\n            }\n            50% {\n                stroke-dashoffset: 0;\n            }\n            to {\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\n                /* 0.5 a bit of a magic constant here */\n            }\n        }\n        @-moz-keyframes fillunfill {\n            from {\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\n                /* 0.1 a bit of a magic constant here */\n            }\n            50% {\n                stroke-dashoffset: 0;\n            }\n            to {\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\n                /* 0.5 a bit of a magic constant here */\n            }\n        }\n        @-webkit-keyframes rot {\n            from {\n                -webkit-transform: rotate(0deg);\n            }\n            to {\n                -webkit-transform: rotate(-360deg);\n            }\n        }\n        @-moz-keyframes rot {\n            from {\n                -webkit-transform: rotate(0deg);\n            }\n            to {\n                -webkit-transform: rotate(-360deg);\n            }\n        }\n        @-moz-keyframes colors {\n            0% {\n                stroke: #4285F4;\n            }\n            25% {\n                stroke: #DE3E35;\n            }\n            50% {\n                stroke: #F7C223;\n            }\n            75% {\n                stroke: #1B9A59;\n            }\n            100% {\n                stroke: #4285F4;\n            }\n        }\n\n        @-webkit-keyframes colors {\n            0% {\n                stroke: #4285F4;\n            }\n            25% {\n                stroke: #DE3E35;\n            }\n            50% {\n                stroke: #F7C223;\n            }\n            75% {\n                stroke: #1B9A59;\n            }\n            100% {\n                stroke: #4285F4;\n            }\n        }\n\n        @keyframes colors {\n            0% {\n                stroke: #4285F4;\n            }\n            25% {\n                stroke: #DE3E35;\n            }\n            50% {\n                stroke: #F7C223;\n            }\n            75% {\n                stroke: #1B9A59;\n            }\n            100% {\n                stroke: #4285F4;\n            }\n        }\n        .qp-circular-loader-path {\n            -webkit-animation-name: fillunfill, rot, colors;\n            -webkit-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\n            -webkit-animation-iteration-count: infinite, infinite, infinite;\n            -webkit-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\n            -webkit-animation-play-state: running, running, running;\n            -webkit-animation-fill-mode: forwards;\n\n            -moz-animation-name: fillunfill, rot, colors;\n            -moz-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\n            -moz-animation-iteration-count: infinite, infinite, infinite;\n            -moz-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\n            -moz-animation-play-state: running, running, running;\n            -moz-animation-fill-mode: forwards;\n        }\n\n    </style>\n\n    <!-- 3= STROKEWIDTH -->\n    <!-- 14= RADIUS + STROKEWIDTH/2 -->\n    <!-- 12.5= RADIUS -->\n    <!-- 1.5=  STROKEWIDTH/2 -->\n    <!-- ARCSIZE would affect the 1.5,14 part of this... 1.5,14 is specific to\n         270 degress -->\n    <g class=\"qp-circular-loader\">\n        <path class=\"qp-circular-loader-path\" fill=\"none\" d=\"M 14,1.5 A 12.5,12.5 0 1 1 1.5,14\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n    </g>\n</svg>");
$templateCache.put("noAvailableHours.html","<span class=\"noAvailableHours\">{{\"noAvailableHours\" | translate}}</span>");}]);
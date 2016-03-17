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
    angular.module('angular.reservation').controller('ReservationCtrl', [reservationCtrl]);

    function reservationCtrl() {
        //Capture the this context of the Controller using vm, standing for procedureModel
        var vm = this;

        vm.selectedTab = 0;

        vm.selectedDate = new Date();

        vm.selectedHour = "";

        //Hardcoded data
        vm.availableHours = ["10:00", "10.30", "11.30", "12.30", "13.00", "17.00", "17.30", "18.00", "18.30", "19.00"];


        //METHODS
        vm.onSelectDate = function() {
            vm.selectedTab = 1;
        }

        vm.selectHour = function(hour) {
            vm.selectedHour = hour;
            vm.selectedTab = 2;
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
angular.module("angular.reservation").run(["$templateCache", function($templateCache) {$templateCache.put("index.html","<div class=\"tabs\">\r\n    <md-content>\r\n        <md-tabs md-border-bottom md-selected=\"reservationCtrl.selectedTab\" md-center-tabs md-swipe-content>\r\n            <md-tab>\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">date_range</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <md-calendar ng-model=\"reservationCtrl.selectedDate\" ng-change=\"reservationCtrl.onSelectDate()\"></md-calendar>\r\n                </md-tab-body>\r\n            </md-tab>\r\n\r\n            <md-tab>\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">schedule</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    <md-content>\r\n                        <md-list>\r\n                            <md-list-item class=\"md-1-line\" ng-repeat=\"item in reservationCtrl.availableHours\">\r\n                                <div class=\"md-list-item-text\">\r\n                                    <h3>{{item}}</h3>\r\n                                </div>\r\n                                <md-button class=\"md-secondary\" ng-click=\"reservationCtrl.selectHour(item)\">Select</md-button>\r\n                                <md-divider ng-if=\"!$last\"></md-divider>\r\n                            </md-list-item>\r\n                        </md-list>\r\n                    </md-content>\r\n                </md-tab-body>\r\n            </md-tab>\r\n\r\n            <md-tab>\r\n                <md-tab-label>\r\n                    <i class=\"material-icons\" style=\"font-size: 36px\">person</i>\r\n                </md-tab-label>\r\n\r\n                <md-tab-body>\r\n                    View for Item #3\r\n                </md-tab-body>\r\n            </md-tab>\r\n        </md-tabs>\r\n    </md-content>\r\n</div>");}]);
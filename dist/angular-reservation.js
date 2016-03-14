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

        vm.date = null;
        vm.minDate = new Date();

        vm.selectedTab = 0;

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
angular.module("angular.reservation").run(["$templateCache", function($templateCache) {$templateCache.put("index.html","<div>\r\n	<h1 class=\"my-class\">Welcome!</h1>\r\n	<h2>Date: {{reservationCtrl.minDate}}</h2>\r\n\r\n	<div ng-cloak class=\"tabsdemoDynamicHeight\">\r\n		<md-content>\r\n			<md-tabs md-border-bottom md-selected=\"reservationCtrl.selectedTab\" md-center-tabs md-swipe-content>\r\n				<md-tab>\r\n                    <md-tab-label>\r\n                        <i class=\"material-icons\" style=\"font-size: 36px\">date_range</i>\r\n                    </md-tab-label>\r\n\r\n                    <md-tab-body>\r\n                        View for Item #1\r\n                    </md-tab-body>\r\n				</md-tab>\r\n\r\n				<md-tab>\r\n                    <md-tab-label>\r\n                        <i class=\"material-icons\" style=\"font-size: 36px\">schedule</i>\r\n                    </md-tab-label>\r\n\r\n                    <md-tab-body>\r\n                        View for Item #2\r\n                    </md-tab-body>\r\n				</md-tab>\r\n\r\n				<md-tab>\r\n                    <md-tab-label>\r\n                        <i class=\"material-icons\" style=\"font-size: 36px\">person</i>\r\n                    </md-tab-label>\r\n\r\n                    <md-tab-body>\r\n                        View for Item #3\r\n                    </md-tab-body>\r\n				</md-tab>\r\n			</md-tabs>\r\n		</md-content>\r\n	</div>\r\n</div>");}]);
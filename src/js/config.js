/**
 * Provider for reservation module
 * @author hmartos
 */
(function() {
    angular.module('angular.reservation').provider('reservationConfig', [reservationConfigProvider]);

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
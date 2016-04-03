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
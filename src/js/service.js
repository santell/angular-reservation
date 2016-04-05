/**
 * Service for reservation management
 * @author hmartos
 */
(function() {
    function reservationService() {

        //Before reserve callback
        this.onBeforeReserve = function(selectedDate, selectedHour, userData) {
            console.log("Executing before reserve callback");
        }

        //Completed reserve callback
        this.onCompletedReserve = function(statusLevel, message, selectedDate, selectedHour, userData) {
            console.log("Executing completed reserve callback");
        }

        //Success reserve callback
        this.onSuccessfulReserve = function(reservedDate, reservedHour, userData) {
            console.log("Executing successful reserve callback");
        }

        //Error reserve callback
        this.onErrorReserve = function(level, message, selectedDate, selectedHour, userData) {
            console.log("Executing error reserve callback");
        }

    }
    angular.module('hm.reservation').service('reservationService', [reservationService]);
})();
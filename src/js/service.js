/**
 * Service for reservation management
 * @author hmartos
 */
(function() {
    function reservationService($q) {

        //Before get available hours callback
        this.onBeforeGetAvailableHours = function(selectedDate, selectedHour, userData) {
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
        this.onSuccessfulGetAvailableHours = function(selectedDate) {
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

            deferred.resolve();
            //deferred.reject();

            return deferred.promise;
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
    angular.module('hm.reservation').service('reservationService', ['$q', reservationService]);
})();
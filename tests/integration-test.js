/**
 * Test for angular-reservation controller
 * @author hmartos
 */

'use strict';

describe('angular-reservation controller', function () {

    beforeEach(module('hm.reservation'));

    describe('Tests', function () {
        it('Ensure tests are working', inject(function () {
            //Just to test if test runner is working properly
            expect(2 + 2).toEqual(4);
            expect(2 + 2).not.toEqual(5);
        }));
    });

    describe('ReservationCtrl', function () {
        var scope;
        var controller;
        var service;
        var factory;
        var config;

        beforeEach(inject(function ($rootScope, $controller, $filter, $translate, _reservationAPIFactory_, _reservationConfig_, _reservationService_) {
            scope = $rootScope.$new();

           //As this is an integration test, here we should inject services and not mocks
            service = _reservationService_;
            factory = _reservationAPIFactory_;

            config = {
                getAvailableHoursAPIUrl: "http://localhost:8080/api/availableHours", //API url endpoint to load list of available hours
                reserveAPIUrl: "http://localhost:8080/api/reserve", //API url endpoint to do a reserve
                dateFormat: "yyyy-MM-dd",
                language: "en",
                showConfirmationModal: true,
                datepickerTemplate: "datepicker.html",
                availableHoursTemplate: "availableHours.html",
                noAvailableHoursTemplate: "noAvailableHours.html",
                clientFormTemplate: "clientForm.html",
                confirmationModalTemplate: "confirmationModal.html"
            }

            //_reservationConfig_.set(config);

            controller = $controller('ReservationCtrl', {$scope: scope, $filter: $filter, $translate: $translate, reservationAPIFactory: _reservationAPIFactory_, reservationConfig: config, reservationService: _reservationService_});
        }));

        describe('Date selection logic', function () {

            beforeEach(inject(function ($rootScope, reservationService, reservationAPIFactory) {
                spyOn(reservationService, 'onBeforeGetAvailableHours').and.callThrough();

                spyOn(reservationAPIFactory, 'getAvailableHours').and.callThrough();

                /*spyOn(viewIncidentService, 'listIncidentTypeProcedure').and.returnValue({
                    then: function (callbackSuccess, callbackError) {
                        callbackSuccess(ListIncidentTypeProcedure_OUT);
                    }
                });*/

                //Call onSelectDate function
                controller.onSelectDate();

                //TODO Organize this. Uncommented executes getAvailableHours callback
                /*deferred.resolve(); //TODO Pass parameters
                $rootScope.$digest();
                expect(factory.getAvailableHours).toHaveBeenCalled();*/
            }));

            it('Selected date a valid Date object', inject(function () {

                expect(controller.selectedDate instanceof Date).toBeTruthy();
            }));

            it('Second tab is unlocked', inject(function () {
                expect(controller.secondTabLocked).toBeFalsy();
            }));


            it('Selected tab is now the second tab', inject(function () {
                expect(controller.selectedTab).toBe(1);
            }));

            it('onBeforeAvailableHours service method is called', inject(function (reservationService) {
                expect(reservationService.onBeforeGetAvailableHours).toHaveBeenCalled();
                //TODO See toHaveBeenCalledWith()
            }));

            it('Loader is shown until promise is resolved or rejected an hidden when promised is resolved or rejected', inject(function ($rootScope, $q) {
                //expect(controller.loader).toBeTruthy();
                //TODO Implement
            }));

            it('getAvailableHours factory method is called', inject(function (reservationConfig, reservationAPIFactory, $rootScope, $q) {
                //TODO Why do I have to do this??
                var deferred = $q.defer();
                deferred.resolve();
                $rootScope.$digest();
                console.log("Selected date: " + controller.selectedDate);
                console.log("availableHoursStatus: " + controller.availableHoursStatus);
                console.log("reservationConfig", reservationConfig);
                expect(reservationAPIFactory.getAvailableHours).toHaveBeenCalled();
                expect(controller.availableHoursStatus).toBeDefined();
                //TODO Pass parameters
            }));

            it('Request status is defined', inject(function ($rootScope, $q) {
                //expect(controller.availableHoursStatus).toBeDefined();
                //TODO Implemment
            }));

            it('spec', inject(function ($rootScope, $q) {
                //expect(controller.loader).toBeTruthy();
                //TODO Implemment
            }));

            it('spec', inject(function ($rootScope, $q) {
                //expect(controller.loader).toBeTruthy();
                //TODO Implemment
            }));
        });

    });
});
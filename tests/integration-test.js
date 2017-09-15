/**
 * Test for angular-reservation controller
 * @author hmartos
 */

'use strict';

describe('angular-reservation integration test', function () {

    //Set values for tests
    var config = {
        getAvailableHoursAPIUrl: "http://{API-URL}/availableHours",
        reserveAPIUrl: "http://{API-URL}/reserve",
        dateFormat: "dd/MM/yyyy",
        language: "es",
        showConfirmationModal: false,
        datepickerTemplate: "myDatepicker.html",
        availableHoursTemplate: "mAvailableHours.html",
        noAvailableHoursTemplate: "myNoAvailableHours.html",
        clientFormTemplate: "myClientForm.html",
        confirmationModalTemplate: "myConfirmationModal.html"
    }

    beforeEach(module('hm.reservation'));

    beforeEach(function () {
        module(function(reservationConfigProvider) {
            reservationConfigProvider.set(config);
        });
    });

    describe('Tests', function () {
        it('Ensure tests are working', inject(function () {
            //Just to test if test runner is working properly
            expect(2 + 2).toEqual(4);
            expect(2 + 2).not.toEqual(5);
        }));
    });

    describe('Configuration', function () {

        var reservationConfig;

        //Override with our configuration
        var config = {
            getAvailableHoursAPIUrl: "http://{API-URL}/availableHours",
            reserveAPIUrl: "http://{API-URL}/reserve",
            dateFormat: "dd/MM/yyyy",
            language: "es",
            showConfirmationModal: false,
            datepickerTemplate: "myDatepicker.html",
            availableHoursTemplate: "mAvailableHours.html",
            noAvailableHoursTemplate: "myNoAvailableHours.html",
            clientFormTemplate: "myClientForm.html",
            confirmationModalTemplate: "myConfirmationModal.html"
        }

        beforeEach(inject(function (_reservationConfig_) {
            reservationConfig = _reservationConfig_;
        }));

        describe('Override default configuration', function() {

            it('Module configuration is applied correctly', inject(function (reservationConfig) {
                //reservationConfig.set(config);
                expect(reservationConfig).toEqual(config);
            }));
        });
    });

    describe('Reservation flux', function () {
        var scope;
        var controller;
        var service;
        var factoryMock;

        //Set values for tests
        var selectedDate = new Date();
        selectedDate.setHours(0,0,0,0); //Date at start of today
        var selectedHour = "10:00";
        var userData = {name: "Héctor", phone: "123456789", email: "myemail@email.com"};

        beforeEach(inject(function ($rootScope, $controller, $filter, $translate, _reservationAPIFactory_, _reservationConfig_, _reservationService_, $q) {
            scope = $rootScope.$new();

            //Mock factory to avoid dealing with API's errors
            factoryMock = {};
            factoryMock.getAvailableHours = function () {
                factoryMock.status = "SUCCESS";
                factoryMock.message = "a message";
                factoryMock.availableHours = ["10:00", "11:00"];

                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
            factoryMock.reserve = function () {
                factoryMock.status = "SUCCESS";
                factoryMock.message = "other message";

                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }

            controller = $controller('ReservationCtrl', {
                $scope: scope,
                $filter: $filter,
                $translate: $translate,
                reservationAPIFactory: factoryMock,
                reservationConfig: _reservationConfig_,
                reservationService: _reservationService_
            });
        }));

        describe('Date selection logic', function () {

            beforeEach(inject(function ($rootScope, $q, reservationService, reservationAPIFactory) {
                spyOn(reservationService, 'onBeforeGetAvailableHours').and.returnValue({
                    then: function (callbackSuccess, callbackError) {
                        callbackSuccess();
                    }
                });

                //Call onSelectDate function
                controller.onSelectDate(selectedDate);
            }));

            it('Select date correctly and elected date is a valid Date object', inject(function () {
                expect(controller.selectedDate instanceof Date).toBeTruthy();
                expect(controller.selectedDate).toEqual(selectedDate);
            }));

            it('Second tab is unlocked', inject(function () {
                expect(controller.secondTabLocked).toBeFalsy();
            }));


            it('Selected tab is now the second tab', inject(function () {
                expect(controller.selectedTab).toBe(1);
            }));

            it('onBeforeAvailableHours service method is called', inject(function ($rootScope, reservationService) {
                expect(reservationService.onBeforeGetAvailableHours).toHaveBeenCalledWith(selectedDate);
            }));

            it('Loader is shown until promise is resolved or rejected an hidden when promised is resolved or rejected', inject(function ($rootScope, $q) {
                expect(controller.loader).toBeTruthy();
                $rootScope.$digest(); //MUST HAVE call for promise in onBeforeGetAvailableHours to run
                expect(controller.loader).toBeFalsy();
            }));

            it('getAvailableHours factory method is called and response is mapped successfully', inject(function (reservationConfig, reservationAPIFactory, reservationService, $rootScope) {
                spyOn(reservationService, 'onCompletedGetAvailableHours').and.callThrough();
                spyOn(reservationService, 'onSuccessfulGetAvailableHours').and.callThrough();

                $rootScope.$digest(); //MUST HAVE call for promise in onBeforeGetAvailableHours to run
                expect(reservationService.onCompletedGetAvailableHours).toHaveBeenCalledWith(factoryMock.status, factoryMock.message, selectedDate);
                expect(reservationService.onSuccessfulGetAvailableHours).toHaveBeenCalledWith(factoryMock.status, factoryMock.message, selectedDate, factoryMock.availableHours);

                expect(controller.availableHoursStatus).toBe(factoryMock.status);
                expect(controller.availableHoursMessage).toBe(factoryMock.message);
                expect(controller.availableHours).toEqual(factoryMock.availableHours);
            }));
        });

        describe('Hour selection logic', function () {

            beforeEach(inject(function () {
                //Call selectHour function
                controller.selectHour(selectedHour);
            }));

            it('Select hour correctly', inject(function () {
                expect(controller.selectedHour).toBe(selectedHour);
            }));

            it('Unlock third tab', inject(function () {
                expect(controller.thirdTabLocked).toBeFalsy();
            }));

            it('Selected tab is now the third tab', inject(function () {
                expect(controller.selectedTab).toBe(2);
            }));
        });

        describe('Reserve logic', function () {

            beforeEach(inject(function (reservationService) {
                spyOn(reservationService, 'onBeforeGetAvailableHours').and.returnValue({
                    then: function (callbackSuccess, callbackError) {
                        callbackSuccess();
                    }
                });

                //Call onSelectDate function
                controller.onSelectDate(selectedDate);

                //Call selectHour function
                controller.selectHour(selectedHour);


                spyOn(reservationService, 'onBeforeReserve').and.returnValue({
                    then: function (callbackSuccess, callbackError) {
                        callbackSuccess();
                    }
                });
                spyOn(reservationService, 'onCompletedReserve').and.callThrough();
                spyOn(reservationService, 'onSuccessfulReserve').and.callThrough();

                //Call reserve function
                controller.reserve(selectedDate, selectedHour, userData);
            }));

            it('onBeforeReserve service method is called', inject(function (reservationService) {
                expect(reservationService.onBeforeReserve).toHaveBeenCalledWith(selectedDate, selectedHour, userData);
            }));

            it('Loader is shown until promise is resolved or rejected an hidden when promised is resolved or rejected', inject(function ($rootScope, $q) {
                expect(controller.loader).toBeTruthy();
                $rootScope.$digest(); //MUST HAVE call for promise in onBeforeReserve to run
                expect(controller.loader).toBeFalsy();
            }));

            it('reserve factory method is called and response is mapped successfully', inject(function ($rootScope, reservationService) {
                $rootScope.$digest(); //MUST HAVE call for promise in onBeforeReserve to run
                expect(reservationService.onCompletedReserve).toHaveBeenCalledWith(factoryMock.status, factoryMock.message, selectedDate, selectedHour, userData);
                expect(reservationService.onSuccessfulReserve).toHaveBeenCalledWith(factoryMock.status, factoryMock.message, selectedDate, selectedHour, userData);
                expect(controller.reservationStatus).toBe(factoryMock.status);
                expect(controller.reservationMessage).toBe(factoryMock.message);
            }));

        });

    });
});
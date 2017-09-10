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
        var factoryMock;
        var config;

        beforeEach(inject(function ($rootScope, $controller, $filter, $translate, _reservationAPIFactory_, _reservationConfig_, _reservationService_, $q) {
            scope = $rootScope.$new();

            //As this is an integration test, here we should inject real service and not mock
            service = _reservationService_;

            //Mock factory to avoid dealing with API's errors
            factoryMock = {status: "SUCCESS", message: "a message", availableHours: ["10:00", "11:00"]};
            factoryMock.getAvailableHours = function () {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }

            //TODO How to integrate reservationConfig?
            //Overrride with tour configuration
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

            var configProvider = {
                $get: function () {
                    return config;
                },
                set: function (values) {
                    angular.extend(config, values);
                }
            }

            controller = $controller('ReservationCtrl', {
                $scope: scope,
                $filter: $filter,
                $translate: $translate,
                reservationAPIFactory: factoryMock,
                reservationConfig: configProvider,
                reservationService: _reservationService_
            });
        }));

        describe('Date selection logic', function () {

            beforeEach(inject(function ($rootScope, $q, reservationService, reservationAPIFactory) {
                spyOn(reservationService, 'onBeforeGetAvailableHours').and.callThrough();

                /*spyOn(viewIncidentService, 'listIncidentTypeProcedure').and.returnValue({
                 then: function (callbackSuccess, callbackError) {
                 callbackSuccess(ListIncidentTypeProcedure_OUT);
                 }
                 });*/

                //Call onSelectDate function
                controller.onSelectDate();
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

            it('getAvailableHours factory method is called and response is mapped correctly', inject(function (reservationConfig, reservationAPIFactory, $rootScope) {
                //TODO Why do I have to do this??
                $rootScope.$digest(); //MUST HAVE call for promise in onBeforeGetAvailableHours to run
                console.log("reservationConfig", reservationConfig.getAvailableHoursAPIUrl);
                expect(controller.availableHoursStatus).toBe("SUCCESS");
                expect(controller.availableHoursMessage).toBe("a message");
                expect(controller.availableHours).toEqual(["10:00", "11:00"]);
            }));
        });

        describe('Hour selection logic', function () {

            beforeEach(inject(function () {
                //Call selectHour function
                controller.selectHour("10:00");
            }));

            it('Select hour correctly', inject(function () {
                expect(controller.selectedHour).toBe("10:00");
            }));

            it('Unlock third tab', inject(function () {
                expect(controller.thirdTabLocked).toBeFalsy();
            }));

            it('Select hour correctly', inject(function () {
                expect(controller.selectedTab).toBe(2);
            }));
        });

        describe('Reserve logic', function () {

            beforeEach(inject(function (reservationService) {
                spyOn(reservationService, 'onBeforeReserve').and.callThrough();

                //Call selectHour function
                controller.reserve();
            }));

            it('onBeforeReserve service method is called', inject(function (reservationService) {
                expect(reservationService.onBeforeReserve).toHaveBeenCalled();
            }));

        });

    });
});
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
        var serviceMock;
        var service;
        var factoryMock;
        var factory;
        var config;
        var $q;

        beforeEach(inject(function ($rootScope, $controller, $filter, $translate, _reservationAPIFactory_, _reservationConfig_, _reservationService_) {
            scope = $rootScope.$new();

            //TODO Mock service
            factoryMock = {
                getAvailableHours: function (params) {}
            };

            serviceMock = {
                onBeforeGetAvailableHours: function (selectedDate) {}
            };

            service = _reservationService_;
            factory = _reservationAPIFactory_;

            controller = $controller('ReservationCtrl', {$scope: scope, $filter: $filter, $translate: $translate, reservationAPIFactory: factory, reservationConfig: _reservationConfig_, reservationService: service});
        }));

        it('Is defined', inject(function () {
            //Checks that controller is defined
            expect(controller).toBeDefined();
        }));

        describe('Date selection logic', function () {

            beforeEach(inject(function ($rootScope, $q) {
                var deferred = $q.defer();
                spyOn(service, 'onBeforeGetAvailableHours').and.returnValue($q.when()).and.callThrough();

                spyOn(factory, 'getAvailableHours').and.returnValue(deferred.promise);//.and.callThrough();

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

            it('onBeforeAvailableHours service method is called', inject(function () {
                expect(service.onBeforeGetAvailableHours).toHaveBeenCalled();
                //TODO See toHaveBeenCalledWith()
            }));

            it('Loader is shown until promise is resolved or rejected an hidden when promised is resolved or rejected', inject(function ($rootScope, $q) {
                expect(controller.loader).toBeTruthy();

                var deferred = $q.defer();
                deferred.resolve();
                $rootScope.$digest();

                expect(controller.loader).toBeTruthy();
            }));

            it('getAvailableHours factory method is called', inject(function ($rootScope, $q) {
                var deferred = $q.defer();
                deferred.resolve();
                $rootScope.$digest();
                expect(factory.getAvailableHours).toHaveBeenCalled();
                //TODO Pass parameters
            }));
        });

    });
});
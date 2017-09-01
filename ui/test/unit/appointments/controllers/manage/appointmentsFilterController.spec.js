'use strict';

describe('AppointmentsFilterController', function () {
    var controller, scope, state, location, appService, appDescriptor, appointmentsServiceService, ivhTreeviewMgr, q;
    var providerService = jasmine.createSpyObj('providerService', ['list']);

    var servicesWithTypes = {
        data: [{
            appointmentServiceId: 1,
            name: "ortho",
            speciality: {
                name: "Cardiology",
                uuid: "bdbb1d1e-87c8-11e7-93b0-080027e99513"
            },
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: 12,
            durationMins: 60,
            location: {},
            uuid: "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
            color: "#006400",
            weeklyAvailability: [],
            serviceTypes: [
                {
                    duration: 15,
                    name: "maxillo",
                    uuid: "de849ecd-47ad-4610-8080-20e7724b2df6"
                }]
        }]
    };
    var providers = {
        data: {
            results: [{
                "uuid": "f9badd80-ab76-11e2-9e96-0800200c9a66",
                "display": "1-Jane"
            }, {
                "uuid": "df17bca9-ff9b-4a73-bac7-f302fc688974",
                "display": "2-June"
            }]
        }
    };

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
            state = jasmine.createSpyObj('state', ['go']);
            q = jasmine.createSpyObj('$q', ['all']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            location = jasmine.createSpyObj('$location', ['url']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getAllServicesWithServiceTypes']);
            ivhTreeviewMgr = jasmine.createSpyObj('ivhTreeviewMgr', ['deselectAll', 'selectEach']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
            appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({}));
            q.all.and.returnValue(specUtil.simplePromise({}));
            state.params = {filterParams: {}}
        });
    });

    providerService.list.and.returnValue(specUtil.simplePromise(providers));

    var createController = function () {
        controller('AppointmentsFilterController', {
            $scope: scope,
            appService: appService,
            appointmentsServiceService: appointmentsServiceService,
            $location: location,
            $state: state,
            ivhTreeviewMgr: ivhTreeviewMgr,
            $q: q
        });
    };



    it("should get tabName from state.current", function () {
        state = {
            params : {filterParams : {}},
            name: "home.manage.appointments.calendar",
            url: '/calendar',
            current: {
                tabName: 'calendar'
            }
        };
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        var tabName = scope.getCurrentAppointmentTabName();
        expect(tabName).toBe("calendar");
    });

    it("should map specialities to ivh tree", function () {
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({data:[{
            appointmentServiceId: 1,
            name: "ortho",
            speciality: {
                name: "Cardiology",
                uuid: "bdbb1d1e-87c8-11e7-93b0-080027e99513"
            },
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: 12,
            durationMins: 60,
            location: {},
            uuid: "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
            color: "#006400",
            weeklyAvailability: [],
            serviceTypes: [
                {
                    duration: 15,
                    name: "maxillo",
                    uuid: "de849ecd-47ad-4610-8080-20e7724b2df6"
                }]
        }]}));
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        expect(scope.selectedSpecialities[0].label).toBe("Cardiology");
        expect(scope.selectedSpecialities[0].children[0].label).toBe("ortho");
        expect(scope.selectedSpecialities[0].children[0].children[0].label).toBe("maxillo");
    });

    it("should map selected services to state params", function(){
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({data:[{
            appointmentServiceId: 1,
            name: "ortho",
            speciality: {
                name: "Cardiology",
                uuid: "bdbb1d1e-87c8-11e7-93b0-080027e99513"
            },
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: 12,
            durationMins: 60,
            location: {},
            uuid: "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
            color: "#006400",
            weeklyAvailability: [],
            serviceTypes: [
                {
                    duration: 15,
                    name: "maxillo",
                    uuid: "de849ecd-47ad-4610-8080-20e7724b2df6"
                }]
        }]}));
        createController();
        state.params = {};
        scope.selectedSpecialities = [
            {
                "label": "Speciality",
                "children": [
                    {
                        "label": "Dermatology",
                        "id": "75c006aa-d3dd-4848-9735-03aee74ae27e",
                        "children": [
                            {
                                "label": "type1",
                                "id": "f9556d31-2c42-4c7b-8d05-48aceeae0c9a",
                                "selected": true
                            }
                        ],
                        "selected": true
                    },
                    {
                        "label": "Ophthalmology",
                        "id": "02666cc6-5f3e-4920-856d-ab7e28d3dbdb",
                        "children": [
                            {
                                "label": "type1",
                                "id": "6f59ba62-ddf4-46bc-b866-c09ae7b8200f",
                                "selected": false
                            }
                        ],
                        "selected": false
                    }
                ],
                "selected": false
            }
        ];
        scope.applyFilter();
        expect(state.params.filterParams.serviceUuids.length).toEqual(1);
        expect(state.params.filterParams.serviceUuids[0]).toEqual("75c006aa-d3dd-4848-9735-03aee74ae27e");
    });

    it('should set service types to state params', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({}));
        createController();
        state.params = {};
        scope.selectedSpecialities = [
            {
                "label": "Speciality",
                "children": [
                    {
                        "label": "Dermatology",
                        "id": "75c006aa-d3dd-4848-9735-03aee74ae27e",
                        "children": [
                            {
                                "label": "type1",
                                "id": "f9556d31-2c42-4c7b-8d05-48aceeae0c9a",
                                "selected": true
                            },
                            {
                                "label": "type2",
                                "id": "f9556d31-2c42-4c7b-8d05-48aceeae0900",
                                "selected": false
                            }
                        ],
                        "selected": false
                    },
                    {
                        "label": "Ophthalmology",
                        "id": "02666cc6-5f3e-4920-856d-ab7e28d3dbdb",
                        "children": [
                            {
                                "label": "type1",
                                "id": "6f59ba62-ddf4-46bc-b866-c09ae7b8200f",
                                "selected": false
                            }
                        ],
                        "selected": false
                    }
                ],
                "selected": false
            }
        ];
        scope.applyFilter();
        expect(state.params.filterParams.serviceTypeUuids.length).toEqual(1);
        expect(state.params.filterParams.serviceTypeUuids[0]).toEqual("f9556d31-2c42-4c7b-8d05-48aceeae0c9a");
    });

    it('should select service types only when the service is not selected', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({}));
        createController();
        state.params = {};
        scope.selectedSpecialities = [
            {
                "label": "Speciality",
                "children": [
                    {
                        "label": "Dermatology",
                        "id": "75c006aa-d3dd-4848-9735-03aee74ae27e",
                        "children": [
                            {
                                "label": "type1",
                                "id": "f9556d31-2c42-4c7b-8d05-48aceeae0c9a",
                                "selected": true
                            },
                            {
                                "label": "type2",
                                "id": "f9556d31-2c42-4c7b-8d05-48aceeae0900",
                                "selected": true
                            }
                        ],
                        "selected": true
                    },
                    {
                        "label": "Ophthalmology",
                        "id": "02666cc6-5f3e-4920-856d-ab7e28d3dbdb",
                        "children": [
                            {
                                "label": "type1",
                                "id": "6f59ba62-ddf4-46bc-b866-c09ae7b8200f",
                                "selected": true
                            }
                        ],
                        "selected": true
                    }
                ],
                "selected": false
            }
        ];
        scope.applyFilter();
        expect(state.params.filterParams.serviceTypeUuids.length).toEqual(0);
        expect(state.params.filterParams.serviceUuids.length).toEqual(2);
        expect(state.params.filterParams.serviceUuids[0]).toEqual("75c006aa-d3dd-4848-9735-03aee74ae27e");
        expect(state.params.filterParams.serviceUuids[1]).toEqual("02666cc6-5f3e-4920-856d-ab7e28d3dbdb");
    });

    it('should reset ivh Tree, reset the filter and apply them on appointments', function () {
        state.params={};
        state.params.filterParams = {serviceUuids: ["someServiceUuid"], serviceTypeUuid: ["serviceTypeUuid"], providerUuids: [], statusList: []};
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({ data: [{
            appointmentServiceId: 1,
            name: "ortho",
            speciality: {
                name: "Cardiology",
                uuid: "bdbb1d1e-87c8-11e7-93b0-080027e99513"
            },
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: 12,
            durationMins: 60,
            location: {},
            uuid: "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
            color: "#006400",
            weeklyAvailability: [],
            serviceTypes: [
                {
                    duration: 15,
                    name: "maxillo",
                    uuid: "de849ecd-47ad-4610-8080-20e7724b2df6"
                }]
        }]}));

        scope.selectedSpecialities = [{
            label: 'Speciality',
            children: [{
                label: 'Dermatology',
                id: '75c006aa-d3dd-4848-9735-03aee74ae27e',
                children: [{
                    label: 'type1',
                    id: 'f9556d31-2c42-4c7b-8d05-48aceeae0c9a',
                    selected: true
                }, {label: 'type2', id: 'f9556d31-2c42-4c7b-8d05-48aceeae0900', selected: true}],
                selected: true
            }, {
                label: 'Ophthalmology',
                id: '02666cc6-5f3e-4920-856d-ab7e28d3dbdb',
                children: [{label: 'type1', id: '6f59ba62-ddf4-46bc-b866-c09ae7b8200f', selected: true}],
                selected: true
            }],
            selected: false
        }];
        createController();
        scope.searchText = "Cardio";
        scope.filterSelectedValues = {selected: true};
        scope.resetFilter();
        expect(state.params.filterParams.serviceTypeUuids.length).toBe(0);
        expect(state.params.filterParams.serviceUuids.length).toBe(0);
        expect(state.params.filterParams.providerUuids.length).toBe(0);
        expect(state.params.filterParams.statusList.length).toBe(0);
        expect(scope.selectedStatusList.length).toBe(0);
        expect(scope.selectedProviders.length).toBe(0);
        expect(scope.showSelected).toBeFalsy();
        expect(scope.filterSelectedValues).toBeUndefined();
        expect(scope.searchText).toBeUndefined();
        expect(ivhTreeviewMgr.deselectAll).toHaveBeenCalledWith(scope.selectedSpecialities, false);
    });

    it('should get providers, statusList and specialities', function () {
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise(servicesWithTypes));
        providerService.list.and.returnValue(specUtil.simplePromise(providers));
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        expect(scope.statusList.length).toBe(5);
        expect(scope.providers.length).toBe(2);
    });

    it('should preselect the services to filter when services are not empty in filterParams', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        state.params.filterParams.serviceUuids = ["d3f5062e-b92d-4c70-8d22-b199dcb65a2c"];
        createController();
        expect(scope.selectedSpecialities[0].label).toBe("Cardiology");
        expect(scope.selectedSpecialities[0].children[0].label).toBe("ortho");
        expect(scope.selectedSpecialities[0].children[0].children[0].label).toBe("maxillo");
        expect(ivhTreeviewMgr.selectEach).toHaveBeenCalledWith(scope.selectedSpecialities,state.params.filterParams.serviceUuids);
    });
    
    it('should set the selectedStatusList', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        state.params.filterParams.statusList = ["Completed", "Scheduled"];
        createController();
        expect(scope.selectedStatusList.length).toBe(2);
    });

    it('should return false when filters are empty', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        state.params.filterParams = {};
        createController();
        var filterApplied = scope.isFilterApplied();
        expect(filterApplied).toBeFalsy();
    });

    it('should return false when filters are empty', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        state.params.filterParams = {serviceUuids:[], providerUuids:[], statusList:[]};
        createController();
        var filterApplied = scope.isFilterApplied();
        expect(filterApplied).toBeFalsy();
    });

    it('should return true when filters are not empty', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        state.params.filterParams = {serviceUuids:["someServiceUuid"], providerUuids:[], statusList:[]};
        createController();
        var filterApplied = scope.isFilterApplied();
        expect(filterApplied).toBeTruthy();
    });

    it('should filter all the selected services when clicked on show selected toggle', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        scope.showSelected = true;
        scope.filterSelected();
        expect(scope.filterSelectedValues).toEqual({selected: true});
    });

    it('should filter all the selected services when clicked on show selected toggle', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        scope.showSelected = false;
        scope.filterSelected();
        expect(scope.filterSelectedValues).toBeUndefined();
    });

    it('should set state params when filter is expanded', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        scope.showSelected = false;
        state.params.isFilterOpen = false;
        state.isFilterOpen = false;
        scope.expandFilter();
        expect(state.params.isFilterOpen).toBeTruthy();
        expect(scope.isFilterOpen).toBeTruthy();
    });

    it('should reset state params when filter is minimized', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        scope.showSelected = true;
        state.params.isFilterOpen = true;
        state.isFilterOpen = true;
        scope.minimizeFilter();
        expect(state.params.isFilterOpen).toBeFalsy();
        expect(scope.isFilterOpen).toBeFalsy();
    });
});
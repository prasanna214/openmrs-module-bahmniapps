'use strict';

angular.module('ipd', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.ipd', 'bahmni.common.domain', 'bahmni.common.config', 'ui.router', 'bahmni.common.util', 'bahmni.common.routeErrorHandler', 'bahmni.common.i18n',
    'bahmni.common.displaycontrol.dashboard', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.displaycontrol.custom',
    'bahmni.common.obs', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.displaycontrol.navigationlinks', 'pascalprecht.translate',
    'bahmni.common.displaycontrol.dashboard', 'ngCookies', 'ngDialog', 'angularFileUpload', 'bahmni.common.offline']);
angular.module('ipd').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
    function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/home');
        var homeBackLink = {label: "", url: "../home/", accessKey: "h", icon: "fa-home", id: "homeBackLink"};
        var adtHomeBackLink = {label: "", url: "#/home", accessKey: "p", icon: "fa-users", id: "adtHomeBackLink" };
        var admitBackLink = {text: "New Admission", state: "admit", accessKey: "a"};
        var bedManagementBackLink = {text: "Bed Management", state: "bedManagement", accessKey: "b"};
        var backLinks = [homeBackLink, admitBackLink, bedManagementBackLink];

    // @if DEBUG='production'
        $compileProvider.debugInfoEnabled(false);
    // @endif

    // @if DEBUG='development'
        $compileProvider.debugInfoEnabled(true);
    // @endif

        $stateProvider
        .state('admit', {
            url: '/admit',
            data: {
                backLinks: backLinks
            },
            views: {
                'content': {
                    templateUrl: 'views/home.html',
                    controller: function ($scope, appService) {
                        $scope.isBedManagementEnabled = appService.getAppDescriptor().getConfig("isBedManagementEnabled").value;
                    }
                },
                //'wards@home': {
                //    templateUrl: 'views/wards.html',
                //    controller: 'WardsController'
                //},
                'additional-header': {
                    templateUrl: 'views/headerAdt.html'
                }
            },
            resolve: {
                initialization: 'initialization'
            }
        }).state('bedManagement', {
                url: '/bedManagement',
                data: {
                    backLinks: backLinks
                },
                views: {
                    'content': {
                        templateUrl: 'views/bedManagement.html',
                        controller: 'BedManagementController'
                    },
                    'additional-header': {
                        templateUrl: 'views/headerAdt.html'
                    }
                }

        }).state('bedManagement.patient', {
            url: '/patient/:patientUuid/visit/:visitUuid',
            templateUrl: 'views/bedManagement.html',
            controller: 'BedManagementController',
            resolve: {
                patientResolution: function ($stateParams, patientInitialization) {
                    return patientInitialization($stateParams.patientUuid);
                }
            }
        })
        .state('patient', {
            url: '/patient/:patientUuid',
            data: {
                backLinks: [homeBackLink, adtHomeBackLink]
            },
            abstract: true,
            views: {
                'header': {
                    templateUrl: 'views/headerAdt.html',
                    controller: function ($scope) {
                        $scope.showClinicalDashboardLink = true;
                    }
                },
                'content': {
                    template: '<ui-view/>'
                },
                'additional-header': {
                    templateUrl: '../common/patient/header/views/header.html'
                }
            },

            resolve: {
                patientResolution: function ($stateParams, patientInitialization) {
                    return patientInitialization($stateParams.patientUuid);
                }
            }
        });

        $bahmniTranslateProvider.init({app: 'ipd', shouldMerge: true});
    }]);
'use strict';
angular.module('AllSys')
.factory('myprojectServices',
    ['$http', '$rootScope', 'appSettings', '$timeout', '$window',
    function ($http, $rootScope, appSettings, $timeout, $window) {
        var serverPath = appSettings.apiPath;

        var _getProjects = function (empid, projectid) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/GetProjects?EmpId=' + empid + '&ProjectId=');
        };

        var _getProjectDetails = function (empid, projectid, category) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/GetProjectDetails?EmpId=' + empid + '&ProjectId=' + projectid + '&category=' + category );
        };

        var _getReportingDetails = function (empid, projectid, category) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/GetReportingDetails?EmpId=' + empid + '&ProjectId=' + projectid + '&category=' + category);
        };

        var _getTimesheetDetails = function (empid, startDate, endDate, projectid) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/GetTimesheetDatewise?EmpId=' + empid + '&StartDate=' + startDate + '&EndDate=' + endDate + '&ProjectId=' + projectid);
        };

        var _getTeamTimesheetDetails = function (empid, projectid, dateid, resourceid) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/GetTeamTimesheetDetails?EmpId=' + empid + '&ProjectId=' + projectid + '&DateId=' + dateid + '&ResourceId=' + resourceid);
        };

        var _getResourceDetails = function (projectid, empid, managerid) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/GetResourceDetails?ProjectId=' + projectid + '&EmpId=' + empid + '&ManagerId=' + managerid);
        };

        return {
            getProjects: _getProjects,
            getProjectDetails: _getProjectDetails,
            getReportingDetails: _getReportingDetails,
            getTimesheetDetails: _getTimesheetDetails,
            getTeamTimesheetDetails: _getTeamTimesheetDetails,
            getResourceDetails: _getResourceDetails
        };


    }])
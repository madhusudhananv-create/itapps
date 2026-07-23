'use strict';
angular.module('AllSys')
.factory('timesheetServices',
    ['$http', '$rootScope', 'appSettings', '$timeout', '$window',
    function ($http, $rootScope, appSettings, $timeout, $window) {
        var serverPath = appSettings.apiPath;

        var _getTimesheetDetails = function (empid, startDate, endDate, projectid) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/GetTimesheetDetails?StartDate=' + startDate + '&EndDate=' + endDate + 'EmpId=' + empid + '&Category=' + category + '&ProjectId=' + projectid);
        };

        return {
            getTimesheetDetails: _getTimesheetDetails,
        };


    }])
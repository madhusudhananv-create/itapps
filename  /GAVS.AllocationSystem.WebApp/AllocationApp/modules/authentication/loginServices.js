'use strict';
angular.module('AllSys')
.factory('AuthenticationService',
    ['$http', '$cookieStore', '$rootScope', 'appSettings', '$timeout', '$window',
    function ($http, $cookieStore, $rootScope, appSettings, $timeout, $window) {
        var serverPath = appSettings.apiPath;
        var service = {};

        service.Login = function (username, password, callback) {
            //var authdata = Base64.encode(username + ':' + password);
            var authdata = username + ':' + password;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
            return $http.get(serverPath + '/AllSys/Authenticate');

        };

        service.SetCredentials = function (username, password, token, empid) {

            //var authdata = Base64.encode(username + ':' + password);
            var authdata = username + ':' + password;

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    empid: empid, //'100248', //empid,
                    authData: authdata,
                    token: token,
                    tenant: 'default_tenant'
                }
            };

            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        return service;
    }])
'use strict';

angular.module('AllSys', ['ngRoute', 'ngCookies', 'ui.router', 'ui.grid', 'ui.grid.edit'])


.config(['$stateProvider', '$urlRouterProvider', '$routeProvider', '$controllerProvider', '$provide', 'rmDatepickerConfig', function ($stateProvider, $urlRouterProvider, $routeProvider, $controllerProvider, $provide, rmDatepickerConfig) {
    rmDatepickerConfig.mondayStart = true;
    rmDatepickerConfig.initState = "month";
    $urlRouterProvider.otherwise("/login");
    $stateProvider
         .state('loginMaster', {
             abstract: true,
             templateUrl: 'LoginMaster.html'
         })
         .state('loginMaster.login', {
              url: '/login',
              templateUrl: 'AllocationApp/modules/authentication/views/Login.html',
              controller: 'loginController'
         })
     .state('landingMaster', {
         abstract: true,
         templateUrl: 'LandingMaster.html'
     })
     .state('landingMaster.myprojects', {
         url: '/myprojects',
         templateUrl: 'AllocationApp/modules/common/myprojects/views/myprojects.html',
         controller: 'myprojectsController'
     })
        .state('landingMaster.timesheet', {
            url: '/timesheet',
            templateUrl: 'AllocationApp/modules/common/timesheet/views/timesheet.html',
            controller: 'timesheetController'
        })
     .state('landingMaster.myskillset', {
         url: '/myskillset',
         templateUrl: 'AllocationApp/modules/common/myskillset/views/myskillset.html',
         controller: 'menuController'
     })

}])

.constant("appSettings",
    {
        apiPath: "http://localhost:53505/api",
        logLevel: "low", // low, full
        OSWindows: "MicrosoftSharePoint,MicrosoftSQLServer,MicrosoftWindowsServer", //'MicrosoftSharePoint','MicrosoftSQLServer','MicrosoftWindowsServer'
        OSLinux: "OpenLogic,RedHat,Oracle,Canonical"//'OpenLogic','RedHat','Oracle','Canonical'
    })

.constant('rmDatepickerConfig', {
    mondayStart: false,
    initState: "month",
    maxState: "decade",
    minState: "month",
    toggleState: true,

    decadeSize: 12,
    monthSize: 42, /* "auto" || fixed nr. (35 or 42) */

    min: null,
    max: null,
    format: "yyyy-MM-dd"
})

.factory("appHelper", ['$rootScope', '$window', '$location', function ($rootScope, $window, $location) {

    var _isAuthorised = function ($window) {
        if ($rootScope.username === "") {
            window.alert("Please login");
            $location.path('/login');
        }
    };

    return {
        isAuthorised: _isAuthorised
    };
}])

.directive("datepicker", function () {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, elem, attrs, ngModelCtrl) {
            var updateModel = function (dateText) {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(dateText);
                });
            };
            var options = {
                dateFormat: "dd/mm/yy",
                onSelect: function (dateText) {
                    updateModel(dateText);
                }
            };
            elem.datepicker(options);
        }
    }
})

.controller("menuController", ['$scope', '$rootScope', '$location', '$route', '$window', 'myprojectServices', function ($scope, $rootScope, $location, $route, $window, myprojectServices) {

    $scope.menuItems = [
        { name: "My Projects", icon: 'icon-home3', submenu: [], show: true, selected: true, selectedSubItem: '' },
        { name: "My Updates", icon: 'icon-stack-2', submenu: [{ name: 'Skillset', location: 'myskillset' }, { name: 'Passport & Visa details', location: '' }, { name: 'Timesheet Entry', location: '/timesheet' },{name:'Daily Status Report',location:''}], show: false, selected: false, selectedSubItem:'' },
        { name: "Request for Resource", icon: 'icon-briefcase4', submenu: [], show: true, selected: false, selectedSubItem: '' },
        { name: "Reports", icon: 'icon-ios-albums-outline', submenu: [{ name: 'Allocation Report', location: '' }, { name: 'Skillset Report', location: '' }, { name: 'Timesheet Report', location: '' }, { name: 'RRF Report', location: '' }], show: false, selected: false, selectedSubItem: '' },
    ]

    $scope.toggle = function (index) {
        $scope.menuItems[index].show = !$scope.menuItems[index].show;
        $scope.menuItems[index].selected = true;
        collapseAnother(index);
    }
    var collapseAnother = function (index) {
        for (var i = 0; i < $scope.menuItems.length; i++) {
            $scope.menuItems[i].selectedSubItem = '';
            if (i != index) {
                $scope.menuItems[i].show = false;
                $scope.menuItems[i].selected = false;
            }
        }
    };
    $scope.isSelected = function(selected)
    {
        if (selected)
            return "#162029";
        else
            return "#1D2B36";
    }

    $scope.subItem_onClick = function(index, subItem)
    {
        $scope.menuItems[index].selectedSubItem = subItem;
        if (subItem.location != '')
            $location.path(subItem.location);
    }
    $scope.subItem_isSelected = function (index, subItem)
    {
        if ( $scope.menuItems[index].selectedSubItem == subItem)
            return "#162029";
        else
            return "#1D2B36";
    }

    GetProjects();
    //--------------------------------------------
    //Service Methods
    //--------------------------------------------
    function GetProjects() {
        myprojectServices.getProjects($rootScope.globals.currentUser.empid, '')
                        .success(function (data, status, headers, config) {
                            $scope.projectList = data;
                            $scope.dataLoading = false;
                        })
                        .error(function (data, status, headers, config) {
                            $scope.dataLoading = false;
                            if (data != null || data != 'undefined') {
                                $scope.errMessage = 'Username or Password is incorrect'
                            }
                            else
                                $scope.errMessage = data.message;
                        });
    }
    //--------------------------------------------
    //Events
    //--------------------------------------------
    $scope.project_onClick = function (index) {
        $window.localStorage.setItem("selectedProject", $scope.projectList[index].proJ_ID);
        
        //$route.reload();
        location.reload();//.path('/myprojects');
    }

}])

.run(['$rootScope', '$location', '$cookieStore', '$http', '$interval',
    function ($rootScope, $location, $cookieStore, $http, $interval) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        //if ($rootScope.globals.currentUser) {
        //    $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
        //    //$http.defaults.headers.common['token'] = $rootScope.globals.currentUser.token;
        //    $http.defaults.headers.common['tenant'] = 'default_tenant';
        //}

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                if ($location.path() !== '/unauthorised')
                    $location.path('/login');
            }
            //else if (current.search('events') > -1 && next.search('events') === -1 && $rootScope.globals.currentUser) {
            //    if (angular.isDefined($rootScope.timerEvent)) {
            //        $interval.cancel($rootScope.timerEvent);
            //        $rootScope.timerEvent = undefined;
            //    }
            //}
        });
    }]);

//.service('SessionService', function($window) {
//    var service = this;
//    var sessionStorage = $window.sessionStorage;

//    service.get = function(key) {
//        return sessionStorage.getItem(key);
//    };

//    service.set = function(key, value) {
//        sessionStorage.setItem(key, value);
//    };

//    service.unset = function(key) {
//        sessionStorage.removeItem(key);
//    };
//});


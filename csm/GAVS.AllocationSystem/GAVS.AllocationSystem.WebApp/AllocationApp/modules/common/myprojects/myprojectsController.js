angular.module('AllSys')
.controller('myprojectsController', ['$scope', '$rootScope', '$filter', '$window', 'myprojectServices', function ($scope, $rootScope, $filter, $window, myprojectServices) {
    var gridApiEvents;
    var gridApi4;
    $scope.init = function () {
        GetProjects();
    }
    $scope.myVar = "myTS";
    GetProjects();

    gridEvents_MyTimesheet();
    gridEvents_TeamTimesheetApproval();
    gridEvents_TeamTimesheetDetails();
    gridEvents_ResourceDetails();
    //**********************************
    $scope.rmConfig1 = {
        mondayStart: false,
        initState: "month", /* decade || year || month */
        maxState: "decade",
        minState: "month",
        decadeSize: 12,
        monthSize: 42, /* "auto" || fixed nr. (35 or 42) */
        min: new Date('2000-11-21'),
        max: new Date('2023-11-21'),
        format: "yyyy-MM-dd" /* https://docs.angularjs.org/api/ng/filter/date */
    };
    $scope.dtStart1 = new Date('1-Aug-2017');
    $scope.dtStart2 = new Date('1-Aug-2017');
    $scope.dtEnd1 = new Date();
    $scope.dtEnd2 = new Date();
    //*************************************
    $scope.isSet = function (tabNum) {
        return $scope.currentTabIndex === tabNum;
    };
    $scope.currentTabIndex = 't1';
    $scope.selectTab = function (activeTab) {
        $scope.currentTabIndex = activeTab;
        var len = $('.tab-pane').length;
        for (var i = 0; i < len; i++) {
            $('.tab-pane')[i].className = "tab-pane inactive";
        }
        $('#' + activeTab)[0].className = "tab-pane active";
        if (!$scope.$digest)
            $scope.$apply();
    }
    //--------------------------------------------
    //Events
    //--------------------------------------------
    $scope.btnMyTimesheet_click = function () {
        var sd = $filter('date')($scope.dtStart1, "dd-MMM-yyyy");
        var ed = $filter('date')($scope.dtEnd1, "dd-MMM-yyyy");
        //$scope.myGridApi.grid.clearAllFilters();
        LoadTimesheetDetails($rootScope.globals.currentUser.empid, sd, ed, $rootScope.selectedProject, 'self');
    }
    $scope.btnTeamTimesheetDetails_click = function () {
        var sd = $filter('date')($scope.dtStart2, "dd-MMM-yyyy");
        var ed = $filter('date')($scope.dtEnd2, "dd-MMM-yyyy");
        var empid = this.res;
        LoadTeamTimesheetDetails(empid, sd, ed, $rootScope.selectedProject);
        
    }
    $scope.approvalTS_click = function () {
        //LoadTeamTimesheetApproval($rootScope.globals.currentUser.empid, $rootScope.selectedProject, 0, 0);
    }
    //--------------------------------------------
    //General Methods
    //--------------------------------------------
    function InitializeProjectDetails() {
        if ($window.localStorage.getItem("selectedProject") != null)
            $rootScope.selectedProject = $window.localStorage.getItem("selectedProject")
        if ($rootScope.selectedProject === undefined)
            $rootScope.selectedProject = $scope.projectList[0].proJ_ID;
        LoadProjectDetails($rootScope.selectedProject, $rootScope.globals.currentUser.empid, 'Project');
        LoadReportingDetails($rootScope.selectedProject, $rootScope.globals.currentUser.empid, 'Details');
        LoadResourceDetails($rootScope.selectedProject, 0, $rootScope.globals.currentUser.empid);
        LoadResourceDetailsDropdown($rootScope.selectedProject, 0, $rootScope.globals.currentUser.empid);
        LoadTeamTimesheetApproval($rootScope.globals.currentUser.empid, $rootScope.selectedProject, 0, 0);  //very slow load
    }
    //--------------------------------------------
    //Service Methods
    //--------------------------------------------
    function GetProjects() {
        var ser = myprojectServices.getProjects($rootScope.globals.currentUser.empid, '')
                        .success(function (data, status, headers, config) {
                            $scope.projectList = data;
                            //$rootScopt.username = $scope.username;
                            $scope.dataLoading = false;
                            //console.log(headers()['token']);
                            //AuthenticationService.SetCredentials($scope.username, $scope.password, headers()['token']);
                            //$location.path('/myprojects');
                        })
                        .error(function (data, status, headers, config) {
                            $scope.dataLoading = false;
                            if (data != null || data != 'undefined') {
                                $scope.errMessage = 'Username or Password is incorrect'
                            }
                            else
                                $scope.errMessage = data.message;
                        });
        ser.then(function () {
            InitializeProjectDetails();
        })
    }
    function LoadProjectDetails(projid, empid, category) {
        myprojectServices.getProjectDetails(empid, projid, category)
                     .success(function (data, status, headers, config) {
                         $scope.projectDetails = data[0];
                     })
                     .error(function (data, status, headers, config) {
                         $scope.projectDetails = [];
                         $scope.dataLoading = false;
                         if (data != null || data != 'undefined') {
                             $scope.errMessage = 'Username or Password is incorrect'
                         }
                         else
                             $scope.errMessage = data.message;
                     });
    }
    function LoadReportingDetails(projid, empid, category) {
        myprojectServices.getReportingDetails(empid, projid, category)
                     .success(function (data, status, headers, config) {
                         $scope.reportingDetails = data[0];
                     })
                     .error(function (data, status, headers, config) {
                         $scope.reportingDetails = [];
                         $scope.dataLoading = false;
                         if (data != null || data != 'undefined') {
                             $scope.errMessage = 'Username or Password is incorrect'
                         }
                         else
                             $scope.errMessage = data.message;
                     });
    }
    function LoadTimesheetDetails(empid, startDate, endDate, projid) {
        myprojectServices.getTimesheetDetails(empid, startDate, endDate, projid)
                     .success(function (data, status, headers, config) {
                             $scope.timesheetDetails = data;
                     })
                     .error(function (data, status, headers, config) {
                         $scope.timesheetDetails = [];
                         $scope.dataLoading = false;
                         if (data != null || data != 'undefined') {
                             $scope.errMessage = 'Username or Password is incorrect'
                         }
                         else
                             $scope.errMessage = data.message;
                     });
    }
    function LoadTeamTimesheetApproval(empid, projectid, dateid, resourceid) {
        myprojectServices.getTeamTimesheetDetails(empid, projectid, dateid, resourceid)
                     .success(function (data, status, headers, config) {
                         $scope.teamTimesheetApproval = data;
                     })
                     .error(function (data, status, headers, config) {
                         $scope.teamTimesheetApproval = [];
                         $scope.dataLoading = false;
                         if (data != null || data != 'undefined') {
                             $scope.errMessage = 'Username or Password is incorrect'
                         }
                         else
                             $scope.errMessage = data.message;
                     });
    }
    function LoadTeamTimesheetDetails(empid, startDate, endDate, projid) {
        myprojectServices.getTimesheetDetails(empid, startDate, endDate, projid)
                     .success(function (data, status, headers, config) {
                         $scope.teamTimesheetDetails = data;
                         if (!$scope.$digest)
                             $scope.$apply();
                     })
                     .error(function (data, status, headers, config) {
                         $scope.teamTimesheetDetails = [];
                         $scope.dataLoading = false;
                         if (data != null || data != 'undefined') {
                             $scope.errMessage = 'Username or Password is incorrect'
                         }
                         else
                             $scope.errMessage = data.message;
                     });
    }
    function LoadResourceDetails(projid, empid, managerid) {
        myprojectServices.getResourceDetails(projid, empid, '100248')
                     .success(function (data, status, headers, config) {
                         $scope.resourceDetails = data;
                     })
                     .error(function (data, status, headers, config) {
                         $scope.resourceDetails = [];
                         $scope.dataLoading = false;
                         if (data != null || data != 'undefined') {
                             $scope.errMessage = 'Username or Password is incorrect'
                         }
                         else
                             $scope.errMessage = data.message;
                     });
    }
    function LoadResourceDetailsDropdown(projid, empid, managerid) {
        myprojectServices.getResourceDetails(projid, empid, '100248')
                     .success(function (data, status, headers, config) {
                         $scope.resourceDetailsDropdown = data;
                     })
                     .error(function (data, status, headers, config) {
                         $scope.resourceDetailsDropdown = [];
                         $scope.dataLoading = false;
                         if (data != null || data != 'undefined') {
                             $scope.errMessage = 'Username or Password is incorrect'
                         }
                         else
                             $scope.errMessage = data.message;
                     });
    }
    //--------------------------------------------
    //GRID
    //--------------------------------------------
    function gridEvents_MyTimesheet() {
        $scope.gridOptions_MyTimesheet = {
            data: 'timesheetDetails', 
            enableCellEditOnFocus: false,
            enableColumnResizing: false,
            //enableRowSelection: true,
            enableFullRowSelection: false,
            allowCellFocus: false,
            multiSelect: false,
            enableFiltering: false,
            enableGridMenu: false,
            showGridFooter: false,
            showColumnFooter: false,
            columnDefs: [
                { name: 'clndR_DATE', displayName: 'Date'},
              { name: 'proJ_NM', displayName: 'Project Name'},
              { name: 'proJ_TASK_NAME', displayName: 'Task'},
              { name: 'tasK_DESC', displayName: 'Description'},
              { name: 'clockeD_MINS', displayName: 'Hours Spent'},
              { name: 'timE_ENTRY_STATUS', displayName: 'Status'},
            ],
            //onRegisterApi: function onRegisterApi(registeredApi) {
            //    $scope.myGridApi1 = registeredApi;
            //    //$scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            //    //    var vmsize = row.entity.vmsizeName;
            //    //    $scope.wselectedVMSize = vmsize;
            //    //});
            //}
        }
    }
    function gridEvents_TeamTimesheetApproval() {
        $scope.gridOptions_TeamTimesheetApproval = {
            data: 'teamTimesheetApproval',
            enableCellEditOnFocus: false,
            enableColumnResizing: false,
            enableRowSelection: false,
            enableFullRowSelection: false,
            allowCellFocus: false,
            multiSelect: false,
            enableFiltering: false,
            enableGridMenu: false,
            showGridFooter: false,
            showColumnFooter: false,
            columnDefs: [
                { name: 'emP_NAME', displayName: 'Resource Name' },
                { name: 'startdate', displayName: 'Task Period', cellTemplate: '<div class="ui-grid-cell-contents text-left">{{row.entity.startdate}} - {{row.entity.enddate}}</div>' },
                { name: 'clockeD_MINS', displayName: 'Total Hours' },
                { name: 'timE_ENTRY_STATUS', displayName: 'Status' },
            ],
            //onRegisterApi: function onRegisterApi(registeredApi) {
            //    $scope.gridApi2 = registeredApi;
            //    //$scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            //    //    var vmsize = row.entity.vmsizeName;
            //    //    $scope.wselectedVMSize = vmsize;
            //    //});
            //}
        }
    }
    function gridEvents_TeamTimesheetDetails() {
        $scope.gridOptions_TeamTimesheetDetails = {
            data: 'teamTimesheetDetails',
            enableCellEditOnFocus: false,
            enableColumnResizing: false,
            enableRowSelection: false,
            enableFullRowSelection: false,
            allowCellFocus: false,
            multiSelect: false,
            enableFiltering: false,
            enableGridMenu: false,
            showGridFooter: false,
            showColumnFooter: false,
            columnDefs: [
              { name: 'clndR_DATE', displayName: 'Date' },
              { name: 'proJ_NM', displayName: 'Project Name' },
              { name: 'proJ_TASK_NAME', displayName: 'Task' },
              { name: 'tasK_DESC', displayName: 'Description' },
              { name: 'clockeD_MINS', displayName: 'Hours Spent' },
              { name: 'timE_ENTRY_STATUS', displayName: 'Status' },
            ],
            //onRegisterApi: function onRegisterApi(registeredApi) {
            //    $scope.gridApi3 = registeredApi;
            //    //$scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            //    //    var vmsize = row.entity.vmsizeName;
            //    //    $scope.wselectedVMSize = vmsize;
            //    //});
            //}
        }
    }
    function gridEvents_ResourceDetails() {
        $scope.grid_ResourceDetails = {
            data: 'resourceDetails',
            //enableCellEditOnFocus: false,
            //enableColumnResizing: false,
            //enableRowSelection: true,
            //enableFullRowSelection: true,
            //allowCellFocus: false,
            //multiSelect: false,
            //enableFiltering: false,
            //enableGridMenu: false,
            //showGridFooter: false,
            //showColumnFooter: false,
            columnDefs: [
                { name: 'emP_ID', displayName: 'Employee ID' },
                { name: 'emP_NAME', displayName: 'Resource Name' },
                { name: 'level', displayName: 'Level' },
                { name: 'empL_TYPE', displayName: 'Emp Type' }, 
                { name: 'cntrY_NM', displayName: 'Location' },
                { name: 'bilL_FLG', displayName: 'Billability' },
                { name: 'emp_ReportingManager', displayName: 'Reporting Manager' },
                { name: 'emp_ReviewingManager', displayName: 'Review Manager' },
                { name: 'allocation', displayName: 'Allocation' },
                { name: 'startdate', displayName: 'Start Date' },
                { name: 'enddate', displayName: 'End Date' },
                { name: 'comments', displayName: 'Remarks' },
            ],
            onRegisterApi: function onRegisterApi(registeredApi) {
                gridApi4 = registeredApi;
                //$scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                //    var vmsize = row.entity.vmsizeName;
                //    $scope.wselectedVMSize = vmsize;
                //});
            }
        }
    }
    //--------------------------------------------
}])
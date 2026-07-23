angular.module('AllSys')
.controller('timesheetController', ['$scope', '$rootScope', '$filter', '$window', 'myprojectServices', function ($scope, $rootScope, $filter, $window, timesheetServices) {
    $scope.init = function () {
        LoadTimesheetDetails('11-dec-2017', '15-dec-2017', $rootScope.globals.currentUser.empid, 'SubDetailsEmp', 0);
    }
    $scope.init();
    gridEvents_MyTimesheet();
    //--------------------------------------------
    //Service Methods
    //--------------------------------------------
    function LoadTimesheetDetails(startDate, endDate, empid, category, projid) {
        timesheetServices.getTimesheetDetails(empid, startDate, endDate, projid)
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
    //--------------------------------------------
    //GRID
    //--------------------------------------------
    function gridEvents_MyTimesheet() {
        $scope.gridOptions_MyTimesheet = {
            data: 'timesheetDetails',
            //enableCellEditOnFocus: true,
            //enableCellEdit:true,
            //enableColumnResizing: false,
            ////enableRowSelection: true,
            //enableFullRowSelection: false,
            //allowCellFocus: true,
            //multiSelect: false,
            //enableFiltering: false,
            //enableGridMenu: false,
            //showGridFooter: false,
            //showColumnFooter: true,
            columnDefs: [
                { name: 'proJ_NM', displayName: 'Project Name' },
              { name: 'clndR_DATE', displayName: 'Date' },
              { name: 'proJ_TASK_NAME', displayName: 'Task' },
              { name: 'tasK_DESC', displayName: 'Description', enableCellEdit: true },
              { name: 'clockeD_MINS', displayName: 'Hours Spent', enableCellEdit: true, type: 'number'},
              { name: 'timE_ENTRY_STATUS', displayName: 'Status' },
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
}])
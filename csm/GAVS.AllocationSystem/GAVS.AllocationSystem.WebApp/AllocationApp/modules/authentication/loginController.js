angular.module('AllSys')

.controller("loginController", ['AuthenticationService', '$scope', '$rootScope', '$location', function (AuthenticationService, $scope, $rootScope, $location) {
    //AuthenticationService.ClearCredentials();
    //$scope.myname = "Roop";
    //$scope.username = "Roopsundar.venkat";
    //$scope.password = "gavs_001";
    $rootScope.newName = $scope.myname;
    $scope.login = function () {
        if ($scope.username === undefined) {  // || $scope.password === undefined
            $scope.errMessage = "Username or password cannot be empty";
            return;
        }
        else if ($scope.username === "") { // || $scope.password === ""
            $scope.errMessage = "Username or password cannot be empty";
            return;
        }
        else
        {
            if ($scope.password === undefined)
                $scope.password = "";
            $scope.errMessage = "";
        }

       

        AuthenticationService.Login($scope.username, $scope.password)
               .success(function (data, status, headers, config) {
                   //$rootScopt.username = $scope.username;
                   $scope.dataLoading = false;
                   console.log(headers()['token']);
                   console.log(headers()['empid']);
                   AuthenticationService.SetCredentials($scope.username, $scope.password, headers()['token'], headers()['empid']);
                   $location.path('/myprojects');
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
}])
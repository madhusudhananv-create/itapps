import { Component, OnInit, Input} from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, TimesheetProjectEmpModel } from '../../../../app/models/timesheet-model';
import { ProjectsModel } from '../../../models/projects-model';
import { DateRangeModel, TimesheetTypeModel } from '../../../models/date-range-model';
import { enumDateRange } from '../../../Shared/enum';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-timesheet-customer',
    templateUrl: './timesheet-customer.component.html',
    styleUrls: ['./timesheet-customer.component.scss']
})
export class TimesheetCustomerComponent implements OnInit {
    @Input('customerId') input_custId: string;
    timesheetType: TimesheetTypeModel = new TimesheetTypeModel();
    OldestTimesheetdateForApproval: Date = new Date();
    projects = [];
    selectedProject;
    boolflag: boolean = false;
    reviewflag: boolean = false;
    tableMonth: string = this._util.Month();
    tableYear: number = this._util.Year();
    disablebtn: boolean = false;
    bProgress: boolean = false;
    bAllChecked: boolean = false;
    comments: string = "";
    status: string = 'APPROVED,FOR APPROVAL,CUSTOMER REJECT';
    daysInMonth: number = 0;
    //periodType: enumDateRange = enumDateRange.Monthly;
    tmpSelectedDates: string[] = [];
    error: string;

    //
    ProjResourceStartDate: any = null;
    ProjResourceEndDate: any = null;
    //

    constructor(public _util: myUtility, private _appservice: AppsService) { }

    multipleProjectTimesheets: TimesheetProjectEmpModel[] = [];

    ngOnInit() {
        this.LoadData();
        this.OnInit();
    }
    ngOnChanges() {
        this.LoadData();
    }
    LoadData() {
        this.service_getTimesheetType();
        if (this.input_custId != undefined) {
            if (this._util.IsGAVS())                
                this.service_getProjectNamesForEmployee(this.input_custId, localStorage.getItem('empid'));
            else
                this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));

            //this.service_getOldestTimesheetdateForApproval(this.input_custId, localStorage.getItem('empid'));
        }
    }
    // // LoadComments() {
    // //     if (this.projectTimesheets != undefined && this.projectTimesheets.employees.length > 0 && this.projectTimesheets.employees[0].timesheet.length > 0) {
    // //         this.comments = this.projectTimesheets.employees[0].timesheet[0].rejecT_DESC;
    // //     }
    // // }
    IsNYU() {
        if (this.input_custId == undefined)
            return false;
        else if (this.input_custId == "202100040" || this.input_custId == "202100061")
            return true;
        else
            return false;
    }

    GetBackground(entry,tsdata) {

        let statusClndrDate1 = new Date(entry.clndR_DATE);
        let ProjResourceStartDate1 = new Date(tsdata.startdate);
        let ProjResourceEndDate1 = new Date(tsdata.enddate);
        
        //initialize to global
        this.ProjResourceStartDate = ProjResourceStartDate1;
        this.ProjResourceEndDate = ProjResourceEndDate1        
    
        if (!(statusClndrDate1 >= ProjResourceStartDate1 && statusClndrDate1 <= ProjResourceEndDate1))
        return this._util.ColorShaders.BlockedShade;     
        
        if (entry.clndR_DAY_NAME === "Sun" || entry.clndR_DAY_NAME === "Sat")
            return this._util.ColorShaders.WeekEndShade;
        if (entry.proJ_TASK_ID === 3)
            return this._util.ColorShaders.LeaveShade;
        else if (entry.proJ_TASK_ID === 5)
            return this._util.ColorShaders.HolidayShade;
    }

    disableEntry(status) {
        if (this.IsPMO() == true && (status == 'FOR REVIEW' || status == 'CUSTOMER REJECT' || status == null))
            return false;
        else
            return true;
    }
    _focus(input) {
        if (input.selectionEnd === 0)
            input.selectionEnd = 1;
        else
            input.selectionStart = input.selectionEnd;
    }
    _keyPress(input, event: any) {
        const pattern = /[0-9\+\-\.\ ]/;
        let inputChar = String.fromCharCode(event.charCode);
        if (!pattern.test(inputChar)) {
            // invalid character, prevent input
            event.preventDefault();
            return;
        }

        let val = input.value + inputChar.toString();
        if (Number(val) > 24) {
            event.preventDefault();
        }
        else if (val.split('.').length > 2) {
            event.preventDefault();
        }
        else if (val.split('.').length > 1) {
            let deci = val.split('.')[1];
            if (deci.length > 2) {
                event.preventDefault();
            }
        }
    }
    valuechange(projTimesheets: TimesheetProjectModel) {
        let total: number = 0;
        projTimesheets.timesheet.forEach(element => {
            if (element.clockeD_MINS != undefined) {
                total = total + Number(element.clockeD_MINS);
            }
        });
        projTimesheets.total = total.toFixed(2);
    }
    IsRole(role) {
        if (role === 'customer') {
            if (!this._util.IsGAVS())
                return true;
            else
                return false;
        }
        else if (role === 'pmo') {
            if (localStorage.getItem('empid') === '101425')
                return true;
            else
                return false;
        }
        else if (role === 'employee') {
            if (this._util.IsGAVS() && localStorage.getItem('empid') != '101425')
                return true;
            else
                return false;
        }
    }

    IsPMO() {
        if (localStorage.getItem('empid') === '101425')
            return true;
        else
            return false;
    }
    IsCustomer() {
        if (!this._util.IsGAVS())
            return true;
        else
            return false;
    }
    PMOSave_onClick() {
        if (this.multipleProjectTimesheets.length > 0 && this.multipleProjectTimesheets[0].employees.length > 0) {
            for (let employee of this.multipleProjectTimesheets[0].employees) {
                if (employee.status.toString() != 'FOR REVIEW' && employee.status.toString() != 'CUSTOMER REJECT') {
                    alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT'");
                    return;
                }
            }
            this.updateStatus("FOR REVIEW");
            let successMessage: string = "Updated Successfully";
            this.service_UpdateTimesheetDetails(this.multipleProjectTimesheets[0], successMessage);
        }
    }

    SubmitForApproval_onClick() {
        for (let timesheet of this.multipleProjectTimesheets[0].employees) {
            if (timesheet.status != "FOR REVIEW" && timesheet.status != "CUSTOMER REJECT") {
                alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT'");
                return;
            }
        }
        if (confirm("Are you sure you want to submit for Approval?")) {
            this.updateStatus("FOR APPROVAL");
            let successMessage: string = "Successfully submitted for Approval";
            this.service_UpdateTimesheetDetails(this.multipleProjectTimesheets[0], successMessage);
        }
    }

    IsRowsSelected(): Boolean {
        let bSelected = false;
        for (let proj of this.multipleProjectTimesheets) {
            for (let emp of proj.employees) {
                if (emp.selected)
                    bSelected = true;
            }
        }
        return bSelected;
    }
    IsAllRowsApproved(): Boolean {
        let bApproved = true;
        for (let proj of this.multipleProjectTimesheets) {
            for (let emp of proj.employees) {
                if (emp.status != 'APPROVED')
                    bApproved = false;
            }
        }
        return bApproved;
    }
    Approve_onClick() {
        if (!this.IsRowsSelected()) {
            alert("Please select row(s) to approve");
            return;
        }
        if (confirm("Are you sure you want to Approve?")) {
            this.updateStatus("APPROVED");
            let successMessage: string = "Selected Record(s) Approved Successfully!";
            this.service_UpdateTimesheetDetailsMultiple(this.multipleProjectTimesheets, successMessage);
        }
    }

    CustomerReject_onClick() {
        if (!this.IsRowsSelected()) {
            alert("Please select row(s) to reject");
            return;
        }
        for (let projectTimesheet of this.multipleProjectTimesheets) {
            for (let timesheet of projectTimesheet.employees) {
                if (timesheet.selected === true && timesheet.status == "APPROVED") {
                    alert("Timesheet is already approved, please unselect and proceed (" + projectTimesheet.proJ_NM + " > " + timesheet.frsT_NM + ")");
                    return;
                }
            }
        }
        if (confirm("Are you sure you want Reject?")) {
            this.updateStatus("CUSTOMER REJECT");
            let successMessage: string = "Selected Record(s) Rejected Successfully!";
            this.service_UpdateTimesheetDetailsMultiple(this.multipleProjectTimesheets, successMessage);
        }
    }

    updateStatus(status) {
        for (let project of this.multipleProjectTimesheets) {
            for (let emp of project.employees) {
                if (emp.selected) {
                   
                    emp.status = status;
                    for (let timesheet of emp.timesheet) {
                        timesheet.timE_ENTRY_STATUS = status;
                        timesheet.rejecT_DESC = emp.rejecT_DESC;
                    }
                }
            }
        }
    }

    GetTimesheetData() {
        this.error = "";
        this.bAllChecked = false;
        if (this.selectedProject === undefined) {
            this.error = " Please select a project";
        }
        else if (this.selectedProject.proJ_NM === 'All') {
            let projList: string[] = this.projects.map(t => t.proJ_ID);
            this.service_getTimesheetDetailsByProjectIds(projList, this.timesheetType.period);
        }
        else
            this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.timesheetType.period);

        this.daysInMonth = this._util.DaysInMonth(this.tableMonth, this.tableYear);
    }


    chkAll_OnChange() {
        for (let proj of this.multipleProjectTimesheets) {
            proj.selected = this.bAllChecked;
            for (let emp of proj.employees) {
                emp.selected = proj.selected;
            }
        }
    }
    chkAllProj_OnChange(proj) {
        for (let emp of proj.employees) {
            emp.selected = proj.selected;
        }
    }
    ddMonth_OnChange() {
        this.timesheetType.selectedDateRange.startDate = new Date(Date.UTC(this.tableYear, this._util.getMonthNum(this.tableMonth), 1, 0, 0, 0));
        //this.timesheetType.selectedDateRange.startDate = new Date("1-" + this.tableMonth + "-" + this.tableYear.toString());
        this.service_refreshCalendarWeeks(this.timesheetType);
    }
    ddWeek_OnChange() {
        this.service_refreshCalendarWeeks(this.timesheetType);
    }
    service_refreshCalendarWeeks(timesheetType: TimesheetTypeModel) {
        this.freez(true);
        this._appservice.GetCalendarDateRange(timesheetType).subscribe(data => {
            this.timesheetType = data;
            this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
            //this.service_getTimesheetDetails(this.input_custId, localStorage.getItem('empid'));
            this.freez(false);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });
    }
    service_getTimesheetType() {
        this._appservice.GetTimesheetType(this.input_custId).subscribe(data => {
            this.timesheetType = data;
            this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
        }, error => {
            this._util.serviceError(error);
        });
    }
    service_getCalendarWeeks(timesheetType: TimesheetTypeModel) {
        this.freez(true);
        this._appservice.GetCalendarDateRange(timesheetType).subscribe(data => {
            this.timesheetType = data;
            this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
            this.tmpSelectedDates = this.timesheetType.selectedDates;
            this.freez(false);
            //this.service_getTimesheetDetails(this.input_custId, localStorage.getItem('empid'), this.tableWeek.startDate, this.tableWeek.endDate);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });
    }
    service_getTimesheetDetailsByProjectIds(projids, periodType) {
        this.freez(true);
        // let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
        // let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
        if (this.timesheetType.selectedDateRange == undefined)
            return;
        let arr: string[] = this.timesheetType.selectedDateRange.displayName.split(' ');
        let st = arr[0];
        let ed = arr[2];

        this._appservice.GetTimesheetDetailsByProjectIds(projids, periodType, st, ed, this.status).subscribe(data => {
            this.multipleProjectTimesheets = data;
            this.tmpSelectedDates = this.timesheetType.selectedDates;
       
            //
            this.multipleProjectTimesheets.forEach(MPTs => {
                MPTs.employees.forEach(element => {
                    let sdate: any = formatDate(element.startdate, "dd-MMM-yyyy", "en-US");        
                    this.ProjResourceStartDate = sdate;                       
                    let edate: any = formatDate(element.enddate, "dd-MMM-yyyy", "en-US");        
                    this.ProjResourceEndDate = edate;  
                });
            });
            //

            this.freez(false);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });
    }

    // service_getProjectNamesForEmployee(custid, empid) {
    //     this._appservice.GetCustomerProjectsNameWithCustNM(custid, empid).subscribe(data => {
    //         this.projects = data;
    //     }, error => {
    //         this._util.serviceError(error);
    //     });
    // }

    service_getProjectNamesForEmployee(custid, empid) {        
        this._appservice.GetCustomerProjectsNameWithCustNM(custid, empid).subscribe(data => {
            this.projects = data;
            if (this.projects.length > 1) {
                this.selectedProject = this.GetProjectAll()
                this.projects.unshift(this.selectedProject);
            }
        }, error => {
            this._util.serviceError(error);
        });
    }

    service_getProjectNamesForCustomer(custid, emailid) {
      
        this._appservice.GetCustomerProjectsNameForClient(custid, emailid).subscribe(data => {
            this.projects = data;
            if (this.projects.length > 1) {
                this.selectedProject = this.GetProjectAll()
                this.projects.unshift(this.selectedProject);
            }
            this.GetTimesheetData();
        }, error => {
            this._util.serviceError(error);
        });
    }

    service_getOldestTimesheetdateForApproval(custid, emailid) {
        this._appservice.getOldestTimesheetdateForApproval(custid, emailid).subscribe(data => {
            this.OldestTimesheetdateForApproval = data;

            this.timesheetType.selectedDateRange = this.timesheetType.dateRange.filter(t => t.startDate <= this.OldestTimesheetdateForApproval && t.endDate >= this.OldestTimesheetdateForApproval)[0];
            this.ddWeek_OnChange();
            this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));
        }, error => {
            this._util.serviceError(error);
        });
    }

    GetProjectAll() {
        let proj: ProjectsModel = new ProjectsModel();
        proj.proJ_ID = '0';
        proj.proJ_NM = 'All';
        return proj;
    }

    service_UpdateTimesheetDetailsMultiple(timeSheetData: TimesheetProjectEmpModel[], successMessage) {
        this.freez(true);
        let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
        let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
        this._appservice.ApproveMultipleProjectTimesheets(timeSheetData, this.timesheetType.period, st, ed).subscribe(data => {
            //this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.tableMonth, this.tableYear);
            this.GetTimesheetData()
            this.bAllChecked = false;
            //alert(successMessage); bk28Aug
            let status1 = JSON.stringify(data);
            let returnedResult = status1.toString();
            if(returnedResult == "true"){
                alert(successMessage);
            }
            if(returnedResult == "false"){
                alert("Something gone wrong..Please Try Later!");
            }             
            this.freez(false);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });
    }
    service_UpdateTimesheetDetails(timeSheetData: TimesheetProjectEmpModel, successMessage) {
        this.freez(true);
        let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
        let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
        this._appservice.UpdateTimesheetDetailsMonthlyEmp(timeSheetData, this.timesheetType.period, st, ed, this.comments).subscribe(data => {
            //this.comments = "";
            this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.timesheetType.period);
            alert(successMessage);
            this.freez(false);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });
    }
    service_getTimesheetDetails(projid, periodType) {
        this.freez(true);
        // let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
        // let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
        let arr: string[] = this.timesheetType.selectedDateRange.displayName.split(' ');
        let st = arr[0];
        let ed = arr[2];
      
        this._appservice.GetTimesheetDetailsByProjectId(projid, periodType, st, ed, this.status).subscribe(data => {
            this.multipleProjectTimesheets = [];
            

            data.employees.forEach(element => {
                element.timesheet.forEach(ts => {
                    // if((ts.clndR_DAY_NAME == "Sat" || ts.clndR_DAY_NAME == "Sun") || ts.clockeD_MINS == 0 ) {
                    //     ts.clockeD_MINS = null;
                    // }                                                
                    // if ((ts.clndR_DAY_NAME == "Sat" || ts.clndR_DAY_NAME == "Sun") && ts.clockeD_MINS == 0) {
                    //     ts.clockeD_MINS = null;
                    // }
                    // if (ts.clockeD_MINS == 0) {
                    //     ts.clockeD_MINS = null;
                    // }
                });
            });

            this.multipleProjectTimesheets.push(data);
            this.tmpSelectedDates = this.timesheetType.selectedDates;
            this.freez(false);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });
    }


    freez(bool: boolean) {
        this.disablebtn = bool;
        this.bProgress = bool;
    }

    ////////////////////////////////////

    title = 'DashboardNewView';

    ////////////////////////////////////////////////////////////////////////////////////
    // Data 0
    type = 'PieChart';
    width = 180;
    height = 90;
    data = [
        ['Complaint', 90],
        ['Non Complaint', 10]
    ];
    options = {
        pieHole: 0.5,
        legend: 'none',
        colors: ['#3ab376', '#ff0109'],
        chartArea: { 'width': '100%', 'height': '80%', top: 6, bottom: 2 },
    };

    ////////////////////////////////////////////////////////////////////////////////////
    // Data 1
    type1 = 'ColumnChart';
    width1 = 180;
    height1 = 110;
    columnNames1 = ['status', 'count'];
    // data1 = [
    //   ["Completed ", 38, 17]
    // ];   
    data1 = [
        ['Completed', 38],
        ['In Progress', 17]
    ];
    options1: google.visualization.ColumnChartOptions = {
        legend: { position: 'none' },
        bar: { groupWidth: "45%" }
    };


    ////////////////////////////////////////////////////////////////////////////////////
    // Data 2
    type2 = 'PieChart';
    width2 = 170;
    height2 = 70;
    data2 = [
        ['Offshore', 180],
        ['Onsite', 66]
    ];
    options2: google.visualization.PieChartOptions = {
        colors: ['#54b8e8', '#3ab376'],
        chartArea: { 'width': '100%', 'height': '80%' },
        legend: {
            position: 'right', alignment: 'center', textStyle: {
                fontSize: 9, bold: true
            }
        },
        pieSliceBorderColor: 'transparent',
        pieSliceText: 'value',
        pieSliceTextStyle: { fontSize: 9 }
    };


    ////////////////////////////////////////////////////////////////////////////////////
    // Data 3
    type3 = 'ColumnChart';
    width3 = 200;
    height3 = 130;
    columnNames3 = ['Onshore', 'offshore'];
    data3 = [
        ['Not Complaint', 10],
        ['Complaint', 90]
    ];
    options3 = {

        chartArea: { 'width': '100%', 'height': '80%' },
        legend: { position: 'right' },
        pieSliceBorderColor: 'transparent',
        pieSliceText: 'value',
        hAxis: { title: 'Non Billable' },
        colors: ['red', 'green'],
        bar: { groupWidth: "30%" }
    };


    ////////////////////////////////////////////////////////////////////////////////////
    buildCharts(inputData, inputOptions, inputChartId) {
        let data = google.visualization.arrayToDataTable(inputData);
        let chart = new google.visualization.ColumnChart(document.getElementById(inputChartId));

        chart.draw(data, inputOptions);
    }



    ////////////////////////////////////////////////////////////////////////////////////
    OnInit() {
        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {

            let data = google.visualization.arrayToDataTable([
                ['Task', 'Hours per Day', { 'role': 'style' }, { role: 'annotation' }],
                ['Completed', 38, '#3ab376', '38'],
                ['In Progress', 17, '#ff6f00', '17']
            ]);

            let options: google.visualization.ColumnChartOptions = {
                legend: {
                    position: 'none',
                },
                width: 180,
                height: 130,
                hAxis: {
                    textStyle: {
                        fontSize: 9
                    }
                },
                vAxis:
                    {
                        ticks: ['0', '10', '20', '30', '40'],
                        gridlines: {
                            color: '#ebedf1'
                        },
                        baselineColor: '#FFFFFF',
                    },
                bar: { groupWidth: "59%" },
                annotations: {
                    alwaysOutside: false
                },
                chartArea: { 'width': '70%', 'height': '80%', left: 25, top: 10 },
            };

            let chart = new google.visualization.ColumnChart(document.getElementById('customerSuccessChart'));

            chart.draw(data, options);

            //------------------- Non -Billable/ Billable Bar graph----------------------------------//

            let data1 = google.visualization.arrayToDataTable([
                ['Status', 'OnSite', { role: 'annotation' }, 'OffShore ', { role: 'annotation' }],
                ['Non-Billable', 74, 74, 40, 40],
                ['Billable', 26, 26, 80, 80]
            ]);

            let options1: google.visualization.ColumnChartOptions = {
                legend: {
                    position: 'right',
                    alignment: 'center',

                    textStyle: {
                        fontName: 'Helvetica',
                        fontSize: 8
                    }
                },
                width: 210,
                height: 120,

                vAxis: {
                    ticks: [],
                    baselineColor: '#FFFFFF'
                },
                annotations: {
                    textStyle: {
                        fontSize: 11
                    }
                },

                bar: { groupWidth: "70%", },
                colors: ['#3ab376', '#54b8e8'],

                chartArea: { 'width': '60%', 'height': '70%', left: 15, top: 0 },

            };

            let chart1 = new google.visualization.ColumnChart(document.getElementById('nonBillableGraph'));

            chart1.draw(data1, options1);

            //------------------- Project Count Semi- Circle Donought Chart-------------------

            let data2 = google.visualization.arrayToDataTable([
                ['Status', 'Count'],
                ['Projects to start', 34],
                ['Projects to end', 18],
                [null, 50]
            ]);

            let options2: google.visualization.PieChartOptions = {
                legend: {
                    position: 'right',

                    alignment: 'center',
                },
                pieHole: 0.5,
                width: 180,
                height: 105,
                pieStartAngle: 270,
                pieSliceText: 'value',

                colors: ['#3ab376', '#ff0109'],

                chartArea: { 'width': '100%', 'height': '80%', bottom: 10, top: 10 },

                slices: {
                    2: {
                        color: 'transparent',
                        enableInteractivity: false
                    }
                },

            };

            let chart2 = new google.visualization.PieChart(document.getElementById('projectCount'));

            chart2.draw(data2, options2);

            //----------------------- Action Items Donought chart-------------------

            let data3 = google.visualization.arrayToDataTable([
                ['Status', 'Count'],
                ['Due for closure', 33],
                ['Past due date', 21],
            ]);

            let options3: google.visualization.PieChartOptions = {
                title: "Action Items",
                titleTextStyle: {
                    fontSize: 15,
                    color: '#535d85',
                    fontName: 'Helvetica Neue'
                },
                legend: {
                    position: 'right',

                    alignment: 'center',
                },
                pieHole: 0.5,
                width: 180,
                height: 100,
                pieSliceText: 'value',

                colors: ['#3ab376', '#ff0109'],

                chartArea: { 'width': '100%', 'height': '80%', bottom: 0, top: 21 },

            };

            let chart3 = new google.visualization.PieChart(document.getElementById('actionItems'));

            chart3.draw(data3, options3);

        }
    }

}









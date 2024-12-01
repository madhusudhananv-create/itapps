import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, TimesheetProjectEmpModel } from '../../../../app/models/timesheet-model';
import { ProjectsModel } from '../../../models/projects-model';
import { DateRangeModel, TimesheetTypeModel } from '../../../models/date-range-model';
import { enumDateRange } from '../../../Shared/enum';
import { TimesheetProjectEmpModelGroupBydate } from '../../../../app/models/timesheet-model';
import { ServiceParams } from '../../../../app/models/report-model';
import { formatDate } from '@angular/common';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Router } from '@angular/router';

@Component({
    selector: 'app-timesheet-customer-forapproval',
    templateUrl: './timesheet-customer-forapproval.component.html',
    styleUrls: ['./timesheet-customer-forapproval.component.scss']
})
export class TimesheetCustomerForapprovalComponent implements OnInit {
    @Input('customerId') input_custId: string;
    progress: Boolean = false;
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
    comments: string = "";
    status: string = 'APPROVED,FOR APPROVAL,CUSTOMER REJECT';
    daysInMonth: number = 0;
    //periodType: enumDateRange = enumDateRange.Monthly;
    //tmpSelectedDates:string[] = [];

     //
    ProjResourceStartDate: any = null;
    ProjResourceEndDate: any = null;
    //
    constructor(public _util: myUtility, private _appservice: AppsService,private _router: Router, private _spinner: Ng4LoadingSpinnerService) { }

    //multipleProjectTimesheets: TimesheetProjectEmpModel[] = [];
    multipleProjectTimesheetsGroupedByDaterange: TimesheetProjectEmpModelGroupBydate[] = [];

    ngOnInit() {
        // if (this._util.IsPremier(this.input_custId))
        // {
           
        //    var url='/timesheetnewhome/'+ this.input_custId;
        //    alert(url );
        //   this._router.navigateByUrl(url);
        // }
        this.LoadData();
    }
    ngOnChanges() {
        //this.LoadData();
    }
    LoadData() {
        if (this.input_custId != undefined) {
            this.timesheetType.period = enumDateRange.Weekly;
            this.progress = true;

            let param: ServiceParams = new ServiceParams();
            param.paraM_NAME = "ProjectIds";
            param.paraM_VALUE = this.projects;
            this._appservice.GetTimesheetDetailsForApproval(this.input_custId, param).subscribe(data => {
                this.multipleProjectTimesheetsGroupedByDaterange = data;
                //
                               
                //
                this.multipleProjectTimesheetsGroupedByDaterange.forEach(element => {
                    element.multipleProjectTimesheets.forEach(element2 => {
                        element2.employees.forEach(element3 => {
                            let sdate: any = formatDate(element3.startdate, "dd-MMM-yyyy", "en-US");        
                            this.ProjResourceStartDate = sdate;                       
                            let edate: any = formatDate(element3.enddate, "dd-MMM-yyyy", "en-US");        
                            this.ProjResourceEndDate = edate;      
                        })
                    })
                });
                //
                this.progress = false;
            }, error => {
                this._util.serviceError(error);
                this.progress = false;
            });
        }
    }

    // GetBackground(entry) {
    //     if (entry.clndR_DAY_NAME === "Sun" || entry.clndR_DAY_NAME === "Sat")
    //         return this._util.ColorShaders.WeekEndShade;
    //     if (entry.proJ_TASK_ID === 3)
    //         return this._util.ColorShaders.LeaveShade;
    //     else if (entry.proJ_TASK_ID === 5)
    //         return this._util.ColorShaders.HolidayShade;
    // }

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
    Refresh_OnClick() {
        this.LoadData();
    }
    chkAll_OnChange(obj: TimesheetProjectEmpModelGroupBydate) {
        for (let projgrp of this.multipleProjectTimesheetsGroupedByDaterange) {
            for (let proj of projgrp.multipleProjectTimesheets) {
                proj.selected = projgrp.bAllChecked;
                for (let emp of proj.employees) {
                    emp.selected = proj.selected;
                }
            }
        }
    }
    chkAllProj_OnChange(proj) {
        for (let emp of proj.employees) {
            emp.selected = proj.selected;
        }
    }

    IsRowsSelected(): Boolean {
        let bSelected = false;
        for (let projgrp of this.multipleProjectTimesheetsGroupedByDaterange) {
            for (let proj of projgrp.multipleProjectTimesheets) {
                for (let emp of proj.employees) {
                    if (emp.selected)
                        bSelected = true;
                }
            }
        }
        return bSelected;
    }
    IsAllRowsApproved(): Boolean {
        let bApproved = true;
        for (let projgrp of this.multipleProjectTimesheetsGroupedByDaterange) {
            for (let proj of projgrp.multipleProjectTimesheets) {
                for (let emp of proj.employees) {
                    if (emp.status != 'APPROVED')
                        bApproved = false;
                }
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
            
            let successMessage: string = "Approved Successfully";
            let multipleProjectTimesheets: TimesheetProjectEmpModel[] = [];

            for (let projgrp of this.multipleProjectTimesheetsGroupedByDaterange) {
                multipleProjectTimesheets.concat(projgrp.multipleProjectTimesheets);
            }
            this.service_UpdateTimesheetDetailsMultiple(this.multipleProjectTimesheetsGroupedByDaterange, successMessage);
        }
    }

    service_UpdateTimesheetDetailsMultiple(timeSheetData: TimesheetProjectEmpModelGroupBydate[], successMessage) {
        this.freez(true);
        let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
        let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
        this._spinner.show();
        this._appservice.ApproveMultipleProjectTimesheetsMultipleRange(timeSheetData, this.timesheetType.period, st, ed).subscribe(data => {
            //this.LoadData();
            //this.bAllChecked = false;
            //alert(successMessage);bk28Aug
            let status1 = JSON.stringify(data);
            let returnedResult = status1.toString();
            if(returnedResult == "true"){
                this.LoadData();
                alert(successMessage);
                //this._appservice.ProcessPSARequests().subscribe(e=>{});
            }
            if(returnedResult == "false"){
                this.updateStatus("FOR APPROVAL");                
                alert("Something gone wrong.. Please Try Later!");
                this.LoadData();      //TEST      
                
            }
            this._spinner.hide();
                        
            this.freez(false);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });

    }
    CustomerReject_onClick() {
        if (!this.IsRowsSelected()) {
            alert("Please select row(s) to reject");
            return;
        }
        for (let projgrp of this.multipleProjectTimesheetsGroupedByDaterange)
            for (let projectTimesheet of projgrp.multipleProjectTimesheets) {
                for (let timesheet of projectTimesheet.employees) {
                    if (timesheet.selected === true && timesheet.status == "APPROVED") {
                        alert("Timesheet is already approved, please unselect and proceed (" + projectTimesheet.proJ_NM + " > " + timesheet.frsT_NM + ")");
                        return;
                    }
                }
            }
        if (confirm("Are you sure you want Reject?")) {
            this.updateStatus("CUSTOMER REJECT");
            let successMessage: string = "Successfully Rejected";
            this.service_UpdateTimesheetDetailsMultiple(this.multipleProjectTimesheetsGroupedByDaterange, successMessage);
        }
    }

    updateStatus(status) {
        for (let projgrp of this.multipleProjectTimesheetsGroupedByDaterange)
            for (let project of projgrp.multipleProjectTimesheets) {
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

    freez(bool: boolean) {
        this.disablebtn = bool;
        this.bProgress = bool;
    }
}

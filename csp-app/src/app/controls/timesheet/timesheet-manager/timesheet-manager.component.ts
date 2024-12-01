import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, TimesheetProjectEmpModel } from '../../../../app/models/timesheet-model';
import { TimesheetTypeModel } from '../../../models/date-range-model';

@Component({
  selector: 'app-timesheet-manager',
  templateUrl: './timesheet-manager.component.html',
  styleUrls: ['./timesheet-manager.component.scss']
})
export class TimesheetManagerComponent implements OnInit {
    @Input('customerId') input_custId: string;
    timesheetType: TimesheetTypeModel = new TimesheetTypeModel();
    projects = [];
    selectedProject;
    boolflag: boolean = false;
    reviewflag: boolean = false;
    projectTimesheets: TimesheetProjectEmpModel = new TimesheetProjectEmpModel();
    tableMonth: string = this._util.Month();
    tableYear: number = this._util.Year();
    disablebtn: boolean = false;
    bProgress: boolean = false;
    comments: string = "";
    constructor(public _util: myUtility, private _appservice: AppsService) { }

    ngOnInit() {
        this.LoadData();
    }
    ngOnChanges() {
        this.LoadData();
    }
    LoadData() {
        if (this.input_custId != undefined) {
            if (this._util.IsGAVS())
                this.service_getProjectNamesForEmployee(this.input_custId, localStorage.getItem('empid'));
            else
                this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));
        }
    }
    LoadComments() {
        if (this.projectTimesheets != undefined && this.projectTimesheets.employees.length > 0 && this.projectTimesheets.employees[0].timesheet.length > 0) {
            this.comments = this.projectTimesheets.employees[0].timesheet[0].rejecT_DESC;
        }
    }
    GetBackground(entry) {
        if (entry.clndR_DAY_NAME === "Sun" || entry.clndR_DAY_NAME === "Sat")
            return "#f3f37e";
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
    // PMOSave_onClick() {
    //     if (this.projectTimesheets.employees.length > 0) {
    //         for (let employee of this.projectTimesheets.employees) {
    //             if (employee.status.toString() != 'FOR REVIEW' && employee.status.toString() != 'CUSTOMER REJECT') {
    //                 alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT'");
    //                 return;
    //             }
    //         }
    //         this.updateStatus("FOR REVIEW", "");
    //         let successMessage: string = "Updated Successfully";
    //         this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    //     }
    // }

    // SubmitForApproval_onClick() {
    //     for (let timesheet of this.projectTimesheets.employees) {
    //         if (timesheet.status != "FOR REVIEW" && timesheet.status != "CUSTOMER REJECT") {
    //             alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT'");
    //             return;
    //         }
    //     }
    //     if (confirm("Are you sure you want to submit for Approval?")) {
    //         this.updateStatus("FOR APPROVAL", "");
    //         let successMessage: string = "Successfully submitted for Approval";
    //         this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    //     }
    // }

    // Approve_onClick() {
    //     for (let timesheet of this.projectTimesheets.employees) {
    //         if (timesheet.status == "APPROVED") {
    //             alert("Timesheets are already approved");
    //             return;
    //         }
    //         else if (timesheet.status != "FOR APPROVAL" && timesheet.status != "CUSTOMER REJECT") {
    //             alert("Status of all entries should be 'FOR APPROVAL' or 'CUSTOMER REJECT'");
    //             return;
    //         }
    //     }
    //     if (confirm("Are you sure you want to Approve?")) {
    //         this.updateStatus("APPROVED", this.comments);
    //         let successMessage: string = "Approved Successfully";
    //         this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    //     }
    // }

    // CustomerReject_onClick() {
    //     for (let timesheet of this.projectTimesheets.employees) {
    //         if (timesheet.status == "APPROVED") {
    //             alert("Timesheets are already approved");
    //             return;
    //         }
    //         else if (timesheet.status != "FOR APPROVAL" && timesheet.status != "CUSTOMER REJECT") {
    //             alert("Status of all entries should be 'FOR APPROVAL' or 'CUSTOMER REJECT'");
    //             return;
    //         }
    //     }
    //     if (confirm("Are you sure you want Reject?")) {
    //         this.updateStatus("CUSTOMER REJECT", this.comments);
    //         let successMessage: string = "Successfully Rejected";
    //         this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    //     }
    // }

    // updateStatus(status, rejectDesc) {
    //     this.projectTimesheets.employees.forEach(element => {
    //         element.status = status;
    //         element.timesheet.forEach(subElement => {
    //             subElement.timE_ENTRY_STATUS = status;
    //             subElement.rejecT_DESC = rejectDesc;
    //             // if(subElement.clockeD_MINS === "")
    //             // subElement.clockeD_MINS = null;
    //         })
    //     });
    // }

    updateStatus(status, rejectDesc) {

        let alertneeded: boolean = false;
        this.projectTimesheets.employees.forEach(element => {
          if (element.selected == true) {
           
            element.status = status;
            //var empty = element.timesheet.filter(x => x.proJ_RESRC_TIME_ENTRY_ID == null).length;
           
            element.timesheet.forEach(subElement => {
                if (subElement.timE_ENTRY_STATUS != null && subElement.timE_ENTRY_STATUS.toLowerCase() != "approved" 
                && subElement.timE_ENTRY_STATUS.toLowerCase() != status && subElement.timE_ENTRY_STATUS.toLowerCase() != "customer reject" )
                  {  subElement.timE_ENTRY_STATUS = status;
              subElement.rejecT_DESC = rejectDesc;
                 }
              // if(subElement.clockeD_MINS === "")
              // subElement.clockeD_MINS = null;
            })
            
          }
        });
        if (alertneeded)
          alert(" Time Entries' status where data is missing will not be updated. ");
      }

    GetTimesheetData() {
        if (this.selectedProject === undefined) {
            alert("Please select a project");
        }
        else
            this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.timesheetType.period, this.tableMonth, this.tableYear);
    }


    service_getProjectNamesForEmployee(custid, empid) {
        this._appservice.GetCustomerProjectsNameWithCustNM(custid, empid).subscribe(data => {
            this.projects = data;
        }, error => {
            this._util.serviceError(error);
        });
    }

    service_getProjectNamesForCustomer(custid, emailid) {
        this._appservice.GetCustomerProjectsNameForClient(custid, emailid).subscribe(data => {
            this.projects = data;
        }, error => {
            this._util.serviceError(error);
        });
    }
    // service_UpdateTimesheetDetails(timeSheetData: TimesheetProjectEmpModel, successMessage) {
    //     this.freez(true);
    //     this._appservice.UpdateTimesheetDetailsMonthlyEmp(timeSheetData, this.tableMonth, this.tableYear.toString(), this.comments).subscribe(data => {
    //         //this.comments = "";
    //         this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.tableMonth, this.tableYear);
    //         alert(successMessage);
    //         this.freez(false);
    //     }, error => {
    //         this._util.serviceError(error);
    //         this.freez(false);
    //     });
    // }

    service_getTimesheetDetails(projid, periodType, month, year) {
        this.freez(true);
        this._appservice.GetTimesheetDetailsByProjectId(projid, periodType, month, year, '').subscribe(data => {
            this.projectTimesheets = data;
            if(this.projectTimesheets.reportinG_MANAGER ==false)
                alert("Please make sure the selected project have approver configured in the Customer Details Screen. In case its not configured, they would not recieve email notification.");
              this.LoadComments();
            this.isValidForCustomer();
            this.freez(false);
        }, error => {
            this._util.serviceError(error);
            this.freez(false);
        });
    }
    isValidForCustomer() {
        if (this.IsCustomer()) {
            for (let timesheet of this.projectTimesheets.employees) {
                if (timesheet.status != "FOR APPROVAL" && timesheet.status != "APPROVED" && timesheet.status != "CUSTOMER REJECT") {
                    this.projectTimesheets = new TimesheetProjectEmpModel();
                    return;
                }
            }
        }
    }

    freez(bool: boolean) {
        this.disablebtn = bool;
        this.bProgress = bool;
    }

}


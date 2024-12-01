import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, TimesheetProjectEmpModel, TimesheetEmployeeModel, ProjectTask, Dates } from '../../../../app/models/timesheet-model';
import { DateRangeModel, TimesheetTypeModel } from '../../../models/date-range-model';
import { enumDateRange } from '../../../Shared/enum';
import { formatDate } from '@angular/common';
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'app-timesheet-team',
  templateUrl: './timesheet-team.component.html',
  styleUrls: ['./timesheet-team.component.scss']
})
export class TimesheetTeamComponent implements OnInit {
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
  tmpSelectedDates: string[] = [];
  bAllChecked: boolean = false;
  //time-sheet update
  projectTask: ProjectTask[] = [];
  date: Dates = new Dates();
  showAppliedHolidays : boolean = false;
  empId:string;
  element: HTMLInputElement;
  //end

  //
  ProjResourceStartDate: any = null;
  ProjResourceEndDate: any = null;
  //
  constructor(public _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
  }
  ngOnChanges() {
    this.LoadData();
  }
  LoadData() {
    this.iscalling = false;
    if(this._util.IsPMO() || this._util.IsCSM())
      alert("Timesheet approval has been moved to the new Screen. Please navigate to the new Timesheet Screen for approving the timesheets.");

      //this._router.navigateByUrl('/newdashboard/custm');
    this.service_getTimesheetType();
    if (this.input_custId != undefined) {

      if (this._util.IsGAVS())
        this.service_getProjectNamesForEmployee(this.input_custId, localStorage.getItem('empid'));
      else
        this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));
    }
    this.service_GetProjectTasks(this._util.holidayIds); // 3 - Leave , 5 - Holiday
  }
  LoadComments() {
    if (this.projectTimesheets != undefined && this.projectTimesheets.employees.length > 0 && this.projectTimesheets.employees[0].timesheet.length > 0) {
      this.comments = this.projectTimesheets.employees[0].timesheet[0].rejecT_DESC;
    }
  }
  // GetBackground(entry) {
  //   if (this.isWeekEnd(entry))
  //     return this._util.ColorShaders.WeekEndShade;
  //   if (entry.proJ_TASK_ID === 3)
  //     return this._util.ColorShaders.LeaveShade;
  //   else if (entry.proJ_TASK_ID === 5)
  //     return this._util.ColorShaders.HolidayShade;
  // }
  GetBackground(entry,tsdata) {
    //
    let statusClndrDate1 = new Date(entry.clndR_DATE);
    let ProjResourceStartDate1 = new Date(tsdata.startdate);
    let ProjResourceEndDate1 = new Date(tsdata.enddate);

    //initialize to global
    this.ProjResourceStartDate = ProjResourceStartDate1;
    this.ProjResourceEndDate = ProjResourceEndDate1
    if (!(statusClndrDate1 >= ProjResourceStartDate1 && statusClndrDate1 <= ProjResourceEndDate1))
      return this._util.ColorShaders.BlockedShade;
    //
    if (this.isWeekEnd(entry))
      return this._util.ColorShaders.WeekEndShade;
    if (entry.proJ_TASK_ID === 3)
      return this._util.ColorShaders.LeaveShade;
    else if (entry.proJ_TASK_ID === 5)
      return this._util.ColorShaders.HolidayShade;
  }
  // disableEntry(status, holidayApplied) {
  //   if (this._util.IsPMO() === true &&
  //     (status === 'FOR REVIEW' || status === 'CUSTOMER REJECT' || status === 'DRAFT' || status === null || status === "")
  //   )
  //     return (holidayApplied === 3 || holidayApplied === 5);
  //   else
  //     return true;
  // }
  disableEntry(status, holidayApplied,calenderDate,tsdata) {
    return true;
    if(tsdata == undefined){
      tsdata = this.projectTimesheets.employees[0];
    }

    if(calenderDate == undefined){
      calenderDate = this.projectTimesheets.employees[0].timesheet[0];
    }

    let statusClndrDate1 = new Date(calenderDate.clndR_DATE);
    let ProjResourceStartDate1 = new Date(tsdata.startdate);
    let ProjResourceEndDate1 = new Date(tsdata.enddate);

    //initialize to global
    this.ProjResourceStartDate = ProjResourceStartDate1;
    this.ProjResourceEndDate = ProjResourceEndDate1

    if (!(statusClndrDate1 >= ProjResourceStartDate1 && statusClndrDate1 <= ProjResourceEndDate1))
      return true;

    if (this._util.IsPMO() === true &&
      (status === 'FOR REVIEW' || status === 'CUSTOMER REJECT' || status === 'DRAFT' || status === null || status === "")
    )
      return (holidayApplied === 3 || holidayApplied === 5);
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

  //Time-Sheet updatation
  isWeekEnd(entry) {
    return entry.clndR_DAY_NAME === "Sun" || entry.clndR_DAY_NAME === "Sat";
  }
  leaveApplied(timesheet: Dates, projects: TimesheetEmployeeModel []) {

    //Filter only respective projects based on employee selection
    var filteredProject = projects.filter(e=>e.emP_ID === this.empId);
    for (let p of filteredProject) {
    var appliedLeave = p.timesheet.find(t => t.proJ_TASK_ID === timesheet.proJ_TASK_ID && t.datE_ID === timesheet.datE_ID && t.proJ_TASK_ID != 1)
      return timesheet.isHoliday = (appliedLeave != undefined && appliedLeave != null);
    }
  }
  holidayChecked(project: ProjectTask[], parentIndex: number, childIndex: number, projTimesheet: TimesheetEmployeeModel[], event: any, projTaskid: number) {

    let rowIndex = 0
    var itemChecked = event.srcElement.checked;
    for (let projTask of project) {
      let columnIndex = 0
      for (let dateObj of projTask.dates) {
        if (rowIndex != parentIndex && columnIndex == childIndex) {

          this.element = document.getElementById(rowIndex.toString() + columnIndex.toString()) as HTMLInputElement;
          this.element.disabled = itemChecked;
          var filteredTimeEntry = projTimesheet.filter(e => e.emP_ID === this.empId)
          for (let pt of filteredTimeEntry) {

            var selectedTimeEntry = pt.timesheet.find(t => t.datE_ID == dateObj.datE_ID);
            selectedTimeEntry.clockeD_MINS = 0;
            selectedTimeEntry.proJ_TASK_ID = itemChecked ? projTaskid : null;
          }
        }
        columnIndex++
      }
      rowIndex++
    }
  }
  updateTimeSheet(employee: TimesheetEmployeeModel) {

   // Filter date list into object
  let dates: Dates[] = [];
    dates = [] = []
    for (let d of employee.timesheet) {
      if (!this.isWeekEnd(d)) {
        this.date = new Dates()
        this.date.date = formatDate(d.clndR_DATE, "dd-MMM", "en-US")
        this.date.clndR_DAY_NAME = d.clndR_DAY_NAME
        this.date.datE_ID = d.datE_ID
        this.date.enable = false //(d.timE_ENTRY_STATUS != null && d.timE_ENTRY_STATUS != 'DRAFT')
        this.date.isHoliday = false
        this.date.proJ_TASK_ID = d.proJ_TASK_ID
        dates.push(this.date)
      }
    }
  // Map the date object with respective to task category
  let dat: Dates[] = []
  for (let f of this.projectTask) {
    dat = [] = []

    for (let d of dates) {
      if (d.proJ_TASK_ID != f.proJ_TASK_ID && d.proJ_TASK_ID != 1) {
        this.date = new Dates()
        this.date.date = d.date
        this.date.clndR_DAY_NAME = d.clndR_DAY_NAME
        this.date.datE_ID = d.datE_ID
        this.date.enable = d.enable
        this.date.isHoliday = d.isHoliday
        this.date.proJ_TASK_ID = 1
        dat.push(this.date);
      }
      else
        dat.push(d);
    }
    f.dates = dat;
  }
  this.empId = employee.emP_ID;
  // show holiday table
this.showAppliedHolidays = (dat.length > 0);
}

  ResetProjectTaskHolidays() {
// Reset the dates
this.projectTask.forEach(p=> p.dates = [])
this.showAppliedHolidays = false;
}

  Cancel_LeaveChanges() {
  this.GetTimesheetData();
}

service_GetProjectTasks(taskId: string) {
  this._appservice.GetProjectTasks(taskId).subscribe(data => {
    this.projectTask = data;
  }, error => { this._util.serviceError(error); });
}
// end
  PMOSave_onClick() {
    if (this.projectTimesheets.employees.length > 0) {
      for (let employee of this.projectTimesheets.employees) {
        // if (employee.status.toString() != 'FOR REVIEW' && employee.status.toString() != 'CUSTOMER REJECT'
        //   && employee.status.toString() != '' && employee.status.toString() != 'DRAFT'
        //   && employee.status.toString() != 'APPROVED') {
        //   alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT' or 'DRAFT'");
        //   return;
        // }
      }
      //this.updateStatus("FOR REVIEW", "");
      this.updateStatusIfStatusEmpty("FOR REVIEW");
      let successMessage: string = "Updated Successfully";
      this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    }
  }

  SubmitForApproval_onClick() {
    let bDraft: Boolean = false;
    // for (let timesheet of this.projectTimesheets.employees) {
    //   if (timesheet.status != "FOR REVIEW" && timesheet.status != "CUSTOMER REJECT" && timesheet.status != "APPROVED"
    //     && timesheet.status.toString() != '' && timesheet.status.toString() != 'DRAFT') {
    //     alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT' or 'DRAFT'");
    //     return;
    //   }
    // }

    for (let timesheet of this.projectTimesheets.employees) {
      if (timesheet.status.toString() === '' && timesheet.status.toString() === 'DRAFT') {
        bDraft = true;
      }
    }

    if (confirm("Are you sure you want to submit for Approval?")) {
      if (bDraft) {
        if (confirm("Some of the timesheets are still in DRAFT status, \n Are you sure you want to submit for Approval?")) {
          this.updateStatus("FOR APPROVAL", "");
          let successMessage: string = "Selected Record(s) Successfully submitted for Approval";
          this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
        }
      }
      else {
        this.updateStatus("FOR APPROVAL", "");
        let successMessage: string = "Selected Record(s) Successfully submitted for Approval";
        this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
      }
    }
  }

  Approve_onClick() {
    for (let timesheet of this.projectTimesheets.employees) {
      if (timesheet.status == "APPROVED") {
        alert("Timesheets are already approved");
        return;
      }
      else if (timesheet.status != "FOR APPROVAL" && timesheet.status != "CUSTOMER REJECT") {
        alert("Status of all entries should be 'FOR APPROVAL' or 'CUSTOMER REJECT'");
        return;
      }
    }
    if (confirm("Are you sure you want to Approve?")) {
      this.updateStatus("APPROVED", this.comments);
      let successMessage: string = "Approved Successfully";
      this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    }
  }

  CustomerReject_onClick() {
    for (let timesheet of this.projectTimesheets.employees) {
      if (timesheet.status == "APPROVED") {
        alert("Timesheets are already approved");
        return;
      }
      else if (timesheet.status != "FOR APPROVAL" && timesheet.status != "CUSTOMER REJECT") {
        alert("Status of all entries should be 'FOR APPROVAL' or 'CUSTOMER REJECT'");
        return;
      }
    }
    if (confirm("Are you sure you want Reject?")) {
      this.updateStatus("CUSTOMER REJECT", this.comments);
      let successMessage: string = "Successfully Rejected";
      this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    }
  }

  // updateStatus(status, rejectDesc) {
  //   this.projectTimesheets.employees.forEach(element => {
  //     if (element.status != 'APPROVED')
  //       element.status = status;
  //     element.timesheet.forEach(subElement => {
  //       if (subElement.timE_ENTRY_STATUS != 'APPROVED')
  //         subElement.timE_ENTRY_STATUS = status;
  //       //subElement.rejecT_DESC = rejectDesc;

  //     })
  //   });
  // }

  chkAllProj_OnChange(proj) {
    for (let emp of proj.employees) {
      emp.selected = proj.selected;
    }
  }

  chkAll_OnChange(obj) {

    this.projectTimesheets.employees.forEach(element => {
      element.selected = this.bAllChecked;
    });

  }
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

  updateStatusIfStatusEmpty(status) {
    this.projectTimesheets.employees.forEach(element => {
      element.timesheet.forEach(subElement => {
        if (element.status === '')
          subElement.timE_ENTRY_STATUS = 'DRAFT';
        else if (element.status === "CUSTOMER REJECT")
          subElement.timE_ENTRY_STATUS = status; //element.status;
        else
          subElement.timE_ENTRY_STATUS = element.status;
      })
    });
  }
  GetTimesheetData() {
    if (this.selectedProject === undefined) {
      alert("Please select a project");
    }
    else {
      this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.timesheetType.period);
      this._appservice.ProcessPSARequests().subscribe(e=>{});
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

  showApproval(){
    if(!this._util.IsPremier(this.input_custId) && (this._util.IsPMO() || this._util.IsCSM()))
      return true;
    this._appservice.GetDBConfigValue('AllowOldApproval',-1,'').subscribe
    ( x=>{

      return (this._util.IsPMO() || this._util.IsCSM()) && ( x== "YES");
    });

  }
  service_refreshCalendarWeeks(timesheetType: TimesheetTypeModel) {
    //this.freez(true);
    this._appservice.GetCalendarDateRange(timesheetType).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
      //this.tmpSelectedDates = this.timesheetType.selectedDates;
      //this.freez(false);
    }, error => {
      this._util.serviceError(error);
      //this.freez(false);
    });
  }
  service_getTimesheetType() {
    this._appservice.GetTimesheetType(this.input_custId).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
      this.tmpSelectedDates = this.timesheetType.selectedDates;
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
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });
  }

  service_getProjectNamesForEmployee(custid, empid) {
    this._appservice.GetCustomerProjectsNameWithCustNM(custid, empid).subscribe(data => {
      this.projects = data;
      if(this.projects!=undefined && this.projects.length>0)
        this.selectedProject = this.projects[0];
    }, error => {
      this._util.serviceError(error);
    });
  }

  service_getProjectNamesForCustomer(custid, emailid) {
    this._appservice.GetCustomerProjectsNameForClient(custid, emailid).subscribe(data => {
      this.projects = data;
      if(this.projects!=undefined && this.projects.length>0)
        this.selectedProject = this.projects[0];
    }, error => {
      this._util.serviceError(error);
    });
  }
  service_UpdateTimesheetDetails(timeSheetData: TimesheetProjectEmpModel, successMessage) {
    this.freez(true);
    this._appservice.UpdateTimesheetDetailsMonthlyEmp(timeSheetData, this.timesheetType.period, this.timesheetType.selectedDateRange.startDate, this.timesheetType.selectedDateRange.endDate, this.comments).subscribe(data => {
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
    this._appservice.GetTimesheetDetailsByProjectIdPMO(projid, periodType, st, ed, '').subscribe(data => {
      this.projectTimesheets = data;
      if(this.projectTimesheets.reportinG_MANAGER ==false)
        alert("Please make sure  the selected project have approver configured in the Customer Details Screen. In case its not configured, they would not recieve email notification.");
      this.tmpSelectedDates = this.timesheetType.selectedDates;
      this.LoadComments();
      this.isValidForCustomer();
      this.freez(false);
      this.ResetProjectTaskHolidays();
      //
      this.projectTimesheets.employees.forEach(element => {
        let sdate: any = formatDate(element.startdate, "dd-MMM-yyyy", "en-US");
        this.ProjResourceStartDate = sdate;
        let edate: any = formatDate(element.enddate, "dd-MMM-yyyy", "en-US");
        this.ProjResourceEndDate = edate;
      });

      //
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });
  }
  isValidForCustomer() {
    if (this._util.IsCustomer()) {
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

  iscalling = false;

  bulkemail(){
    let arr: string[] = this.timesheetType.selectedDateRange.displayName.split(' ');
    let stda = arr[0];
    let edda = arr[2];
    let projId = (this.selectedProject== undefined || this.selectedProject == null) ? null: this.selectedProject.proJ_ID;

    if(projId == undefined || projId == null) return;
    this.iscalling= true;
    this._appservice.TimeSheetRemainderEmail(stda, edda, this.input_custId.toString(),   projId).subscribe(data => {
      this.iscalling= false;
      if(data != null){
        let status = JSON.stringify(data);
        if(status == "true"){
          alert("Reminder Mail Sent Successfully!");
        }
        else{
          alert("Reminder Mail Not sent");
        }
      }
    }, error => {
      this.iscalling=false;
    });
  }

}

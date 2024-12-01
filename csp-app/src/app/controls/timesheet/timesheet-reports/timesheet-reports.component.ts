import { AfterViewInit, Component, OnInit, ContentChild, ElementRef } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, TimesheetProjectEmpModel } from '../../../../app/models/timesheet-model';
import { Input } from '@angular/core';
import { ProjectsModel } from '../../../models/projects-model';
import { DateRangeModel, TimesheetTypeModel } from '../../../models/date-range-model';
import { enumDateRange } from '../../../Shared/enum';

@Component({
  selector: 'app-timesheet-reports',
  templateUrl: './timesheet-reports.component.html',
  styleUrls: ['./timesheet-reports.component.scss']
})
export class TimesheetReportsComponent implements OnInit {
  @Input('customerId') input_custId: string;
  timesheetType:TimesheetTypeModel = new TimesheetTypeModel();
  bHideDetails: string = "hidden";
  iconHideDetails: string = ">";
  projects: ProjectsModel[] = [];
  allProjects = null;
  selectedProject: ProjectsModel = new ProjectsModel();
  boolflag: boolean = false;
  reviewflag: boolean = false;
  projectTimesheets: TimesheetProjectEmpModel = new TimesheetProjectEmpModel();
  multipleProjectTimesheets: TimesheetProjectEmpModel[] = [];
  multipleProjectTimesheets_filtered: TimesheetProjectEmpModel[] = [];
  tableMonth: string = this._util.Month();
  tableYear: number = this._util.Year();
  disablebtn: boolean = false;
  bProgress: boolean = false;
  comments: string = "";
  selectedReportType = "summary";
  tmpSelectedDates:string[] = [];
  constructor(public _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.LoadData();
  }
  ngOnChanges() {
    this.LoadData();
  }
  toggle_OnClick() {
    if (this.bHideDetails === "hidden") {
      this.bHideDetails = "visible";
      this.iconHideDetails = "<";
    }
    else {
      this.bHideDetails = "hidden";
      this.iconHideDetails = ">";
    }
  }
  LoadData() {
    this.service_getTimesheetType();
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
  onValChange(val) {
    this.selectedReportType = val;
  }
  GetBackground(entry) {
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
  // PMOSave_onClick() {
  //   if (this.projectTimesheets.employees.length > 0) {
  //     for (let employee of this.projectTimesheets.employees) {
  //       if (employee.status.toString() != 'FOR REVIEW' && employee.status.toString() != 'CUSTOMER REJECT') {
  //         alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT'");
  //         return;
  //       }
  //     }
  //     this.updateStatus("FOR REVIEW", "");
  //     let successMessage: string = "Updated Successfully";
  //     this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
  //   }
  // }

  // SubmitForApproval_onClick() {
  //   for (let timesheet of this.projectTimesheets.employees) {
  //     if (timesheet.status != "FOR REVIEW" && timesheet.status != "CUSTOMER REJECT") {
  //       alert("Status of all entries should be 'FOR REVIEW' or 'CUSTOMER REJECT'");
  //       return;
  //     }
  //   }
  //   if (confirm("Are you sure you want to submit for Approval?")) {
  //     this.updateStatus("FOR APPROVAL", "");
  //     let successMessage: string = "Successfully submitted for Approval";
  //     this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
  //   }
  // }

  // Approve_onClick() {
  //   for (let timesheet of this.projectTimesheets.employees) {
  //     if (timesheet.status == "APPROVED") {
  //       alert("Timesheets are already approved");
  //       return;
  //     }
  //     else if (timesheet.status != "FOR APPROVAL" && timesheet.status != "CUSTOMER REJECT") {
  //       alert("Status of all entries should be 'FOR APPROVAL' or 'CUSTOMER REJECT'");
  //       return;
  //     }
  //   }
  //   if (confirm("Are you sure you want to Approve?")) {
  //     this.updateStatus("APPROVED", this.comments);
  //     let successMessage: string = "Approved Successfully";
  //     this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
  //   }
  // }

  // CustomerReject_onClick() {
  //   for (let timesheet of this.projectTimesheets.employees) {
  //     if (timesheet.status == "APPROVED") {
  //       alert("Timesheets are already approved");
  //       return;
  //     }
  //     else if (timesheet.status != "FOR APPROVAL" && timesheet.status != "CUSTOMER REJECT") {
  //       alert("Status of all entries should be 'FOR APPROVAL' or 'CUSTOMER REJECT'");
  //       return;
  //     }
  //   }
  //   if (confirm("Are you sure you want Reject?")) {
  //     this.updateStatus("CUSTOMER REJECT", this.comments);
  //     let successMessage: string = "Successfully Rejected";
  //     this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
  //   }
  // }

  updateStatus(status, rejectDesc) {
    this.projectTimesheets.employees.forEach(element => {
      element.status = status;
      element.timesheet.forEach(subElement => {
        subElement.timE_ENTRY_STATUS = status;
        subElement.rejecT_DESC = rejectDesc;
        // if(subElement.clockeD_MINS === "")
        // subElement.clockeD_MINS = null;
      })
    });
  }

  GetTimesheetData() {
    if (this.selectedProject === undefined || this.selectedProject.proJ_NM == undefined) {
      alert("Please select a project");
    }
    else if (this.selectedProject.proJ_NM === 'All') {
      let projList: string[] = this.projects.map(t => t.proJ_ID);
      this.service_getTimesheetDetailsByProjectIds(projList, this.timesheetType.period);
    }
    else
      this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.timesheetType.period);
  }

  applyFilter(filterValue: string) {
    this.multipleProjectTimesheets_filtered = this._util.CopyObject(this.multipleProjectTimesheets);

    for (let proj of this.multipleProjectTimesheets_filtered) {
      proj.employees = proj.employees.filter
        (item => Object.keys(item).some(k => item[k] != null && item[k].toString().toLowerCase().includes(filterValue.toLowerCase())));
    }
    this.multipleProjectTimesheets_filtered = this.multipleProjectTimesheets_filtered.filter(t => t.employees.length > 0);

    let test = 'test';
  }
  ddMonth_OnChange(){
    this.timesheetType.selectedDateRange.startDate = new Date(Date.UTC(this.tableYear, this._util.getMonthNum(this.tableMonth), 1, 0, 0, 0));
    //this.timesheetType.selectedDateRange.startDate = new Date("1-" + this.tableMonth + "-" + this.tableYear.toString());
    this.service_refreshCalendarWeeks(this.timesheetType);
  }
  ddWeek_OnChange() {
    this.service_refreshCalendarWeeks(this.timesheetType);
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
  service_getProjectNamesForEmployee(custid, empid) {
    this._appservice.GetCustomerProjectsNameWithCustNM(custid, empid).subscribe(data => {
      this.projects = data;
      if (this.projects.length > 1)
        this.projects.unshift(this.GetProjectAll());
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
  service_getTimesheetType() {
    this._appservice.GetTimesheetType(this.input_custId).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t=> t.current == true)[0];
    }, error => {
      this._util.serviceError(error);
    });
  }
  service_getCalendarWeeks(timesheetType:TimesheetTypeModel) {
    this.freez(true);
    this._appservice.GetCalendarDateRange(timesheetType).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t=> t.current == true)[0];
      this.freez(false);
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });
  }
  service_getProjectNamesForCustomer(custid, emailid) {
    this._appservice.GetCustomerProjectsNameForClient(custid, emailid).subscribe(data => {
      this.projects = data;
      if (this.projects.length > 1)
        this.projects.unshift(this.GetProjectAll());
    }, error => {
      this._util.serviceError(error);
    });
  }
  // service_UpdateTimesheetDetails(timeSheetData: TimesheetProjectEmpModel, successMessage) {
  //   this.freez(true);
  //   this._appservice.UpdateTimesheetDetailsMonthlyEmp(timeSheetData, this.tableMonth, this.tableYear.toString(), this.comments).subscribe(data => {
  //     //this.comments = "";
  //     this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.tableMonth, this.tableYear);
  //     alert(successMessage);
  //     this.freez(false);
  //   }, error => {
  //     this._util.serviceError(error);
  //     this.freez(false);
  //   });
  // }

  service_getTimesheetDetails(projid, periodType) {    
    this.freez(true);
    // let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
    // let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
    let arr:string[] = this.timesheetType.selectedDateRange.displayName.split(' ');
    let st = arr[0]; 
    let ed = arr[2];
    this._appservice.GetTimesheetDetailsByProjectId(projid, periodType, st, ed, '').subscribe(data => {
      this.multipleProjectTimesheets = [];
      this.multipleProjectTimesheets.push(data);
      this.multipleProjectTimesheets_filtered = this._util.CopyObject(this.multipleProjectTimesheets);
      this.tmpSelectedDates = this.timesheetType.selectedDates;       
      this.freez(false);
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });
  }

  service_getTimesheetDetailsByProjectIds(projids, periodType) { 
    this.freez(true);
    
    // let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
    // let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
    let arr:string[] = this.timesheetType.selectedDateRange.displayName.split(' ');
    let st = arr[0]; 
    let ed = arr[2];

    this._appservice.GetTimesheetDetailsByProjectIds(projids, periodType, st, ed, '').subscribe(data => {
      this.multipleProjectTimesheets = data;
      this.multipleProjectTimesheets_filtered = this._util.CopyObject(this.multipleProjectTimesheets);
      this.tmpSelectedDates = this.timesheetType.selectedDates;
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


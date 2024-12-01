import { AfterViewInit, Component, OnInit, ContentChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, TimesheetProjectEmpModel } from '../../../../app/models/timesheet-model';
import { Input } from '@angular/core';
import { ProjectsModel } from '../../../models/projects-model';
import { DateRangeModel, TimesheetTypeModel } from '../../../models/date-range-model';
import { enumDateRange } from '../../../Shared/enum';
import { MatDatepickerInputEvent } from '@angular/material';
import { formatDate } from '@angular/common';
import { isoStringToDate } from '@angular/common/src/i18n/format_date';

@Component({
  selector: 'app-timesheet-reports-historical',
  templateUrl: './timesheet-reports-historical.component.html',
  styleUrls: ['./timesheet-reports-historical.component.scss']
})
export class TimesheetReportsHistoricalComponent implements OnInit {
  @Input('customerId') input_custId: string;
  timesheetType: TimesheetTypeModel = new TimesheetTypeModel();
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
  tmpSelectedDates: string[] = [];
  timesheetfromdate: Date = new Date();
  timesheetTodate: Date = new Date();
  timesheetstatus: string[]=[];
  timesheetstatusSelected: string="";  
  
  @Output() 
  dateChange:EventEmitter<MatDatepickerInputEvent<any>>;

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
    //this.service_getTimesheetType();
    if (this.input_custId != undefined) {
      if (this._util.IsGAVS())
        this.service_getProjectNamesForEmployee(this.input_custId, localStorage.getItem('empid'));
      else
        this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));
        this.loadtimesheetstatus();
    }
  }
  loadtimesheetstatus()
  {
    this.service_GetDistinctTimesheetStatus(this.input_custId, localStorage.getItem('empid'));
    this.timesheetstatusSelected="APPROVED";
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

  OnFromDateChange(selectedFromDate: any) {      
    if(selectedFromDate.value > this.timesheetTodate) {
      this.timesheetTodate = selectedFromDate.value;
    }    
  }

  GetTimesheetData() {
    this.service_getTimesheetType();    
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

  service_refreshCalendarWeeks(timesheetType: TimesheetTypeModel) {
    //this.freez(true);
    this._appservice.GetCalendarDateRange(timesheetType).subscribe(data => {
      this.timesheetType = data;
      //this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
      this.tmpSelectedDates = this.timesheetType.selectedDates;
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

  service_GetDistinctTimesheetStatus(custid, empid) {
    this._appservice.GetDistinctTimesheetStatus(custid, empid).subscribe(data => {
      this.timesheetstatus = data;      
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
    this.timesheetType.period = enumDateRange.Custom;
    this.timesheetType.selectedDateRange.startDate = this.timesheetfromdate;
    this.timesheetType.selectedDateRange.endDate = this.timesheetTodate;
    this.service_refreshCalendarWeeks(this.timesheetType);
  }
  // service_getCalendarWeeks(timesheetType:TimesheetTypeModel) {
  //   this.freez(true);
  //   this._appservice.GetCalendarDateRange(timesheetType).subscribe(data => {
  //     this.timesheetType = data;
  //     this.timesheetType.selectedDateRange = data.dateRange.filter(t=> t.current == true)[0];
  //     this.freez(false);
  //   }, error => {
  //     this._util.serviceError(error);
  //     this.freez(false);
  //   });
  // }
  service_getProjectNamesForCustomer(custid, emailid) {
    this._appservice.GetCustomerProjectsNameForClient(custid, emailid).subscribe(data => {
      this.projects = data;
      if (this.projects.length > 1)
        this.projects.unshift(this.GetProjectAll());
    }, error => {
      this._util.serviceError(error);
    });
  }

  service_getTimesheetDetails(projid, periodType) {
    this.freez(true);
    this._appservice.GetTimesheetDetailsByProjectId(projid, periodType, this.timesheetType.selectedDateRange.startDate.toString().slice(0,15), this.timesheetType.selectedDateRange.endDate.toString().slice(0,15), this.timesheetstatusSelected).subscribe(data => {
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
    this._appservice.GetTimesheetDetailsByProjectIds(projids, periodType, this.timesheetType.selectedDateRange.startDate.toString().slice(0,15), this.timesheetType.selectedDateRange.endDate.toString().slice(0,15), this.timesheetstatusSelected).subscribe(data => {
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

  ddtimesheetstatus_OnChange()
  {

  }

  freez(bool: boolean) {
    this.disablebtn = bool;
    this.bProgress = bool;
  }

}


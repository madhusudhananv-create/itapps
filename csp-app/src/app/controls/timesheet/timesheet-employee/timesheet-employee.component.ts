import { Component, OnInit, Input } from '@angular/core';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, ProjectTask, Dates } from '../../../../app/models/timesheet-model';
import { enumDateRange } from '../../../Shared/enum';
import { DateRangeModel, TimesheetTypeModel } from '../../../models/date-range-model';
import { skip } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { retry } from 'rxjs-compat/operator/retry';
import { empty } from 'rxjs';
import { fadeInContent } from '@angular/material';

@Component({
  selector: 'app-timesheet-employee',
  templateUrl: './timesheet-employee.component.html',
  styleUrls: ['./timesheet-employee.component.scss']
})
export class TimesheetEmployeeComponent implements OnInit {
  @Input('customerId') input_custId: string;

  timesheetType: TimesheetTypeModel = new TimesheetTypeModel();
  tableMonth: string = this._util.Month();
  tableYear: number = this._util.Year();
  boolflag: Boolean = false;
  projectTimesheets: TimesheetProjectModel[] = [];
  disablebtn: boolean = false;
  bProgress: boolean = false;
  holidayTypes = [];
  projectTask: ProjectTask[] = [];
  timesheet: TimesheetModel[] = [];
  element: HTMLInputElement;
  date: Dates = new Dates();
  ProjResourceStartDate: any = null;
  ProjResourceEndDate: any = null;
  statusClndrDate :any = null;

  saveBtnClicked:boolean =false;
  confirmBtnClicked:boolean =false;
  leaveCheckbtnClicked:boolean=false;//
  dateIdToBlock:number=0;//

  constructor(public _util: myUtility, private _appservice: AppsService) { }
  ngOnInit() {
    this.service_GetProjectTasks(this._util.holidayIds); // 3 - Leave , 5 - Holiday
    this.service_getTimesheetType();
  }
  ngOnChanges() {
    this.service_GetProjectTasks(this._util.holidayIds); // 3 - Leave , 5 - Holiday
    this.service_getTimesheetType();
  }
  LoadData() {
    this.service_getTimesheetDetails(this.input_custId);
  }
  disableEntryForComments(status) {
    return true;
    if (status.timE_ENTRY_STATUS == '' && status.proJ_TASK_ID == '')
      return false;
    else if (status.timE_ENTRY_STATUS == null && status.proJ_TASK_ID == null)
      return false;
    else if (status.timE_ENTRY_STATUS == 'DRAFT')
      return false
    else if (status.timE_ENTRY_STATUS == 'CUSTOMER REJECT')
      return false
    else if (status.proJ_TASK_ID === 3 || status.proJ_TASK_ID === 5 && status.timE_ENTRY_STATUS != 'DRAFT')
      return true
    else
      return true;
  }

  disableEntry(status,tsdata) {
    if(tsdata == undefined){
      tsdata = this.projectTimesheets[0];
    }
    let statusClndrDate1 = new Date(status.clndR_DATE);
    let ProjResourceStartDate1 = new Date(tsdata.startdate);
    let ProjResourceEndDate1 = new Date(tsdata.enddate);

    //initialize to global
    this.ProjResourceStartDate = ProjResourceStartDate1;
    this.ProjResourceEndDate = ProjResourceEndDate1

    // if (statusClndrDate1> new Date(this._util.Today()))
    // return true;

    //disable entry for all
    return true;

    if (!(statusClndrDate1 >= ProjResourceStartDate1 && statusClndrDate1 <= ProjResourceEndDate1))
      return true;
    else if (status.timE_ENTRY_STATUS == '' && status.proJ_TASK_ID == '')
      return false;
    else if (status.timE_ENTRY_STATUS == null && status.proJ_TASK_ID == null)
      return false;
    else if (status.timE_ENTRY_STATUS == 'DRAFT')
      return false
    else if (status.timE_ENTRY_STATUS == 'CUSTOMER REJECT')
      return false
    else if (status.proJ_TASK_ID === 3 || status.proJ_TASK_ID === 5 && status.timE_ENTRY_STATUS != 'DRAFT')
      return true
    else
      return true;
  }

  // GetBackground(entry) {

  //   let statusClndrDate1 = new Date(entry.clndR_DATE);
  //   let ProjResourceStartDate1 = new Date(this.ProjResourceStartDate);
  //   let ProjResourceEndDate1 = new Date(this.ProjResourceEndDate);

  //   if (!(statusClndrDate1 >= ProjResourceStartDate1 && statusClndrDate1 <= ProjResourceEndDate1))
  //     return this._util.ColorShaders.BlockedShade;
  //   if (this.isWeekEnd(entry))
  //     return this._util.ColorShaders.WeekEndShade;
  //   if (entry.proJ_TASK_ID === 3)
  //     return this._util.ColorShaders.LeaveShade;
  //   else if (entry.proJ_TASK_ID === 5)
  //     return this._util.ColorShaders.HolidayShade;
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
    if (this.isWeekEnd(entry))
      return this._util.ColorShaders.WeekEndShade;
    if (entry.proJ_TASK_ID === 3)
      return this._util.ColorShaders.LeaveShade;
    else if (entry.proJ_TASK_ID === 5)
      return this._util.ColorShaders.HolidayShade;
  }

  isWeekEnd(entry) {
    return entry.clndR_DAY_NAME === "Sun" || entry.clndR_DAY_NAME === "Sat";
  }
  leaveApplied(timesheet: Dates, project: TimesheetProjectModel[]) {
    for (let p of project) {
      var appliedLeave = p.timesheet.find(t => t.proJ_TASK_ID === timesheet.proJ_TASK_ID && t.datE_ID === timesheet.datE_ID && t.proJ_TASK_ID != 1)
      return timesheet.isHoliday = (appliedLeave != undefined && appliedLeave != null);
    }
    //
    if(appliedLeave != undefined && appliedLeave != null){ //
      this.dateIdToBlock=timesheet.datE_ID;   //
    }
    //

  }

   holidayChecked(project: ProjectTask[], parentIndex: number, childIndex: number, projTimesheet: TimesheetProjectModel[], event: any, projTaskid: number) {
  //holidayChecked(project: ProjectTask[], parentIndex: number, childIndex: number, projTimesheet: TimesheetProjectModel[], event: any, projTaskid: number,timesheet: Dates) {

    let rowIndex = 0
    var itemChecked = event.srcElement.checked;
    for (let projTask of project) {
      let columnIndex = 0
      for (let dateObj of projTask.dates) {
        if (rowIndex != parentIndex && columnIndex == childIndex) {

          this.element = document.getElementById(rowIndex.toString() + columnIndex.toString()) as HTMLInputElement;
          this.element.disabled = itemChecked;

          for (let pt of projTimesheet) {

            var selectedTimeEntry = pt.timesheet.find(t => t.datE_ID == dateObj.datE_ID);
            selectedTimeEntry.clockeD_MINS = 0;
            selectedTimeEntry.proJ_TASK_ID = itemChecked ? projTaskid : 1;
          }
        }
        columnIndex++
      }
      rowIndex++
    }
    //testsk
    // if(itemChecked != null){
    //   this.leaveCheckbtnClicked = itemChecked;
    //   this.dateIdToBlock = timesheet.datE_ID;
    // }
    //
  }
  GetTimesheetData() {
    this.LoadData();
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
  Save_onClick() {
    return;
    this.saveBtnClicked = true;
    this.confirmBtnClicked =false;

    for (let timesheet of this.projectTimesheets) {
      if (timesheet.status.toString() != 'DRAFT' && timesheet.status != null && timesheet.status != "" && timesheet.status != "CUSTOMER REJECT") {
        alert("Timesheets already submitted for review");
        return;
      }
    }
    this.checkEmptyTimesheetAndValidateClockedHrs();
  }

  checkEmptyTimesheetAndValidateClockedHrs(){
    let EmptyTimesheet:boolean = true;
    this.projectTimesheets.forEach(element => {
      element.timesheet.forEach(element2=> {
        if(element2.clockeD_MINS != null || element2.clockeD_MINS != undefined){
          EmptyTimesheet=false;
        }
        else{
        }
      });
    });
    if(EmptyTimesheet != true){
      this.service_validateClockedHrs(this.projectTimesheets,this.timesheetType.dayLimit);
    }
  }
  service_validateClockedHrs(timeSheetData: TimesheetProjectModel[],dayLimit:number){
    this.freez(true);
    this._appservice.validateTimesheetClockedHrs(timeSheetData,dayLimit).subscribe(data => {
      let validationStatus:boolean = false;
      this.freez(false);
      if(data != null){
        let message = "Clocked Hours Violation! Please check " +data + "\nMax Clock hours per day:" +dayLimit;
        alert(message);
        validationStatus = false;
      }
      else{
        validationStatus= true;
      }
      let currentDate = new Date();



      if(validationStatus == true && this.saveBtnClicked == true ){
        this.updateStatus("DRAFT");
        let successMessage: string = "Updated Successfully";
        this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
      }

      if(validationStatus == true && this.confirmBtnClicked == true ){
        if(timeSheetData.some(x=>x.timesheet.some(t=> t.clockeD_MINS>0 && new Date(t.clndR_DATE) > currentDate)))
        {
          alert("Timesheet cannot be submitted for future dates");
          return;

        }
        if (confirm("Once Timesheet submitted for review, you cannot input hours or make changes for the week. Are you sure you want submit for review ?")) {
          this.updateStatus("FOR REVIEW");
          let successMessage: string = "Successfully submitted for review";
          this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
        }
      }
    }, error => {
      this.freez(false);
    });
  }

  updateStatus(status) {
    this.projectTimesheets.forEach(element => {
      element.timesheet.forEach(subElement => {
        if (status === 'DRAFT' || status === 'CUSTOMER REJECT') {
          if (subElement.timE_ENTRY_STATUS === null || subElement.timE_ENTRY_STATUS === '') {
            element.status = status;
            subElement.timE_ENTRY_STATUS = status;
          }
        }
        else {
          element.status = status;
          subElement.timE_ENTRY_STATUS = status;
        }
      })
    });
  }
  SubmitForReview_onClick() {
    return;
    this.confirmBtnClicked=true;
    this.saveBtnClicked =false;

    for (let timesheet of this.projectTimesheets) {
      if (timesheet.status.toString() != 'DRAFT' && timesheet.status != null && timesheet.status != "" && timesheet.status != "CUSTOMER REJECT") {
        alert("Timesheets already submitted for review");
        return;
      }
    }
    this.checkEmptyTimesheetAndValidateClockedHrs();
    /*
    if (confirm("Are you sure you want submit for review?,\n Once submitted you cannot make changes")) {
      // this.updateStatus("FOR REVIEW");
      // let successMessage: string = "Successfully submitted for review";
      // this.service_UpdateTimesheetDetails(this.projectTimesheets, successMessage);
    }
    */
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
  ddMonth_OnChange() {
    //this.timesheetType.selectedDateRange.startDate = new Date("1-" + this.tableMonth + "-" + this.tableYear.toString());
    this.timesheetType.selectedDateRange.startDate = new Date(Date.UTC(this.tableYear, this._util.getMonthNum(this.tableMonth), 1, 0, 0, 0));
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
      this.service_getTimesheetDetails(this.input_custId);
      this.freez(false);
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });
  }
  //usp_get_Timesheet_Details_Monthly_Emp
  service_getTimesheetDetails(custid) {
    this.freez(true);

    let arr: string[] = this.timesheetType.selectedDateRange.displayName.split(' ');
    let st = arr[0];
    let ed = arr[2];

    this._appservice.GetTimesheetDetailsByEmpId(custid, st, ed).subscribe(data => {
      this.projectTimesheets = data;


      // Filter date list into object
      let dates: Dates[] = [];

      this.projectTimesheets.forEach(ts => {
        dates = [] = []
        for (let d of ts.timesheet) {
          if (!this.isWeekEnd(d)) {
            this.date = new Dates()
            this.date.date = formatDate(d.clndR_DATE, "dd-MMM", "en-US")
            this.date.clndR_DAY_NAME = d.clndR_DAY_NAME
            this.date.datE_ID = d.datE_ID
            this.date.enable = (d.timE_ENTRY_STATUS != null && d.timE_ENTRY_STATUS != 'DRAFT')
            this.date.isHoliday = false
            this.date.proJ_TASK_ID = d.proJ_TASK_ID
            dates.push(this.date)
          }
        }
      });

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
      //this.freez(false);

      //To Get Exact Start and End Date from PROJ_RESOURCE table
      this.projectTimesheets.forEach(element => {
        let sdate: any = formatDate(element.startdate, "dd-MMM-yyyy", "en-US");
        this.ProjResourceStartDate = sdate;
        let edate: any = formatDate(element.enddate, "dd-MMM-yyyy", "en-US");
        this.ProjResourceEndDate = edate;
      });

      this.freez(false);

    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });

  }

  service_getTimesheetType() {
    this._appservice.GetTimesheetType(this.input_custId).subscribe(data => {

      this.timesheetType = data;

      // let dates :Dates[] = []
      // for (let f of this.timesheetType.selectedDates) {
      //   this.date = new Dates()
      //   this.date.date = f
      //   dates.push(this.date)
      // }
      // for(let f of this.projectTask)
      // {
      //   f.dates = dates;
      // }

      this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
      this.service_getTimesheetDetails(this.input_custId);
    }, error => {
      this._util.serviceError(error);
    });
  }
  service_getCalendarWeeks(timesheetType: TimesheetTypeModel) {
    this.freez(true);
    this._appservice.GetCalendarDateRange(timesheetType).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
      this.freez(false);
      this.service_getTimesheetDetails(this.input_custId);
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });
  }
  service_UpdateTimesheetDetails(timeSheetData: TimesheetProjectModel[], successMessage) {
    this.freez(true);
    this._appservice.UpdateTimesheetDetailsMonthly(timeSheetData).subscribe(data => {
      this.LoadData();
      alert(successMessage);
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
  service_GetProjectTasks(taskId: string) {
    this._appservice.GetProjectTasks(taskId).subscribe(data => {
      this.projectTask = data;
    }, error => { this._util.serviceError(error); });
  }
}

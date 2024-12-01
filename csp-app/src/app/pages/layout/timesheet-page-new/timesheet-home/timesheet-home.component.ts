import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from '../../../../Shared/myUtility';
import { ProjectsModel } from '../../../../models/projects-model';
import { AppsService } from '../../../../Services/apps.service';
import { TimesheetTypeModel } from '../../../../models/date-range-model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TimesheetProjectEmpModel, TimesheetEmployeeModel, TimesheetModel, TimesheetProjectEmpModelGroupBydate, TimesheetForApproval } from '../../../../models/timesheet-model';
import { ServiceParams } from '../../../../models/report-model';
import { LayoutService } from '../../layout.service';
import { DateRangeModel } from '../../../../models/delivery-model';
import { DatePipe } from '@angular/common';
import { GroupByPipe, KeysPipe, PairsPipe, ValuesPipe, FilterByPipe } from "ngx-pipes";
import { MatDialog } from '@angular/material/dialog';
import { TimesheetDialogPopupComponent } from '../timesheet-dialog-popup/timesheet-dialog-popup.component';
import { callLifecycleHooksChildrenFirst } from '@angular/core/src/view/provider';
//import { ELEMENT_PROBE_PROVIDERS } from '@angular/platform-browser';

@Component({
  selector: 'app-timesheet-home',
  templateUrl: './timesheet-home.component.html',
  styleUrls: ['./timesheet-home.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [GroupByPipe, KeysPipe, PairsPipe, ValuesPipe, FilterByPipe]
})
export class TimesheetHomeComponent implements OnInit {
  private sub: any;
  input_custId: string;
  // @Input('customerId') input_custId: string;
  list: boolean = false;
  timePeriod: boolean = false;
  table: boolean = false;
  checked = false;
  dummyChecked = false;
  projects: ProjectsModel[] = [];
  timesheetType: TimesheetTypeModel = new TimesheetTypeModel();
  selectedProject: string[] = [];
  tmpSelectedDates: string[] = [];
  tmpSelectedDatesPerProject: string[] = [];
  dtRange: any[] = [];
  disablebtn: boolean = false;
  bProgress: boolean = false;
  timesheetsByTask: TimesheetProjectEmpModel[] = [];
  multipleProjectTimesheets_detailed: TimesheetProjectEmpModel[] = [];
  empGroup: TimesheetEmployeeModel[] = [];
  timGroup: TimesheetModel[] = [];
  timesheetForApproval: TimesheetProjectEmpModelGroupBydate[] = [];
  result: TimesheetForApproval[] = [];
  source: any[] = [];
  mainPageSource: any[] = [];
  expansionBlockSource: TimesheetModel[] = [];
  expansionBlockSourcePerProject: TimesheetModel[] = [];
  tableMonth: string = this._util.Month();
  tableYear: number = this._util.Year();
  dataForTable: any[];
  projDropdownChecked: boolean = false;
  datesTotal: number;
  dateHeader: string[];
  currentYear: number = new Date().getFullYear();
  monthAsText: string = new DatePipe('en-US').transform(new Date().getMonth(), 'MMMM');
  employeeSelected: string[] = [];
  columnsToDisplay = ['button', 'proJ_NM', 'displayName', 'totaL_EMPLOYEES', 'totaL_HOURS', 'checkbox'];
  expandedElement: TimesheetProjectEmpModelGroupBydate | null;
  comments: string;
  allProjectsSelected: boolean;
  someProjectsSelected: boolean;
  masterProjects: ProjectsModel[] = [];
  inProgress: boolean = false;
    days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  constructor(public dialog: MatDialog,
    public _util: myUtility,
    private filterByPipe: FilterByPipe,
    private groupByPipe: GroupByPipe,
    private keyPipe: KeysPipe,
    private valuePipe: ValuesPipe,
    private route: ActivatedRoute,
    private _appservice: AppsService,
    public _layoutService: LayoutService
  ) { }

  ngOnInit() {
    // this.input_custId = this._layoutService.selectedCust
    this.sub = this.route.params.subscribe(params => {
      this.input_custId = params['custid'];
      this._layoutService.selectedCust = this.input_custId;
    });

    if (new Date().getMonth() < 4)
      this.currentYear = this.currentYear - 1;

    this.LoadData();
    localStorage.setItem('navigateurl','');
  }
  ngOnChanges() {
    this.LoadData();
  }

  toggleList() {
    if (this.list) {
      this.list = false;
    }
    else {
      this.list = true;
    }
    this.timePeriod = false;
  }

  toggleTimePeriod() {
    if (this.timePeriod) {
      this.timePeriod = false;
    }
    else {
      this.timePeriod = true;
    }
    this.list = false;
  }

  toggleTable() {
    if (this.table) {
      this.table = false;
    }
    else {
      this.table = true;
    }
  }


  MovePreviousMonth() {
    let datePipe = new DatePipe('en-US');
    let date = datePipe.transform(this.monthAsText, 'MMM');
    let month = this._util.getMonthNum(date);
    month++;
    this.monthAsText = datePipe.transform(month, 'MMMM');
  }


  MoveNextMonth() {
    let datePipe = new DatePipe('en-US');
    let date = datePipe.transform(this.monthAsText, 'MMM');
    let month = this._util.getMonthNum(date);
    month--;
    this.monthAsText = datePipe.transform(month, 'MMMM');
  }

  MovePreviousYear() {
    this.currentYear--;
  }

  MoveNextYear() {
    this.currentYear++;
  }

  applyProjectFilter(filterValue: string) {
    this.projects = this.masterProjects.filter(p => p.proJ_NM.toLowerCase().includes(filterValue.toLowerCase()));
  }

  LoadData() {
    this.service_getTimesheetType();
    if (this.input_custId != undefined) {
      if (this._util.IsGAVS())
        this.service_getProjectNamesForEmployee(this.input_custId, localStorage.getItem('empid'));
      else
        this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));
    }
    this._appservice.ProcessPSARequests().subscribe(e=>{
     
    });
  }

  OnChangeProjectDropdown(e, project: ProjectsModel) {
    if (e.checked == true) {
      this.selectedProject.push(project.proJ_ID);
    }
    else if (e.checked == false) {
      let index = this.selectedProject.findIndex(i => i === project.proJ_ID);
      this.selectedProject.splice(index, 1);
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
    //this.freez(true);
    this._appservice.GetCalendarDateRangeForReports(timesheetType).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
      //this.tmpSelectedDates = this.timesheetType.selectedDates;
      //this.freez(false);
    }, error => {
      this._util.serviceError(error);
      //this.freez(false);
    });
  }

  service_getTimesheetForApproval(selectedDate: DateRangeModel) {
    this.freez(true);
    this.inProgress = true;
    let param: ServiceParams = new ServiceParams();
    param.paraM_NAME = "ProjectIds";
    let projList = [];
    projList.push(this.selectedProject);
    param.paraM_VALUE = projList;

    let dateVal = [];
    dateVal.push(selectedDate.startDate);
    dateVal.push(selectedDate.endDate);

    //this._appservice.GetTimesheetNewDetailsForApproval(this.input_custId, dateVal , param).subscribe(data => {
    this._appservice.GetTimesheetNewDetailsForApproval(this.input_custId, param).subscribe(data => {


      let tempExpansionSource: any[] = [];
      this.tmpSelectedDatesPerProject = [];
      this.dtRange = this.mapDateRange(data);
      this.mainPageSource = this.mapObject(data);
      this.tmpSelectedDates = this.mapSelectedDates(data);
      data.forEach(d => {
        d.multipleProjectTimesheets.forEach(element => {
          this.tmpSelectedDatesPerProject.push(d.tmpSelectedDates)
        });
      }
      );
      this.expansionBlockSource = this.mapExpansionObject(data);
      
      this.employeeSelected = [];


      // let sample;
      // sample = this.filterByPipe.transform(this.expansionBlockSource, ['proJ_ID'],"212P000006");
      // console.log(sample);
      // sample = this.groupByPipe.transform(sample, 'proJ_TASK');
      // console.log(sample);
      this.freez(false);
      this.inProgress = false;

    }, error => {
      this._util.serviceError(error);
      this.freez(false);
      this.inProgress = false;
    });

    this.service_refreshCalendarWeeks(this.timesheetType);
    this.list = false;
    this.allProjectsSelected = false;
    this.someProjectsSelected = false;
  }

  clearProjects() {
    if (!this.inProgress) {
      this.projects.forEach(proj => {
        if (this.selectedProject.includes(proj.proJ_ID)) {
          proj.checked = false;
        }
      });
      this.selectedProject.splice(0, this.selectedProject.length);
    }
  }

  isClockedMinsPresent(timesheets: any[], day) {
    const tempDate = day.split('-');
    const date = tempDate[2] + "-" + tempDate[1] + "-" + tempDate[0];
    return timesheets.findIndex(i => i.clndR_DATE === date);
  }

  getFirstIndex(timesheets: any[]) {
    return timesheets.findIndex(i => i !== undefined);
  }
  submitDetails(checked, projId, projTask, empId, displayName) {
    this.mainPageSource.forEach(d => {
      const totalEmpByTask = this
      if ((d[0].proJ_ID === projId || projId === 'all')
        && (d[0].displayName === displayName || displayName === 'all')) {
        d[0].employees.forEach(emp => {
          if (emp.emP_ID === empId || empId === 'all') {
            emp.selected = checked;
            if (checked) {
              if (projTask !== 'all') {
                emp.selectedTimesheet.push(...this.filterByPipe.transform(emp.timesheet, ['proJ_TASK'], projTask));
              } else {
                emp.selectedTimesheet.push(...emp.timesheet);
              }
            } else {
              if (projId === 'all' && displayName === 'all' && empId === 'all' && projTask === 'all') {
                if (!this.allProjectsSelected) {
                  emp.selectedTimesheet.forEach(t => t.selected = false);
                  emp.selectedTimesheet = [];
                }
              }
              else if (empId === 'all') {
                emp.selectedTimesheet.forEach(t => t.selected = false);
                emp.selectedTimesheet = [];
              } else {
                if (emp.emP_ID === empId) {
                  for (var i = emp.selectedTimesheet.length - 1; i >= 0; i--) {
                    if (emp.selectedTimesheet[i].proJ_TASK === projTask) {
                      emp.selectedTimesheet.selected = false;
                      emp.selectedTimesheet.splice(i, 1);
                    }
                  }
                }
              }
            }
            emp.selectedTimesheet.forEach(t => {
              t.selected = true;
            });
          }
        })
      }
      if (projId === 'all' && displayName === 'all' && empId === 'all' && projTask === 'all') {
        d[0].checked = this.allProjectsSelected;
        d[0].selected = this.allProjectsSelected;
        if (!this.allProjectsSelected) {
          this.employeeSelected = [];
        }
      } else {
        d[0].checked = d[0].employees.every(t => t.timesheet.every(x => x.selected));
        d[0].selected = d[0].employees.some(t => t.timesheet.some(x => x.selected));
      }
    })
    this.allProjectsSelected = this.mainPageSource.every(t => t[0].checked);
    this.someProjectsSelected = this.mainPageSource.some(t => t[0].selected);

  }

  onSendForApproval() {
    this.freez(true);
    this.inProgress = true;
    let projects: TimesheetProjectEmpModelGroupBydate[] = [];
    // let mProjTimesheet: TimesheetProjectEmpModel[] = [];
    this.mainPageSource.forEach((proj, index) => {
      let filteredEmployees = proj[0].employees.filter(t => t.selectedTimesheet.length > 0);
      filteredEmployees.forEach(employee => {
        let total = 0;
        employee.selected = true;
        
          employee.STATUS = 'FOR APPROVAL';
        employee.selectedTimesheet.forEach(timesheet => {
          if(timesheet.timE_ENTRY_STATUS == 'FOR REVIEW')
          {
            timesheet.timE_ENTRY_STATUS = 'FOR APPROVAL';
             timesheet.TIME_ENTRY_STATUS = 'FOR APPROVAL';
          }
          timesheet.OTHER_DETAILS = '';
          timesheet.APPRL_DATE = new Date();
          timesheet.REJECT_DATE = '';
          timesheet.REJECT_DESC = '';

          if (timesheet.clockeD_MINS) {
            total += timesheet.clockeD_MINS;
          }
        });
        employee.timesheet = employee.selectedTimesheet;
        employee.total = total;
      });
      if (filteredEmployees.length > 0) {
        proj[0].employees = filteredEmployees;
        let obj = new TimesheetProjectEmpModelGroupBydate();
        obj.dtrange.startDate = this.dtRange[index].startDate;
        obj.dtrange.endDate = this.dtRange[index].endDate;
        obj.multipleProjectTimesheets.push(proj[0]);
        obj.tmpSelectedDates = null;
        obj.bAllChecked = proj[0].bAllChecked;
        projects.push(obj);
      }
    });
    this.timesheetType.period = 0;

    this._appservice.UpdateMultipleProjectTimesheetsMultipleRange(this.timesheetType.period, projects).subscribe(data => {
      this.freez(false);
      const dialogRef = this.dialog.open(TimesheetDialogPopupComponent, {
        width: '500px',
        height: '200px',
        data: {
          showApprovedMsg: true,
          comments: 'Timesheets has been Sent for Approval Succesfully'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.service_getTimesheetForApproval(this.timesheetType.selectedDateRange);
        this.inProgress = false;
      })
    }, error => {
      this.freez(false);

      this.inProgress = false;
      this._util.serviceError(error);
    });
    this.list = false;
  }


  onApprove() {
    this.freez(true);
    this.inProgress = true;
    let projects: TimesheetProjectEmpModelGroupBydate[] = [];
    // let mProjTimesheet: TimesheetProjectEmpModel[] = [];
    this.mainPageSource.forEach((proj, index) => {
      let filteredEmployees = proj[0].employees.filter(t => t.selectedTimesheet.length > 0);
      filteredEmployees.forEach(employee => {
        let total = 0;
        employee.selected = true;
        
          employee.STATUS = 'APPROVED';
          employee.selectedTimesheet.forEach(timesheet => {
          if(timesheet.timE_ENTRY_STATUS == 'FOR APPROVAL')
          { 
                timesheet.timE_ENTRY_STATUS == 'APPROVED'
                timesheet.TIME_ENTRY_STATUS = 'APPROVED';
          }
          timesheet.OTHER_DETAILS = '';
          timesheet.APPRL_DATE = new Date();
          timesheet.REJECT_DATE = '';
          timesheet.REJECT_DESC = '';

          if (timesheet.clockeD_MINS) {
            total += timesheet.clockeD_MINS;
          }
        });
        employee.timesheet = employee.selectedTimesheet;
        employee.total = total;
      });
      if (filteredEmployees.length > 0) {
        proj[0].employees = filteredEmployees;
        let obj = new TimesheetProjectEmpModelGroupBydate();
        obj.dtrange.startDate = this.dtRange[index].startDate;
        obj.dtrange.endDate = this.dtRange[index].endDate;
        obj.multipleProjectTimesheets.push(proj[0]);
        obj.tmpSelectedDates = null;
        obj.bAllChecked = proj[0].bAllChecked;
        projects.push(obj);
      }
    });
    this.timesheetType.period = 0;

    this._appservice.ApproveOrRejectMultipleProjectTimesheetsNew(this.timesheetType.period, projects).subscribe(data => {
      this.freez(false);
      const dialogRef = this.dialog.open(TimesheetDialogPopupComponent, {
        width: '500px',
        height: '200px',
        data: {
          showApprovedMsg: true,
          comments: 'Timesheets has been Approved Succesfully'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.service_getTimesheetForApproval(this.timesheetType.selectedDateRange);
        this.inProgress = false;
      })
    }, error => {
      this.freez(false);

      this.inProgress = false;
      this._util.serviceError(error);
    });
    this.list = false;
  }

  onReject() {
    const dialogRef = this.dialog.open(TimesheetDialogPopupComponent, {
      width: '500px',
      height: '270px',
      data: { showComments: true, comments: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== 'back') {
        this.comments = result;
        this.freez(true);
        this.inProgress = true;
        let projects: TimesheetProjectEmpModelGroupBydate[] = [];
        // let mProjTimesheet: TimesheetProjectEmpModel[] = [];
        this.mainPageSource.forEach((proj, index) => {
          let filteredEmployees = proj[0].employees.filter(t => t.selectedTimesheet.length > 0);
          filteredEmployees.forEach(employee => {
            let total = 0;
            employee.selected = true;
            employee.STATUS = 'CUSTOMER REJECT';
            employee.selectedTimesheet.forEach(timesheet => {
              timesheet.TIME_ENTRY_STATUS = 'CUSTOMER REJECT';
              timesheet.timE_ENTRY_STATUS = 'CUSTOMER REJECT';

              timesheet.OTHER_DETAILS = '';
              timesheet.APPRL_DATE = '';
              timesheet.REJECT_DATE = new Date();
              timesheet.REJECT_DESC = this.comments;
              if (timesheet.clockeD_MINS) {
                total += timesheet.clockeD_MINS;
              }
            });
            employee.total = total;
            employee.rejecT_DESC = this.comments;
            employee.timesheet = employee.selectedTimesheet;
          });
          if (filteredEmployees.length > 0) {
            proj[0].employees = filteredEmployees;
            let obj = new TimesheetProjectEmpModelGroupBydate();
            obj.dtrange.startDate = this.dtRange[index].startDate;
            obj.dtrange.endDate = this.dtRange[index].endDate;
            obj.multipleProjectTimesheets.push(proj[0]);
            obj.tmpSelectedDates = null;
            obj.bAllChecked = proj[0].bAllChecked;
            projects.push(obj);
          }
        });
        this.timesheetType.period = 0;
        this._appservice.ApproveOrRejectMultipleProjectTimesheetsNew(this.timesheetType.period, projects).subscribe(data => {
          this.freez(false);
          const dialogRef = this.dialog.open(TimesheetDialogPopupComponent, {
            width: '500px',
            height: '200px',
            data: {
              showRejectedMsg: true,
              comments: 'Rejected Succesfully'
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            this.service_getTimesheetForApproval(this.timesheetType.selectedDateRange);
            this.inProgress = false;
          })
        }, error => {
          this.freez(false);

          this.inProgress = false;
          this._util.serviceError(error);
        });
      }
    });
    this.list = false;
  }

  addDays(theDate, days) {
    return new Date(theDate.getTime() + days*24*60*60*1000);
}

  bulkemail(){
   

    this.selectedProject.forEach(x=>{
      this._appservice.TimeSheetRemainderEmail(this.addDays(new Date(),-5), this.addDays(new Date(),2), this.input_custId.toString(),   x).subscribe(data => {  
       
        if(data != null){
          // let status = JSON.stringify(data);
          // this.freez(false);
  
          // if(status == "true"){
          //   alert("Reminder Mail Sent Successfully!");
          // }
          // else{
          //   alert("Reminder Mail Not sent");
          // }        
        }                
      }, error => {  
        this.freez(false);
  
      });
    });
     alert("Reminder Mails has been initiated for the selected Project(s) for those who haven't submitted timesheet.");
     
   
  }

  mapDateRange(data: any[]) {
    const rows = [];
    data.map(res => {
      for (let i = 0; i < res.multipleProjectTimesheets.length; i++) {
        rows.push(res.dtrange);
      }
    }
    );
    return rows;
  }

  mapObject(data: any[]) {
    const rows = [];
    data.map(res => res.multipleProjectTimesheets.forEach(m => {
      let temp = [];
      m.checked = false;
      temp.push(m);
      rows.push(temp);
    }));
    return rows;
  }

  mapExpansionObject(data: any[]) {
    const rows = [];
    //data.map(res => res.multipleProjectTimesheets.forEach(e => e.employees.forEach(t => t.timesheet.forEach(r => rows.push(r))))); 
    console.log(data);
    data.forEach(d => d.multipleProjectTimesheets.forEach(m => m.employees.forEach(e => {
      this.timGroup = [];
      let timesheets = e.timesheet;
      d.tmpSelectedDates.forEach((day, index) => {
        const tempDate = day.split('-');
        const date = tempDate[2] + "-" + tempDate[1] + "-" + tempDate[0];

        let timesheetByDay = timesheets.filter(timesheet => timesheet.clndR_DATE === date);
        // if (timesheetByDay.length === 0) {
        //   let timesheet = new TimesheetModel();
        //   timesheet.clockeD_MINS = 0;
        //   timesheet.timE_ENTRY_STATUS = "FOR APPROVAL";
        //   timesheet.proJ_ID = m.proJ_ID;
        //   timesheet.frsT_NM = e.frsT_NM;
        //   timesheet.displayName = m.displayName;
        //   timesheet.employee = e;
        //   this.timGroup[index] = timesheet;
        // } else {
        if (timesheetByDay.length > 0) {
          timesheetByDay[0].selected = false;
          timesheetByDay[0].displayName = m.displayName;
          timesheetByDay.forEach(t => t.displayName = m.displayName);
          this.timGroup.push(...timesheetByDay);
        }
        else  
        {
          //timesheetByDay = new { displayName = m.displayName};

        }
        // }
      })
      e.selectedTimesheet = [];
      e.timesheet = this.timGroup;
      e.timesheet.forEach(t => rows.push(t));
    })))
    return rows;
  }

  mapSelectedDates(data: any[]) {
    const rows = [];
    data.map(res => res.tmpSelectedDates.forEach(t => rows.push(t)));
    return rows;
  }

  // mapExpansionObject(data: any[])
  // {
  //   const rows = [];
  //   data.forEach(d => d.multipleProjectTimesheets.forEach(h => h.employees.forEach(e => {
  //     this.timGroup = [];
  //     let timesheets = e.timesheet;
  //     this.tmpSelectedDates.forEach((day, index) => {        
  //       const timesheetByDay = timesheets.filter(timesheet => timesheet.clndR_DATE === day);
  //       if (timesheetByDay.length === 0) {
  //         let timesheet = new TimesheetModel();
  //         timesheet.clockeD_MINS = 0;
  //         timesheet.timE_ENTRY_STATUS = "FOR APPROVAL";
  //         this.timGroup[index] = timesheet;
  //       } else {
  //        this.timGroup[index] = timesheetByDay[0];
  //       }
  //     })
  //     e.timesheet = this.timGroup;
  //     rows.push(...e.timesheet);
  //   })))
  //   return rows;
  // }

  filterSource() {

  }

  service_getTimesheetType() {
    this._appservice.GetTimesheetType(this.input_custId).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
      //this.tmpSelectedDates = this.timesheetType.selectedDates;
    }, error => {
      this._util.serviceError(error);
    });
  }

  service_getProjectNamesForEmployee(custid, empid) {
    this._appservice.GetCustomerProjectsNameWithCustNM(custid, empid).subscribe(data => {
      this.projects = data;
      this.masterProjects = data;
      this.projects.forEach(d => {
        d.checked = true;
        this.selectedProject.push(d.proJ_ID);
      });
         //bring timesheets
         this.service_getTimesheetForApproval(this.timesheetType.selectedDateRange);
    }, error => {
      this._util.serviceError(error);
    });
  }

  service_getProjectNamesForCustomer(custid, emailid) {
    this._appservice.GetCustomerProjectsNameForClient(custid, emailid).subscribe(data => {
      this.projects = data;
      this.masterProjects = data;
      this.projects.forEach(d => {
        d.checked = true;
        this.selectedProject.push(d.proJ_ID);
      });
      //bring timesheets
      this.service_getTimesheetForApproval(this.timesheetType.selectedDateRange);
      //console.log(this.selectedProject);
    }, error => {
      this._util.serviceError(error);
    });
  }

  getTotalDays(dates: string[]) {
    return dates.length + 1;
  }

  
  getDateValue(d: string)
  { 
   
    var tempDate = d.split('-');
     var date = tempDate[2].toString() + "-" + tempDate[1].toString() + "-" + tempDate[0].toString();
 
    var dd = new Date(date);
    var day = this.days[dd.getDay()];
    if(day!=undefined)
    return tempDate[1] +" " + tempDate[2] +" " + day;
    else 
    return tempDate[1] +" " + tempDate[2];
  }


  GetBackgroundByDay(d) {
    try{ 
    let datePipe = new DatePipe('en-US');
    d = datePipe.transform(d, 'EEE');
    if (d.toLowerCase().includes('sun') || d.toLowerCase().includes('sat')) {
      return "#f8c875";
    }
    else {
      return "#96abdf";
    }
  }
  catch(e)
  {
    //console.log(e);
    return "#96abdf";
  }
  }

  GetBackground(e) {
    if (e.timE_ENTRY_STATUS === "APPROVED") {
      return this._util.ColorShaders.ApprovedShade;
    }
    else if (e.timE_ENTRY_STATUS === "REJECTED") {
      return this._util.ColorShaders.RejectedShade;
    }
    else if (e.timE_ENTRY_STATUS === "FOR REVIEW") {
      return this._util.ColorShaders.ReviewShade;
    }
    else if (e.timE_ENTRY_STATUS === "FOR APPROVAL") {
      return this._util.ColorShaders.ApprovalShade;
    }
  }

  freez(bool: boolean) {
    this.disablebtn = bool;
    this.bProgress = bool;
  }
}



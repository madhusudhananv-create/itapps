import { AfterViewInit, Component, OnInit, ContentChild, ElementRef, ViewChild } from '@angular/core';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { TimesheetModel, TimesheetProjectModel, TimesheetProjectEmpModel, TimesheetEmployeeModel, Total } from '../../../../../app/models/timesheet-model';
import { Input } from '@angular/core';
import { ProjectsModel } from '../../../../models/projects-model';
import { DateRangeModel, TimesheetTypeModel } from '../../../../models/date-range-model';
//import { MatRangeDatepickerModule, MatRangeNativeDateModule, MatDatepickerModule } from "mat-range-datepicker";
import { enumDateRange } from '../../../../Shared/enum';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatFormField, MatDatepickerInputEvent, MatDatepicker } from '@angular/material';
import { element } from 'protractor';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { GroupByPipe, KeysPipe, PairsPipe, ValuesPipe } from "ngx-pipes";
import { DatePipe } from '@angular/common';
// import * as jspdf from 'jspdf';
// import html2canvas from 'html2canvas';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../../layout.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-timesheet-reports-home',
  templateUrl: './timesheet-reports-home.component.html',
  styleUrls: ['./timesheet-reports-home.component.scss'],
  animations: [
    trigger('divState', [
      state('show', style({ height: '100vh', width: '20vw' })),
      state('hide', style({ height: '0vh', display: 'none' })),
      transition('show => hide', animate('200ms ease-out')),
      transition('hide => show', animate('300ms ease-in'))
    ])
  ],
  providers: [GroupByPipe, KeysPipe, PairsPipe, ValuesPipe]
})
export class TimesheetReportsHomeComponent implements OnInit {
  private sub: any;
  input_custId: string;
  //@Input('customerId') input_custId: string;
  timesheetType: TimesheetTypeModel = new TimesheetTypeModel();
  bHideDetails: string = "hidden";
  iconHideDetails: string = ">";
  projects: ProjectsModel[] = [];
  masterProjects: ProjectsModel[] = [];
  allProjects = null;
  selectedProject: ProjectsModel = new ProjectsModel();
  boolflag: boolean = false;
  reviewflag: boolean = false;
  projectTimesheets: TimesheetProjectEmpModel = new TimesheetProjectEmpModel();
  multipleProjectTimesheets: TimesheetProjectEmpModel[] = [];
  timesheetsByTask: TimesheetProjectEmpModel[] = [];
  multipleProjectTimesheets_filtered: TimesheetProjectEmpModel[] = [];
  multipleProjectTimesheets_detailed: TimesheetProjectEmpModel[] = [];
  empGroup: TimesheetEmployeeModel[] = [];
  summaryData: TimesheetEmployeeModel[] = [];
  masterTotal: Total[] = [];
  masterDetailedTotal: Total[] = [];
  timGroup: TimesheetModel[] = [];
  tableMonth: string = this._util.Month();
  tableYear: number = this._util.Year();
  startDate: Date;
  fromMinDate: Date;
  endDate: Date;
  disablebtn: boolean = false;
  bProgress: boolean = false;
  comments: string = "";
  selectedReportType = "summary";
  tmpSelectedDates: string[] = [];
  datesTotal: number;
  divState: string = "hide";
  filterActive: boolean;
  showingSelectedDateRange: string;
  @ViewChild('SUMMARY') summaryTable: ElementRef;
  @ViewChild('DETAILED') detailedTable: ElementRef;
  @ViewChild('PDF') pdfGen: ElementRef;
  @ViewChild('DROPDOWN') dropdown: ElementRef;
  totalHours: number;
  totalInHrs: number;
  groupedByDesc: any[];
  groupedByEmpId: any[];
  totalByGroup: number[];
  toMaxDate: Date = new Date();
  selectedStartDate: Date;
  selectedEndDate: Date;
  toMinDate: Date;
  fromMaxDate: Date = new Date();
  pdfData: TimesheetEmployeeModel[] = [];
  filteredProjectLength: number;
  searchEmployeeSummary: string;
  searchEmployeeDetailed: string;
  summaryResult: boolean = false;
  summaryFilterResult: boolean = false;
  detailedResult: boolean = false;
  detailedFilterResult: boolean = false;
  selectedDateExcel: string;
  todaysDate: string;
  totalPersonHours: number[];

  constructor(public _util: myUtility,
    private route: ActivatedRoute,
    private _appservice: AppsService,
    public _layoutService: LayoutService,
    private groupByPipe: GroupByPipe,
    private keyPipe: KeysPipe,
    private valuePipe: ValuesPipe,
    private pairPipe: PairsPipe) { }

  ngOnInit() {
    const date = new Date();
    this.fromMinDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 60);

    this.sub = this.route.params.subscribe(params => {
      this.input_custId = params['custid'];
      this._layoutService.selectedCust = this.input_custId;
    });
    //this.input_custId = this._layoutService.selectedCust

    this.LoadData();

  }
  ngOnChanges() {
    this.LoadData();
  }

  onStartDateSelected(event: MatDatepickerInputEvent<Date>) {
    // this.selectedStartDate = event;
    const date = new Date(event.value);
    this.toMinDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.shownList = false;
  }

  onEndDateSelected(event: MatDatepickerInputEvent<Date>) {
    const date = new Date(event.value);
    this.fromMaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.shownList = false;
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

  getClockedMins(e){
      if(e.proJ_TASK_ID === 1)
          return e.clockeD_MINS;
      else if(e.proJ_TASK_ID===3 || e.proJ_TASK_ID ===5)
          return e.clockeD_MINS;
      else 
        return "-";

  }


  GetBackground(e) {
    // if (e.clndR_DATE_DAY === "Sun" || e.clndR_DATE_DAY === "Sat")
    //     return this._util.ColorShaders.WhiteWeekEndShade; 
    if (e.timE_ENTRY_STATUS === "APPROVED") {
      return this._util.ColorShaders.ApprovedShade;
    }
    else if (e.timE_ENTRY_STATUS === "CUSTOMER REJECT") {
      return this._util.ColorShaders.RejectedShade;
    }
    else if (e.timE_ENTRY_STATUS === "FOR REVIEW") {
      return this._util.ColorShaders.ReviewShade;
    }
    else if (e.timE_ENTRY_STATUS === "FOR APPROVAL") {
      return this._util.ColorShaders.ApprovalShade;
    }
    // if (entry.clndR_DAY_NAME === "Sun" || entry.clndR_DAY_NAME === "Sat")
    //   return this._util.ColorShaders.WeekEndShade;
    // if (entry.proJ_TASK_ID === 3)
    //   return this._util.ColorShaders.LeaveShade;
    // else if (entry.proJ_TASK_ID === 5)
    //   return this._util.ColorShaders.HolidayShade;
  }

  GetBackgroundByDay(d) {
    let datePipe = new DatePipe('en-US');
    d = datePipe.transform(d, 'EEE');
    if (d.toLowerCase().includes('sun') || d.toLowerCase().includes('sat')) {
      return "#f8c875";
    }
    else {
      return "#96abdf";
    }
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






  GetTimesheetData() {
    this.searchEmployeeSummary = "";
    this.searchEmployeeDetailed = "";
    if (this.selectedProject === undefined || this.selectedProject.proJ_NM == undefined) {
      alert("Please select a project");
    }
    else {
      let datePipe = new DatePipe('en-US');

      let st = new Date(Date.UTC(this.tableYear, parseInt(datePipe.transform(this.startDate, 'M')) - 1, parseInt(datePipe.transform(this.startDate, 'd')), 0, 0, 0));
      let ed = new Date(Date.UTC(this.tableYear, parseInt(datePipe.transform(this.endDate, 'M')) - 1, parseInt(datePipe.transform(this.endDate, 'd')), 0, 0, 0));

      let dateDiff = ed.getTime() - st.getTime();
      let diffDays = dateDiff / (1000 * 3600 * 24);
      diffDays = diffDays + 1;
      if (diffDays > 60) {
        alert("Please select a Date Range within 60 Days");
        return;
      }

      this.timesheetType.selectedDateRange.startDate = new Date(Date.UTC(this.tableYear, parseInt(datePipe.transform(this.startDate, 'M')) - 1, parseInt(datePipe.transform(this.startDate, 'd')), 0, 0, 0));
      this.timesheetType.selectedDateRange.endDate = new Date(Date.UTC(this.tableYear, parseInt(datePipe.transform(this.endDate, 'M')) - 1, parseInt(datePipe.transform(this.endDate, 'd')), 0, 0, 0));
      this.timesheetType.period = 3;
      this.service_refreshCalendarWeeks(this.timesheetType);
      this.service_getTimesheetDetails(this.selectedProject.proJ_ID, this.timesheetType.period);
      
      if (this.input_custId != undefined) {
        if (this._util.IsGAVS())
          this.service_getProjectNamesForEmployee(this.input_custId, localStorage.getItem('empid'));
        else
          this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));
      }

    }
  }

  closeProjectSelection()
  {
    this.shownList = false;
  }

  applyProjectFilter(filterValue: string) {
    this.projects = this.masterProjects.filter(p => p.proJ_NM.toLowerCase().includes(filterValue.toLowerCase()));
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

  applyFilterForSummary(filterValue: string) {
    this.searchEmployeeSummary = filterValue;
    this.multipleProjectTimesheets_detailed = this._util.CopyObject(this.timesheetsByTask);

    for (let proj of this.multipleProjectTimesheets_detailed) {
      proj.employees = proj.employees.filter
        (item => Object.keys(item).some(k => item[k] != null && item[k].toString().toLowerCase().includes(filterValue.toLowerCase())));
    }
    this.multipleProjectTimesheets_detailed = this.multipleProjectTimesheets_detailed.filter(t => t.employees.length > 0);
    this.getTimesheetForSummary(this.multipleProjectTimesheets_detailed, true);
    if (this.summaryData.length == 0) {
      this.summaryFilterResult = true;
    }
    else {
      this.summaryFilterResult = false;
    }
  }

  applyFilterForDetailed(filterValue: string) {
    this.searchEmployeeDetailed = filterValue;
    this.multipleProjectTimesheets_detailed = this._util.CopyObject(this.timesheetsByTask);

    for (let proj of this.multipleProjectTimesheets_detailed) {
      proj.employees = proj.employees.filter
        (item => Object.keys(item).some(k => item[k] != null && item[k].toString().toLowerCase().includes(filterValue.toLowerCase())));
    }
    this.multipleProjectTimesheets_detailed = this.multipleProjectTimesheets_detailed.filter(t => t.employees.length > 0);
    this.getTimesheetForGrouping(this.multipleProjectTimesheets_detailed, this.tmpSelectedDates);
    if (this.empGroup.length == 0) {
      this.detailedFilterResult = true;
    }
    else {
      this.detailedFilterResult = false;
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
  service_getProjectNamesForEmployee(custid, empid) {
    this._appservice.GetCustomerProjectsNameWithCustNM(custid, empid).subscribe(data => {
      this.masterProjects = data;
      this.projects = this.masterProjects;
    }, error => {
      this._util.serviceError(error);
    });
  }

  GetProjectAll() {
    let proj: ProjectsModel = new ProjectsModel();
    return proj;
  }
  service_getTimesheetType() {
    this._appservice.GetTimesheetType(this.input_custId).subscribe(data => {
      this.timesheetType = data;
      this.timesheetType.selectedDateRange = data.dateRange.filter(t => t.current == true)[0];
    }, error => {
      this._util.serviceError(error);
    });
  }

  service_getProjectNamesForCustomer(custid, emailid) {
    this._appservice.GetCustomerProjectsNameForClient(custid, emailid).subscribe(data => {
      this.masterProjects = data;
      this.projects = this.masterProjects;
    }, error => {
      this._util.serviceError(error);
    });
  }


  service_getTimesheetDetails(projid, periodType) {
    this.freez(true);
    // let st = new Date(this.timesheetType.selectedDateRange.startDate).toDateString();
    // let ed = new Date(this.timesheetType.selectedDateRange.endDate).toDateString();
    let arr: string[] = this.timesheetType.selectedDateRange.displayName.split(' ');
    let datePipe = new DatePipe('en-US');
    let st = datePipe.transform(this.startDate, 'yyyy-MMM-dd');//arr[0];
    let ed = datePipe.transform(this.endDate, 'yyyy-MMM-dd');//arr[2];
    //let st = arr[0];
    //let ed = arr[2];
    this.selectedDateExcel = datePipe.transform(this.startDate, 'dd-MMM-yyyy') + ' - ' + datePipe.transform(this.endDate, 'dd-MMM-yyyy');
    this.todaysDate = datePipe.transform(new Date(), 'dd-MMM-yyyy');
    this._appservice.GetTimesheetReportByProjectId(projid, periodType, st, ed, '').subscribe(data => {
      this.multipleProjectTimesheets = [];
      this.multipleProjectTimesheets.push(...data);
      this.multipleProjectTimesheets_filtered = this._util.CopyObject(this.multipleProjectTimesheets);
      this.freez(false);
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });

    this._appservice.GetTimesheetDetailedReportByTask(projid, periodType, st, ed, '').subscribe(data => {

      this.timesheetsByTask = [];
      this.timesheetsByTask.push(...data);
      this.multipleProjectTimesheets_detailed = this._util.CopyObject(this.timesheetsByTask);
      this.tmpSelectedDates = this.timesheetType.selectedDates;
      this.getDayandTotalHours(this.multipleProjectTimesheets_detailed,datePipe.transform(st, 'dd-MMM'), datePipe.transform(ed, 'dd-MMM'));
      this.getTimesheetForSummary(this.multipleProjectTimesheets_detailed, false);
      this.getTimesheetForGrouping(this.multipleProjectTimesheets_detailed, this.tmpSelectedDates);
      this.getTimesheetForPDF(this.multipleProjectTimesheets_detailed);
      if (this.summaryData.length > 0) {
        this.summaryResult = false;
      }
      else {
        this.summaryResult = true;
      }
      this.summaryFilterResult = false;

      if (this.empGroup.length > 0) {
        this.detailedResult = false;
      }
      else {
        this.detailedResult = true;
      }
      this.detailedFilterResult = false;

      this.freez(false);
    }, error => {
      this._util.serviceError(error);
      this.freez(false);
    });


  }

  private getDayandTotalHours(data: TimesheetProjectEmpModel[],st: string, ed: string) {
    let datePipe = new DatePipe('en-US');    
    this.showingSelectedDateRange = datePipe.transform(st, 'dd MMMM') + ' - ' + datePipe.transform(ed, 'dd MMMM');
    let total = 0;
    data.forEach(element => {
      element.employees.forEach(employee => {
        total += employee.total;
      });
    });
    this.totalHours = total;
  }

  // getTimesheetGruopedByType(){     
  //   this.multipleProjectTimesheets_filtered.forEach(element => {
  //     element.employees.forEach(employee =>{
  //         this.timesheetEmployee.push(employee)
  //     });
  //   }

  //   // result = this.timesheetEmployee.reduce(function (r,a){
  //   //   r[a.timesheet.t]
  //   // })    
  // }
  getTotalDays(dates: string[]) {
    return dates.length + 1;
  }

  getTimesheetForSummary(data: TimesheetProjectEmpModel[], filter: boolean) {
    this.summaryData = [];
    data.forEach(h => h.employees.forEach(e => this.summaryData.push(e)));

    // console.log(this.summaryData);
    if (!filter) {
      this.masterTotal = [];
      let groupedPersonHours = this.groupByPipe.transform(this.summaryData, 'tasK_NAME');
      let groupedPersonHoursByKey = this.keyPipe.transform(groupedPersonHours);
      let personHoursByValue = this.valuePipe.transform(groupedPersonHours);
      
      //let temp = {'taskName':string}[];
      groupedPersonHoursByKey.forEach( (key,index) => {
        this.masterTotal[index] = new Total();
        this.masterTotal[index].taskName = key;
        let total = 0;
        personHoursByValue[index].forEach(d => {
            total += d.forapprovaL_TOTAL + d.forrevieW_TOTAL + d.rejecteD_TOTAL + d.approveD_TOTAL;
        })
        this.masterTotal[index].total = total;
      })
    }  
  }

  getMasterTotalByTaskname(taskname: string){
    let total = this.masterTotal.filter(t => t.taskName===taskname);
    if(total !== undefined){
      return total[0].total;
    }
  }

  getTimesheetForGrouping(data: TimesheetProjectEmpModel[], dates: string[]) {
    this.empGroup = [];
    this.tmpSelectedDates = dates;
    this.datesTotal = this.tmpSelectedDates.length;
    data.forEach(h => h.employees.forEach(e => this.empGroup.push(e)));    
    data.forEach(h => h.employees.forEach(e => {
      this.timGroup = [];
      let timesheets = e.timesheet;
      this.tmpSelectedDates.forEach((day, index) => {
        const timesheetByDay = timesheets.filter(timesheet => timesheet.clndR_DATE.toString() === day);
        if (timesheetByDay.length === 0) {
          let timesheet = new TimesheetModel();
          timesheet.clockeD_MINS = 0;
          timesheet.timE_ENTRY_STATUS = "APPROVED";
          this.timGroup[index] = timesheet;
        } else {
          this.timGroup[index] = timesheetByDay[0];
        }
      })
      e.timesheet = this.timGroup;
    }
    ));

    // if (!filter) {
    //   this.masterDetailedTotal = [];
    //   let groupedTotalHours = this.groupByPipe.transform(this.empGroup, 'tasK_NAME');
    //   let groupedTotalHoursByKey = this.keyPipe.transform(groupedTotalHours);
    //   let totalHoursByValue = this.valuePipe.transform(groupedTotalHoursByKey);

    //   groupedTotalHoursByKey.forEach( (key,index) => {
    //     this.masterDetailedTotal[index] = new Total();
    //     this.masterDetailedTotal[index].taskName = key;
    //     let total = 0;
    //     totalHoursByValue[index].forEach(d => {
    //         total += d.forapprovaL_TOTAL + d.forrevieW_TOTAL + d.rejecteD_TOTAL + d.approveD_TOTAL;
    //     })
    //     this.masterDetailedTotal[index].total = total;
    //   })
    // }
    //this.groupedByEmpId = this.groupByPipe.transform(this.timesheetGroup,'emP_ID'); 
    // let groupByTaskType = this.keyPipe.transform(this.groupedByDesc);
    // groupByTaskType.forEach(d => this.groupedByDesc.d);
  }

  getTimesheetForPDF(data: TimesheetProjectEmpModel[]) {
    this.pdfData = [];
    data.forEach(e => e.employees.forEach(t => this.pdfData.push(t)));
    //let groupedByDate = this.groupByPipe.transform(()), 'clndR_DATE');

  }


  freez(bool: boolean) {
    this.disablebtn = bool;
    this.bProgress = bool;
  }

  ExportTOExcel() {
    let datePipe = new DatePipe('en-US');
    let name = this.selectedProject.proJ_NM + '_' + datePipe.transform(this.startDate, 'dd-MMM-yyyy') + '-' + datePipe.transform(this.endDate, 'dd-MMM-yyyy') + '_' + this.selectedReportType;
    if (this.selectedReportType == 'summary') {
      this._util.exportToExcel(this.summaryTable.nativeElement, name)
    }
    else if (this.selectedReportType == 'detailed') {
      console.log(this.detailedTable.nativeElement);
      this._util.exportToExcel(this.detailedTable.nativeElement, name)
    }
  }

  generatePdf() {
    const documentDefinition = this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).open();
  }

  getDocumentDefinition() {
    return {
      content: [{
        columns: [
          {
            text: 'Project Name: ' + this.selectedProject.proJ_NM,
            alignment: 'left'
          },
          {
            text: 'Timesheet Date: ' + this.timesheetType.selectedDateRange.displayName,
            alignment: 'bottom'
          },
          { text: 'Total Productive Hours: ' + this.totalHours }
        ]
      }]
    };
  }

  generatejsPdf() {
    var data = document.getElementById('pdf1');  //Id of the table
    // html2canvas(data).then(canvas => {
    //   // Few necessary setting options  
    //   let imgWidth = 208;
    //   let pageHeight = 295;
    //   let imgHeight = canvas.height * imgWidth / canvas.width;
    //   let heightLeft = imgHeight;

    //   const contentDataURL = canvas.toDataURL('image/png')
    //   let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
    //   let position = 0;
    //   pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
    //   pdf.save('MYPdf.pdf'); // Generated PDF   
    // });

  }

  shownList = false;

  toggleList() {
    if (this.shownList) {
      this.shownList = false;
    } else {
      this.shownList = true;
    }

    if (this.input_custId != undefined) {
      if (this._util.IsGAVS())
        this.service_getProjectNamesForEmployee(this.input_custId, localStorage.getItem('empid'));
      else
        this.service_getProjectNamesForCustomer(this.input_custId, localStorage.getItem('empid'));
    }
  };

  showComment = false;
  toggleComment() {
    if (this.showComment) {
      this.showComment = false;
    }
    else {
      this.showComment = true;
    }
  }

}

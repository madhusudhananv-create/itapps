import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuditExecutionModel } from '../../../models/audit-execution-model';
import { AuditReportComponent } from './audit-report/audit-report.component';
import { MatDialogConfig, MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { ProcessModelTestsNew, TestViewModel } from '../../../models/process-sqa-model';
import { forEach } from '@angular/router/src/utils/collection';
import { element } from 'protractor';
import { filter, map } from 'rxjs/operators';
import { ServiceAreaModelNew } from './../../../models/audit-checklist-based-model';

export interface customer {
  value: number;
  viewValue: string;
}

export interface project {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-audit-execution',
  templateUrl: './audit-execution.component.html',
  styleUrls: ['./audit-execution.component.scss']
})
export class AuditExecutionComponent implements OnInit {
  isEvaluated1: boolean;
  res: boolean[] = [];
  testName: TestViewModel;
  @Output() onChange: EventEmitter<number[]> = new EventEmitter<number[]>();
  custId: string;
  projId: string;
  index: number;
  auditCheck: AuditExecutionModel = new AuditExecutionModel();
  auditResults: AuditExecutionModel[] = [];
  updateMode: boolean = true;
  enableDiv: boolean = false;
  selectedStructure: any;
  showSideStructure: boolean = false;
  selectedDate: any
  testData: any;
  ddData: any;
  isEvaluated: boolean;
  auditDataTitle: any;
  count: number = 0;
  auditeesList: any;
  auditDataRetrieved: any[] = [];
  complianceStatus: any;
  savedAudits: any;
  complianceStatusNCType: any;
  selectedActions: any[] = [];
  auditorList: any
  auditExecutionReport: any
  cnt: number = 0;
  selectedProcessModel: number[] = [];
  selectedServiceArea: number[] = [];
  showStructure: boolean = false;
  disableControl: boolean = false;
  auditData: any = [];
  auditDataTemp: AuditExecutionModel[] = [];
  startDate: Date;
  endDate: Date;
  selectedAuditees: number[]
  auditSummaryData: any;
  selectedAuditor: number
  plannedAudits: any[];
  showAuditInputs: boolean = false;
  IsSavedAuditsLoaded: boolean = false;
  IsCompletedAudit: boolean = false;
  selectedServiceAreas: number[] = [];
  disableInput: boolean = false;
  serviceAreaList: ServiceAreaModelNew[] = [];
  viewInprogress: boolean = false;
  viewCompleted: boolean = false;
  selectedAuditData: any;
  selectedTestFilter: string = "All";
  originaltests: any;
  displayedColumns = ["index", "title", "description", "status", "action"];
  @ViewChild('paginator') paginator: MatPaginator;
  dataSource: MatTableDataSource<TestViewModel>;
  constructor(private _appService: AppsService, private _util: myUtility, private _http: HttpClient, public dialog: MatDialog) { }

  ngOnInit() {
    this.Service_GetServiceAreaList();
    this.getDropDownParams();
  }

  getCustProjInfo(event) {
    let Obj = JSON.parse(event);
    this.custId = Obj.customer;
    this.projId = Obj.project;
    this.auditDataTitle = undefined;
    this.selectedAuditor = undefined;
    this.selectedAuditees = [];
    this.startDate = undefined;
    this.endDate = undefined;
    this.showAuditInputs = false;
    this.auditData = [];
    this._appService.getAuditeeDetails(this.custId, this.projId).subscribe(data => this.auditeesList = data);
    this.Service_GetPlannedAudits(this.custId, this.projId);
    // this.Audit(this.custId, this.projId);
  }

  refreshTable(dataSource) {
    this.dataSource = new MatTableDataSource(dataSource);
    this.dataSource.paginator = this.paginator;
  }

  Service_GetServiceAreaList() {
    this._appService.getServiceAreaList().subscribe(data => {
      this.serviceAreaList = data;
    },
      (error) => { this._util.serviceError(error) })
  }

  // project_onChange($event) {
  //   let obj: any = JSON.parse($event);
  //   this.custId = obj.customer;
  //   this.projId = obj.project;
  //   this.enableDiv = true;
  //   this.selectedProcessModel = [];
  //   this.selectedServiceArea = [];
  //   this.auditData = [];
  //   this.getModelandServiceAreaDD(this.custId, this.projId);
  //   this.GetAuditexecutionsforProject()
  //   this.getEmployeeListFromproject();
  //   this.showSideStructure = false;
  //   this.showStructure = false;
  //   this.auditDataRetrieved = []
  // }

  // ngOnChanges()
  // {
  //   this.getEmployeeListFromproject();
  // }
  GetAuditAssesment(i, title, startdate, enddate, auditorname, auditessname, serviceareas, status) {
    this.plannedAudits.forEach(function (element, index) {
      if (index != i)
        element.iS_CHECKED = false;
      else
        element.iS_CHECKED = true;
    });

    this.showSideStructure = false;
    this.selectedTestFilter = "All";

    if (status == 'COMPLETED') {
      this.IsCompletedAudit = true;
      this.disableInput = true;
      this.disableControl = true;
      this.viewCompleted = true;
      this.viewInprogress = false;
    }
    else {
      this.IsCompletedAudit = false;
      this.disableInput = true;
      this.disableControl = false;
      this.viewCompleted = false;
      this.viewInprogress = true;
    }

    this.selectedAuditor = +auditorname;
    this.selectedAuditees = auditessname.map(x => +x);
    this.startDate = startdate;
    this.endDate = enddate;
    this.auditDataTitle = title;
    this.auditData = undefined;
    this.selectedServiceAreas = serviceareas.map(x => +x);
    this.Service_getTestsAuditData(this.custId, this.projId, serviceareas, title, startdate, enddate, auditorname, auditessname, status);
  }

  // Service_GetAuditDetailsForAudit(title, startdate, enddate, auditorname, auditessname)
  // {
  //   this._appService.getAuditDetails(this.custId, this.projId, title, startdate, enddate, auditorname, auditessname).subscribe(
  //     data => {
  //       this.auditData = data;
  //       console.log("planned audit data", this.auditData);
  //       if(this.auditData.length == 0)
  //         this.fillAuditData();
  //     }
  //   )
  // }


  Service_GetPlannedAudits(custid, projid) {
    this.IsSavedAuditsLoaded = false;
    this._appService.getPlannedAudits(custid, projid).subscribe(data => {
      this.plannedAudits = data;
      if (this.plannedAudits.length > 0)
        this.IsSavedAuditsLoaded = true;
      console.log("planned", this.plannedAudits);
    } , (error) => { this._util.serviceError(error) })
  }

  //.subscribe(
  //   data => {
  //     this.auditeesList = data;
  //     this.Audit(this.selectedCustomer, this.selectedProject);
  //   }
  //   ,
  //   error => { this._util.serviceError(error); }
  // )

  // getModelandServiceAreaDD(custId, projId) {
  //   this._appService.getProcessModelandServiceAreaDD(custId, projId).subscribe(
  //     data => {
  //       this.selectedProcessModel = data.projecT_MODEL;
  //       this.selectedServiceArea = data.projecT_SERVICE_AREA;
  //       this.getProcessTests(this.custId, this.projId)
  //     }
  //     ,
  //     error => { this._util.serviceError(error); }
  //   )
  // }
  saveAuditorName() {
    this.auditData.forEach(element => {
      element.auditoR_NAME = this.selectedAuditor;
    });
  }

  saveAuditeeName() {
    this.auditData.forEach(element => {
      element.auditeE_NAME = this.selectedAuditees;
    });
  }
  // GetAuditDataProject(list: AuditExecutionModel[]) {
  //   this.fillAuditData();
  //   this.selectedAuditor = list[0].auditoR_NAME;
  //   this.selectedAuditees = list[0].auditeE_NAME
  //   this.auditDataTitle = list[0].audiT_TITLE
  //   this.startDate = list[0].audiT_START_DATE
  //   this.endDate = list[0].audiT_END_DATE
  //   let i;
  //   for (i = 0; i < this.auditData.length; i++) {
  //     let b = list.find(t => t.tesT_ID == this.auditData[i].tesT_ID)
  //     if (b != undefined) {
  //       this.auditData[i] = b;
  //       this.auditData.forEach(element => {
  //         element.auditeE_NAME = b.auditeE_NAME
  //         element.auditoR_NAME = b.auditoR_NAME
  //         element.audiT_TITLE = b.audiT_TITLE
  //         element.audiT_START_DATE = b.audiT_START_DATE
  //         element.audiT_END_DATE = b.audiT_END_DATE
  //       });
  //     }
  //   }
  //   //this.auditData = list;
  //   this.updateMode = false;
  //   // this.startDate = this.auditData[0].audiT_START_DATE;
  //   // this.endDate = this.auditData[0].audiT_END_DATE;
  //   this.showSideStructure = true;
  //   // this.auditDataTitle = this.auditData[0].audiT_TITLE;
  //   this.index = 0;
  // }
  getDropDownParams() {
    this.service_getDropDownDataForAudit()
  }

  fillAuditData() {
    this.tests.forEach((element, index) => {
      this.auditData[index] = new AuditExecutionModel()
      this.auditData[index].customeR_ID = this.custId;
      this.auditData[index].projecT_ID = this.projId;
      this.auditData[index].tesT_ID = element.id;
      this.auditData[index].audiT_START_DATE = this.getStDate(this.startDate);
      this.auditData[index].audiT_END_DATE = this.getEnDate(this.endDate);
      this.auditData[index].audiT_TITLE = this.auditDataTitle;
      this.auditData[index].auditoR_NAME = this.selectedAuditor;
      this.auditData[index].auditeE_NAME = this.selectedAuditees;
    });

  }

  CheckStatusOfTests() {
    this._appService.getTestsStatus(this.custId, this.projId, this.tests).subscribe(data => {
      this.auditResults = data;
      // this.tests.forEach((element, index) =>
      // {
      //   if(this.auditResults.some(x => x.tesT_ID == element.id))
      //     this.res[index] = true;
      //   else
      //     this.res[index] = false;
      // });
    }, error => { this._util.serviceError(error); });
  }


  // changeSelectedServiceArea(event) {
  //   this.getModelandServiceAreaDD(this.custId, this.projId);
  // }
  // changeSelectedModel(event) {
  //   this.getModelandServiceAreaDD(this.custId, this.projId);
  // }
  getStructure(st) {
    this.showStructure = true;
    this.selectedStructure = this.testData[st];
    //  this.showSideStructure = true;
  }
  hideStructure() {
    this.showStructure = false;
    // this.showSideStructure = false;
  }
  getSeverity(auditData: AuditExecutionModel) {
    console.log(auditData.statuS_OF_CONTROL);
    if (auditData.statuS_OF_CONTROL == this.ddData.statuS_CONTROLS[1]) {
      auditData.severity = "High";
      auditData.findinG_TYPE = "noncompliantmajor";
    }
    else if (auditData.statuS_OF_CONTROL == this.ddData.statuS_CONTROLS[0]) {
      auditData.severity = "Low";
      auditData.findinG_TYPE = "compliant";
    }

    else if (auditData.statuS_OF_CONTROL == this.ddData.statuS_CONTROLS[3]) {
      auditData.severity = "Critical";
      auditData.findinG_TYPE = "noncompliantmajor";
    }
    else {
      auditData.severity = "Medium"
      auditData.findinG_TYPE = "noncompliantminor"
    }

  }

  CloseEditMode_OnClick() {
    this.showSideStructure = false;
  }
  // showSideDiv(i, div) {
  //   this.index = i;

  //   if (this.index != this.cnt) {
  //     if (this.checkIsValid(this.auditData[this.cnt])) {
  //      this.SaveAuditExecDetails(this.cnt, 'save')
  //        this.getStructure(this.index)
  //     }
  //     else {
  //       this.getStructure(this.index)
  //       this.showSideStructure = true;
  //       this.disableControl = false;
  //     }
  //   }
  //   else {
  //     this.getStructure(this.index)
  //     this.showSideStructure = true;
  //     this.disableControl = false;
  //   }
  // }

  showSideDiv(i) {
    this.index = i;
    this.showSideStructure = true;
    this.cnt = i;
  }

  //   if (i > 0 && div == 'record') {
  //     this.SaveAuditExecDetails(i, 'save', st)
  //     this.disableControl = false;
  //   }


  //   this.getStructure(st)
  //   this.showSideStructure = true;
  //   if (div == 'record') {
  //     this.disableControl = false;
  //     this.auditData[i] = new AuditExecutionModel();
  //     this.auditData[i].customeR_ID = this.custId;
  //     this.auditData[i].projecT_ID = this.projId;
  //     this.auditData[i].tesT_ID = st.tesT_ID;
  //     this.auditData[i].audiT_START_DATE = this.getStDate(this.startDate);
  //     this.auditData[i].audiT_END_DATE = this.getEnDate(this.endDate);
  //     this.auditData[i].audiT_TITLE = this.auditDataTitle;
  //   }
  //   if (div == 'view')
  //     this.disableControl = true;
  //   else if (div == 'edit')
  //     this.disableControl = false;
  //   this.cnt = i;
  // }
  getStDate(stdate: Date) {
    stdate = new Date(stdate);
    let date: number = stdate.getDate();
    let month: number = stdate.getMonth();
    let year: number = stdate.getFullYear();
    let offset: number = stdate.getTimezoneOffset();
    let newDate: Date = new Date(year, month, date);
    newDate.setMinutes(newDate.getMinutes() - (offset))
    return newDate;
  }
  getEnDate(stdate: Date) {
    stdate = new Date(stdate);
    let date: number = stdate.getDate();
    let month: number = stdate.getMonth();
    let year: number = stdate.getFullYear();
    let offset: number = stdate.getTimezoneOffset();
    let newDate: Date = new Date(year, month, (date + 1));
    newDate.setMinutes(newDate.getMinutes() - (offset + 1))
    return newDate;
  }
  saveStartDate(sdate) {
    if (this.auditData.length > 0)
      this.auditData.forEach(element => {
        element.audiT_START_DATE = this.getStDate(this.startDate);;
      });
  }
  saveEndDate(sdate) {
    if (this.auditData.length > 0)
      this.auditData.forEach(element => {
        element.audiT_END_DATE = this.getEnDate(this.endDate);
      });
  }
  getAuditExecutionIdforAll(audiData) {
    if (this.auditData.length > 0)
      this.auditData.forEach(element => {
        element.audiT_EXECUTION_ID = audiData.audiT_EXECUTION_ID;
        element.audiT_TITLE = audiData.audiT_TITLE;
      });
  }
  saveAuditTitle() {
    this.auditData.forEach(element => {
      element.audiT_TITLE = this.auditDataTitle;
    });
  }
  SaveAuditExecDetails(status) {
    let flag: boolean = false;
    this.saveAuditeeName()
    this.saveAuditorName()
    this.saveAuditTitle()
    this.saveStartDate(this.startDate);
    this.saveEndDate(this.endDate);

    this.auditData.forEach(element => {
      element.statuS_OF_AUDIT = status;
    });

    this.auditData.forEach(x => {
      if (x.tesT_RESULT != undefined || x.statuS_OF_CONTROL != undefined)
        x.isevaluated = true;
      else
        x.isevaluated = false;
    });
    let isValid = true;
    if (this.auditData.find(x => x.isevaluated == true) == undefined)
      isValid = false;

    if (this.auditData != undefined && this.auditData.length > 0 && isValid) {
      for (let i = 0; i < this.auditData.length; i++) {
        if (this.checkIsValid(this.auditData[i]) == false) {
          alert("Enter all field values");
          flag = true;
          break;
        }
      }
      if (flag)
        return;
      else
        this.service_SaveAuditExecData(this.auditData);
    }
    else
      alert('Please evaluate Tests');
  }

  checkIsValid(auditData: AuditExecutionModel) {
    if (auditData.isevaluated) {
      if (auditData.audiT_START_DATE == undefined || auditData.audiT_END_DATE == undefined || auditData.findinG_TYPE == undefined || auditData.tesT_RESULT == undefined || auditData.statuS_OF_CONTROL == undefined || auditData.resulT_DESCRIPTION == undefined || this.auditDataTitle == undefined)
        return false;
      else
        return true;
    }
    return true;
  }

  changefindingType(result: AuditExecutionModel) {
    if (result.tesT_RESULT == 'Passed') {
      result.findinG_TYPE = "compliant"
      result.statuS_OF_CONTROL = "Implemented"
    }
  }

  SendReportToAuditee() {
    this.service_SendMailToAuditee();
  }

  checkIsEvaluated(auditData: AuditExecutionModel) {
    this._appService.checkIsEvaluated(auditData).subscribe(data => {
      this.isEvaluated = data;
    }, error => { this._util.serviceError(error); }
      , () => this.isEvaluated1 = this.isEvaluated);

    return this.isEvaluated1;
  }



  showPreviewPopup() {
    // if(this.projId == undefined || this.custId == undefined || this.startDate == undefined || this.endDate == undefined 
    //   || this.selectedAuditor == undefined || (this.selectedAuditees == undefined && this.selectedAuditees.length> 0) || this.auditDataTitle == undefined)
    //   {
    //     alert('Please enter all the data to preview Report');
    //     return;
    //   }
    const dialogConfig = new MatDialogConfig();
    let auditeeNames: string[] = this.auditeesList.filter(x => this.selectedAuditees.indexOf(x.emP_ID) > -1).map(y => y.frsT_NM);

    let dialogSendData = {
      'projecT_ID': this.projId,
      'customeR_ID': this.custId,
      'audiT_START_DATE': this.startDate,
      'audiT_END_DATE': this.endDate,
      'auditoR_NAME': this.ddData.auditoR_LIST.filter(x => x.emP_ID == this.selectedAuditor).map(y => y.frsT_NM),
      'auditeeS_NAME': auditeeNames.join(','),
      'audiT_TITLE': this.auditDataTitle
    }
    dialogConfig.autoFocus = true;
    dialogConfig.data = dialogSendData;
    dialogConfig.maxWidth = "80%"
    dialogConfig.height = "90%",
      dialogConfig.width = "75%"
    const dialogRef = this.dialog.open(AuditReportComponent, dialogConfig);
    dialogRef.updatePosition({ top: '25px' });
  }

  GetAuditexecutionsforProject() {
    this.service_getSavedAudits(this.custId, this.projId)
  }
  service_getSavedAudits(custId, projId) {
    this._appService.getSavedAudits(custId, projId).subscribe(data => {
      this.savedAudits = data;
    }, error => { this._util.serviceError(error); });
  }
  service_getDropDownDataForAudit() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    let apiuri: string = environment.webapiuri + 'GetDropDownParamsForAudit';
    this._http.get(apiuri, { headers: header })
      .subscribe(data => {
        this.ddData = data;
        this.auditorList = this.ddData.auditoR_LIST;
      }, error => { this._util.serviceError(error); });
  }
  service_SaveAuditExecData(auditData: AuditExecutionModel[]) {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empid': localStorage.getItem("empid") });
    let apiuri: string = environment.webapiuri + 'SaveAuditExecDetails';
    this._http.post(apiuri, auditData, { headers: header })
      .subscribe(data => {
        this.auditData = data;
        console.log("Audit Data", this.auditData);
        // this.getAuditExecutionIdforAll(data);
        //  this.GetAuditexecutionsforProject();
        this.showSideStructure = false;
        alert("Tests evaluated Sucessfully");
      },
        error => { this._util.serviceError(error); });
  }
  service_SendMailToAuditee() {
    let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
    let apiuri: string = environment.webapiuri + 'SendAuditExecutionMail'
    let data = {
      'customeR_ID': this.custId,
      'projecT_ID': this.projId,
      'audiT_START_DATE': this.getStDate(this.startDate),
      'auditoR_NAME': this.selectedAuditor,
      'auditeE_NAME': this.selectedAuditees,
      'audiT_TITLE': this.auditDataTitle
    };
    this._http.post(apiuri, data, { headers: header })
      .subscribe(data => {

      }, error => { this._util.serviceError(error); },
        () => { alert('Email Sent Successfully'); });
  }

  changeTestResult(auditdata: AuditExecutionModel) {
    if (auditdata.statuS_OF_CONTROL == "Implemented" || auditdata.statuS_OF_CONTROL == "Partially Implemented") {
      auditdata.tesT_RESULT = "Passed";
    }
    else if (auditdata.statuS_OF_CONTROL == "Not Implemented") {
      auditdata.tesT_RESULT = "Failed";
    }
    else if (auditdata.statuS_OF_CONTROL == "Not Yet") {
      auditdata.tesT_RESULT = "Pending";
    }
  }

  selectedCustomer: number;
  selectedProject: string;
  tests: TestViewModel[] = [];

  customerList: customer[] = [];
  projectList: project[] = [];

  // LoadTests_onClick()
  // {
  //   if(this.custId != undefined && this.projId != undefined ) 
  //   {
  //       if(this.auditeesList != undefined && this.auditorList != undefined && this.startDate != undefined && this.endDate!= undefined)
  //       {
  //         this.Audit(this.custId, this.projId);
  //       }
  //       else
  //       {
  //         alert('Please fill all the details');
  //       }
  //   }
  // }

  Service_getTestsAuditData(custid: string, projid: string, serviceareas: string[], title: string, startdate: Date, enddate: Date, auditorname: number, auditessname: number[], status: string) {
    this._appService.getAuditDetails(custid, projid, serviceareas, title, startdate, enddate, auditorname, auditessname).subscribe(
      data => {
        this.selectedAuditData = data;
        this.originaltests = data.testS_VIEW_MODELS;
        this.tests = data.testS_VIEW_MODELS;
        this.refreshTable(this.tests);
        this.auditData = data.audiT_DATA;
      }
      ,
      error => { this._util.serviceError(error); },
      () => {
      }
    )
  }

  filterTests() {
    let testIds;
    this.tests = this.originaltests;
    if (this.selectedTestFilter == "All")
      this.tests = this.originaltests;
    else {
      testIds = this.auditData.filter(x => x.tesT_RESULT == this.selectedTestFilter).map(x => x.tesT_ID);
      this.tests = this.tests.filter(x => testIds.indexOf(x.id) > -1);
    }

    this.refreshTable(this.tests);
  }

  getTestStatusForTestid(id) {
    return this.auditData.filter(x => x.tesT_ID == id).map(y => y.tesT_RESULT);
  }

}


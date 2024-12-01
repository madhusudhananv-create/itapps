import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialog, MatSelect } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerModel } from '../../../models/customer-model';
import { DashboardDetailsModel, SuccessGoalsScoresModel, SuccessGoalsScoresModelForAProject, TasksEventsSummary } from '../../../models/dashboard-details-model';
import { HighlightsModel } from '../../../models/highlights-model';
import { IssueModel } from '../../../models/issue-model';
import { PortfolioModel, ProjectModelNew } from '../../../models/portfolio-model';
import { RiskModel } from '../../../models/risk-model';
import { ChartsService } from '../../../Services/charts.service';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { myUtility } from '../../../Shared/myUtility';
import { SharedService } from '../../../Shared/shared.service';
import { DashboardService } from '../dashboard.service';
import { basepage } from '../../../Shared/basepage';
import { QSPOCPopupComponent } from '../qspoc-popup/qspoc-popup.component';
import { ProjectFileUploadComponent } from '../project-file-upload/project-file-upload.component';

@Component({
  selector: 'app-dashboard-customer-page2',
  templateUrl: './dashboard-customer-page2.component.html',
  styleUrls: ['./dashboard-customer-page2.component.scss']
})
export class DashboardCustomerPage2Component extends basepage implements OnInit {
  sMonth: string;
  iYear: number;
  cColor: string;
  vColor: string;
  pColor: string;
  qColor: string;
  projectHealthHigh: any[];
  projectHealthMed: any[];
  projectHealthLow: any[];
  healthScoresColor: any[];
  healthScoresOverall: any[];
  overallScore: string;
  performance: string;
  compliance: string;
  value: string;
  quality: string;
  ideasdata: any;
  projectforecast: any;
  actionItemData: any;
  empId: string;
  issueList: IssueModel[];
  progress: boolean = false;
  public customerid: string;
  reset: boolean = false;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  count: number = 0;
  legend: boolean = false;
  achievedValueForOverallScore: number;
  highlights: any;
  portid: number;


  projectList: ProjectModelNew[];
  isFindingsByTypeEmpty: boolean = false;
  //data2 = [];

  menuToggleStatus: boolean;
  tempScoresArray: SuccessGoalsScoresModel[];
  isFindingsByTimeEmpty: boolean = false;
  isFindingsByStageEmpty: boolean = false;

  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  dashboardDetails: DashboardDetailsModel[] = [];
  projectScores: SuccessGoalsScoresModel[] = [];
  successGoalScores: SuccessGoalsScoresModelForAProject[];
  portfolioList: PortfolioModel[] = []
  value2: number;
  value3: number;
  riskList: RiskModel[] = [];
  showFilter: boolean;

  showSuccessGoalFilter: boolean = false;
  showProdFilter: boolean = false;
  showQualityHelp: boolean = false;
  showPerformanceHelp: boolean = false;
  showValueHelp: boolean = false;
  showComplianceHelp: boolean = false;
  financialYearRange: string;

  //tableMonth : string;
  //tableYear : number;
  currentDate: Date = new Date();
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  notes: HighlightsModel[];
  noProjectFlag: boolean = false;
  isActionItemsEmpty: boolean = false;
  actionItemHigh: string;
  actionItemMedium: string;
  actionItemLow: string;

  isIssuesEmpty: boolean = false;
  issueHigh: string;
  issueMedium: string;
  issueLow: string;

  isAppreciationsEmpty: boolean = false;
  totalAppreciation: number;


  totalIssues: number;
  totalRisks: number;
  isRisksEmpty: boolean;
  riskHigh: string;
  riskMedium: string;
  riskLow: string;
  isProjectStatusEmpty: boolean;
  ideasCount: string;
  automationCount: string;
  innovationCount: string;
  improvementsCount: string;
  hoursSaved: string;
  effortSaved: string;
  portfolioIds: string;
  selectedPortfolio: number = 0;
  portfolioprojectMap: ProjectModelNew[];
  tasksEventsSummary: TasksEventsSummary[] = []
  eventTasksHighValues: TasksEventsSummary;
  eventTasksLowValues: TasksEventsSummary;
  eventTasksMediumValues: TasksEventsSummary;
  isTasksEventsEmpty: boolean = true;
  @ViewChild('mySel') projectSelect: MatSelect;


  totalactionitemTemp: number;
  sub: any;
  isAuditStatusEmpty: boolean = false;
  stagesDict = {
    'STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION': "Submitted",
    'STAGE_FINDING_CAP REVIEW': 'Review',
    'STAGE_FINDING_IMPLEMENT CAP': 'Implementation',
    'STAGE_FINDING_VERIFY CAP IMPLEMENTATION': 'Verification'
  }

  findingsByTimeDict = {
    'TIME_FINDING_WEEK1': '< Week1',
    'TIME_FINDING_WEEK2': '< Week2',
    'TIME_FINDING_WEEK3': '< Week3',
    'TIME_FINDING_WEEK4': '> Week4',
    'TIME_FINDING_REJECT': 'Reject'
  }
  showtooltip: boolean = false;
  findingdatatype: any[] = [];
  productScores: any[];
  engagementKPI: any[];
  tempScoresProdArray: any[] = [];
  isFrontier: boolean = false;
  @Input('portArray') portArray: any[] = [];
  @Input('projectArray') projArray: any[] = [];
  @Input('productArray') prodArray: any[] = [];
  constructor(public _dashboardUtil: DashboardService, private route: ActivatedRoute, private _router: Router, public _access: AccessControl, private _appservice: AppsService, public _util: myUtility, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public dialog: MatDialog,
    public _chartsService: ChartsService, private _shared: SharedService) {
    super();
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.customerid = params['customerid'];
      this.reset = params['reset'];
      this.isFrontier = this.customerid == "202100007";
    });

    if (this.reset == undefined)
      this.reset = true;

    //this.startTimer();
    //Customer's main page,
    let currentdate = new Date();
    let month = currentdate.getMonth();
    let year = this
    if (month >= 3)
      this.financialYearRange = currentdate.getFullYear().toString().substr(2) + '-' + (currentdate.getFullYear() + 1).toString().substr(2);
    else
      this.financialYearRange = (currentdate.getFullYear() - 1).toString().substr(2) + '-' + currentdate.getFullYear().toString().substr(2);
    this.service_getPortfolioDetails();
    if (this.customerid == undefined && this.customerid == null) {
      this.service_LoadCustomerByEmpId();
    } //Employee clicked customer card and got redirected to Customer Dashboard Page
    else if (this.customerid != undefined && this.customerid != null) {
      this.service_LoadCustomerByEmpIdByCustomerId(this.customerid);
      this.GetTasksEventsSummary(this.customerid, localStorage.getItem('empid'));
    }
  }
  ngOnChanges() {

    this.filterProjectList1();
    this.applyFilter();
  }


  auditsbystatus: any[];



  resetValues() {
    this._shared.selectedPortfolios = [];
    this._shared.selectedProjects = [];
  }

  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  changKPIflag() {
    this._appservice.KpiCalledFromNewDashboard = true;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  //Timer --------------------------
  timeLeft: number = 60;
  interval;
  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
      else {
        this.timeLeft = 60;
        this.service_GetDashboardDetails(this.customerid);
      }
    }, 1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }
  //Timer --------------------------
  fillerNav = Array(50).fill(0).map((_, i) => `Nav Item ${i + 1}`);


  closeNav() {
    // console.log("popupName");
    this.showSuccessGoalFilter = false;
  }
  closeProdNav() {
    // console.log("popupName");
    this.showProdFilter = false;
  }

  closePopup(popupName: string) {
    //console.log(popupName);
    if (popupName == "QualityHelp")
      this.showQualityHelp = false;
    if (popupName == "PerformanceHelp")
      this.showPerformanceHelp = false;
    if (popupName == "ValueHelp")
      this.showValueHelp = false;
    if (popupName == "ComplianceHelp")
      this.showComplianceHelp = false;
  }


  IsPremier() {
    return this._util.IsPremier(this.customerid);
    if (this.selectedCustomer.cusT_ID == "202100062")
      return true;
    else
      return false
  }
  Refresh_Onclick() {
    this.service_refreshDashboardDetails();
  }

  service_refreshDashboardDetails() {
    this.progress = true;
    this._appservice.RefreshDashboardDetails().subscribe(() => {
      this.progress = false;
      this.service_GetDashboardDetails(this.customerid);
    }, error => {
      this.progress = false;
      this._util.serviceError(error);
    });
  }

  service_getSuccessGoalScoresForProject(customerid) {
    this._appservice.GetSuccessGoalScoresForProject(customerid).subscribe(data => {
      this.projectScores = data;
    }, error => { this._util.serviceError(error); },
      () => {
        if (this.projectScores.length == 1) {
          this._util.GetCharts(this.projectScores[0].cusT_ID, this.projectScores[0].proJ_ID);
        }
      }
    );
  }


  getSelectedProjectsList(event) {
    this.projArray = event;
    this.applyFilter();
  }

  applyFilter() {
    this.filterProjectList1();
    this.filterActionItems1();
    this.filterIssues1();
    this.filterRisks1();
    // this.filterProjectStatus1();
    // this.filterIdeasAndInnovation1();
    // this.filterStaffingAndBillingSummary1();
    this.fillQAAuditStatus1();
    this.fillQAFindingsSummary1();
    this.fillQAFindingsByTime1();
    this.fillQAFindingsByStage1();
  }

  viewQSPOC(proJ_ID, proJ_NM):

    void {

    let dialog = this.dialog.open(QSPOCPopupComponent, {
      width: "60%",
      height: "80%",
      data: {
        custid: this.selectedCustomer.cusT_ID,
        projids: proJ_ID,
        custname: this.selectedCustomer.cusT_NM,
        projname: proJ_NM
      },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result == undefined) {
        return;
      }
      else {

      }
    });
  }

  UploadProjectFile(proJ_ID) {
    let dialog = this.dialog.open(ProjectFileUploadComponent, {
      width: "70%",
      height: "70%",
      data: {
        custid: this.selectedCustomer.cusT_ID,
        projids: proJ_ID,
      },
    });
    dialog.afterClosed().subscribe((result) => {

    });
  }

  fillQAFindingsByStage1() {
    let findingsTitle = [];
    // let result = ["STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION", "STAGE_FINDING_CAP REVIEW", "STAGE_FINDING_IMPLEMENT CAP", "STAGE_FINDING_VERIFY CAP IMPLEMENTATION"];
    let result = [];
    this.projArray.forEach(x => {
      findingsTitle = this.getTitlesByString('STAGE_FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);

    let valuesArray = [0];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projArray.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projArray[j]);
      }
    }

    var total = valuesArray.reduce((x, y) => {
      return x + y
    });
    if (total == 0)
      this.isFindingsByStageEmpty = true;
    else
      this.isFindingsByStageEmpty = false;

    this.findingdatastage = [];
    var title = "";
    for (let i = 0; i < result.length; i++) {
      // title = result[i].substr(13);
      // title = title.charAt(0) + title.substr(1).toLowerCase();
      title = this.stagesDict[result[i]];
      this.findingdatastage.push([title, valuesArray[i]]);
    }
  }

  fillQAFindingsByTime1() {
    let result = ["TIME_FINDING_WEEK1", "TIME_FINDING_WEEK2", "TIME_FINDING_WEEK3", "TIME_FINDING_WEEK4"];
    let valuesArray = [0];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projArray.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projArray[j]);
      }
    }
    let rejectcount: number = 0;

    for (let j = 0; j < this.projArray.length; j++) {
      rejectcount += this.getGraphValue_project('TIME_FINDING_REJECT', this.projArray[j]);
    }
    this.rejectfindingsCount = rejectcount.toString();

    var total = valuesArray.reduce((x, y) => {
      return x + y
    });
    if (total == 0)
      this.isFindingsByTimeEmpty = true;
    else
      this.isFindingsByTimeEmpty = false;

    this.findingdatatime = [];
    var title = "";
    for (let i = 0; i < result.length; i++) {
      // title = result[i].substr(13);
      // title = title.charAt(0) + title.substr(1).toLowerCase();
      title = this.findingsByTimeDict[result[i]];
      this.findingdatatime.push([title, valuesArray[i]]);
    }
  }

  fillQAFindingsSummary1() {
    let findingsTitle = [];
    let result = []
    this.projArray.forEach(x => {
      findingsTitle = this.getTitlesByString('FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);
    var valuesArray = [0];

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projArray.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projArray[j]);
      }
    }



    this.findingdata = [];
    var title = "";
    for (let i = 0; i < result.length; i++) {
      title = result[i].substr(8);
      title = title.charAt(0) + title.substr(1).toLowerCase();
      this.findingdata.push([title, valuesArray[i]]);
    }
    //console.log("findingdata:",this.findingdata);
    this.getChartVal();
    var total = valuesArray.reduce((x, y) => { return x + y });
    if (total == 0)
      this.isFindingsByTypeEmpty = true;
    else
      this.isFindingsByTypeEmpty = false;
  }

  fillQAAuditStatus1() {
    let planned = 0;
    let inprogress = 0;
    let completed = 0;
    let cancelled = 0;

    this.projArray.forEach(x => {
      planned = planned + this.getGraphValue_project('AUDIT_PLANNED', x);
      inprogress = inprogress + this.getGraphValue_project('AUDIT_IN PROGRESS', x);
      completed = completed + this.getGraphValue_project('AUDIT_COMPLETED', x);
      cancelled = cancelled + this.getGraphValue_project('AUDIT_CANCELLED', x);
    });

    if (planned + inprogress + completed + cancelled == 0) {
      this.isAuditStatusEmpty = true;
    }
    else {
      this.isAuditStatusEmpty = false;
      this.auditdata = [];
      this.auditdata.push(["Planned", planned]);
      this.auditdata.push(["In Progress", inprogress]);
      this.auditdata.push(["Completed", completed]);
      this.auditdata.push(["Cancelled", cancelled]);
    }
  }



  filterProjectList1() {
    this.projectScores = this.tempScoresArray;
    if (this.projArray.length > 0 && this.projectScores != undefined)
      this.projectScores = this.projectScores.filter(f => this.projArray.includes(f.proJ_ID));
  }


  filterActionItems1() {
    if (this.projArray.length == 0) {
      this.fillGraphActionsItemsCircleDonoughtChart();
      return;
    }
    this.totalActionItems = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    this.projArray.forEach(x => {
      data1 = data1 + this.getGraphValue_project('PAST_DUE_DATE', x);
      data2 = data2 + this.getGraphValue_project('DUE_FOR_CLOSURE', x);
      high = high + this.getGraphValue_project('ACTION_ITEM_HIGH', x);
      medium = medium + this.getGraphValue_project('ACTION_ITEM_MEDIUM', x);
      low = low + this.getGraphValue_project('ACTION_ITEM_LOW', x);
    });

    this.totalActionItems = data1 + data2;

    if (this.totalActionItems == 0)
      this.isActionItemsEmpty = true;
    else
      this.isActionItemsEmpty = false;

    this.data6 = [];
    this.data6.push(["Due for closure", data2]);
    this.data6.push(["Past due date", data1]);
    this.data6.push([null, this.totalActionItems]);

    this.actionItemHigh = high.toString();
    this.actionItemMedium = medium.toString();
    this.actionItemLow = low.toString();
  }

  filterIssues1() {
    if (this.projArray.length == 0) {
      this.fillGraphIssuesCircleDonoughtChart();
      return;
    }
    this.totalIssues = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    this.projArray.forEach(x => {
      data1 = data1 + this.getGraphValue_project('ISSUES_PAST_DUE_DATE', x);
      data2 = data2 + this.getGraphValue_project('ISSUES_DUE_FOR_CLOSURE', x);
      high = high + this.getGraphValue_project('ISSUES_HIGH', x);
      medium = medium + this.getGraphValue_project('ISSUES_MEDIUM', x);
      low = low + this.getGraphValue_project('ISSUES_LOW', x);
    });

    this.totalIssues = data1 + data2;

    if (this.totalIssues == 0)
      this.isIssuesEmpty = true;
    else
      this.isIssuesEmpty = false;

    this.dataI = [];
    this.dataI.push(["Due for closure", data2]);
    this.dataI.push(["Past due date", data1]);
    this.dataI.push([null, this.totalIssues]);

    this.issueHigh = high.toString();
    this.issueMedium = medium.toString();
    this.issueLow = low.toString();
  }

  filterRisks1() {
    if (this.projArray.length == 0) {
      this.fillGraphRisksCircleDonoughtChart();
      return;
    }

    this.totalRisks = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    this.projArray.forEach(x => {
      data1 = data1 + this.getGraphValue_project('RISKS_PAST_DUE_DATE', x);
      data2 = data2 + this.getGraphValue_project('RISKS_DUE_FOR_CLOSURE', x);
      high = high + this.getGraphValue_project('RISKS_HIGH', x);
      medium = medium + this.getGraphValue_project('RISKS_MEDIUM', x);
      low = low + this.getGraphValue_project('RISKS_LOW', x);
    });

    this.totalRisks = data1 + data2;

    if (this.totalRisks == 0)
      this.isRisksEmpty = true;
    else
      this.isRisksEmpty = false;

    this.dataR = [];
    this.dataR.push(["Due for closure", data2]);
    this.dataR.push(["Past due date", data1]);
    this.dataR.push([null, this.totalRisks]);

    this.riskHigh = high.toString();
    this.riskMedium = medium.toString();
    this.riskLow = low.toString();
  }


  filterPortfolioWise(portfolioid: number) {
    //console.log(portfolioid);
    this._shared.savedportfolioId = portfolioid;
    this.filterProjectList(portfolioid);
    this.filterActionItems(portfolioid);
    this.filterIssues(portfolioid);
    this.filterRisks(portfolioid);
    // this.filterProjectStatus(portfolioid);
    // this.filterIdeasAndInnovation(portfolioid);
    // this.filterStaffingAndBillingSummary(portfolioid);
  }

  filterProjectList(id) {
    if (id == 0)
      this.projectScores = this.tempScoresArray;
    else if (this.tempScoresArray != null || this.tempScoresArray != undefined) {
      this.projectScores = this.tempScoresArray.filter(x => x.portfoliO_ID == id);

      if (this.projectScores.length == 0)
        this.noProjectFlag = true;
    }
  }

  IsProjectEmpty() {
    return this.noProjectFlag == true
  }

  filterActionItems(id) {
    if (id != 0) {
      let data1 = this.getGraphValue_portfolio('DUE_FOR_CLOSURE', id);
      let data2 = this.getGraphValue_portfolio('PAST_DUE_DATE', id);
      this.data6 = [];
      this.data6.push(["Due for closure", data1]);
      this.data6.push(["Past due date", data2]);
      this.totalActionItems = data1 + data2;
      if (this.totalActionItems == 0)
        this.isActionItemsEmpty = true;
      else
        this.isActionItemsEmpty = false;
      this.data6.push([null, this.totalActionItems]);

      this.actionItemHigh = this.getGraphValue_portfolio('ACTION_ITEM_HIGH', id).toString();
      this.actionItemMedium = this.getGraphValue_portfolio('ACTION_ITEM_MEDIUM', id).toString();
      this.actionItemLow = this.getGraphValue_portfolio('ACTION_ITEM_LOW', id).toString();
    }
    else {
      this.fillGraphActionsItemsCircleDonoughtChart();
    }

  }

  filterIssues(id) {
    if (id != 0) {
      this.dataI = [];
      let data1 = this.getGraphValue_portfolio('ISSUES_DUE_FOR_CLOSURE', id);
      let data2 = this.getGraphValue_portfolio('ISSUES_PAST_DUE_DATE', id);

      this.dataI.push(["Due for closure", data1]);
      this.dataI.push(["Past due date", data2]);
      this.totalIssues = data1 + data2;

      if (this.totalIssues == 0)
        this.isIssuesEmpty = true;
      else
        this.isIssuesEmpty = false;

      this.dataI.push([null, this.totalIssues]);
      this.issueHigh = this.getGraphValue_portfolio('ISSUES_HIGH', id).toString();
      this.issueMedium = this.getGraphValue_portfolio('ISSUES_MEDIUM', id).toString();
      this.issueLow = this.getGraphValue_portfolio('ISSUES_LOW', id).toString();
    }
    else {
      this.fillGraphIssuesCircleDonoughtChart();
    }
  }

  filterRisks(id) {
    if (id != 0) {
      this.dataR = [];
      let data1 = this.getGraphValue_portfolio('RISKS_DUE_FOR_CLOSURE', id);
      let data2 = this.getGraphValue_portfolio('RISKS_PAST_DUE_DATE', id);
      this.dataR.push(["Due for closure", data1]);
      this.dataR.push(["Past due date", data2]);
      this.totalRisks = data1 + data2;
      if (this.totalRisks == 0)
        this.isRisksEmpty = true;
      else
        this.isRisksEmpty = false;

      this.dataR.push([null, this.totalRisks]);
      this.riskHigh = this.getGraphValue_portfolio('RISKS_HIGH', id).toString();
      this.riskMedium = this.getGraphValue_portfolio('RISKS_MEDIUM', id).toString();
      this.riskLow = this.getGraphValue_portfolio('RISKS_LOW', id).toString();
    }
    else {
      this.fillGraphRisksCircleDonoughtChart();
    }
  }

  // filterProjectStatus(id) {
  //   if (id != 0) {
  //     this.data5 = [];
  //     let data1 = this.getGraphValue_portfolio('PROJECT_TO_START', id);
  //     let data2 = this.getGraphValue_portfolio('PROJECT_TO_END', id);
  //     this.data5.push(["Projects to start", data1]);
  //     this.data5.push(["Projects to end", data2]);
  //     this.totalProjects = data1 + data2;
  //     this.isProjectStatusEmpty = this.totalProjects == 0 ? true : false;
  //     this.data5.push([null, this.totalProjects]);
  //   }
  //   else {
  //     this.fillGraphProjectStatusSemicircleDonoughtChart();
  //   }
  // }

  // filterIdeasAndInnovation(id) {
  //   if (id != 0) {
  //     this.data1 = [];
  //     this.data1.push([
  //       "Completed",
  //       this.getGraphValue_portfolio('IDEAS_COMPLETED', id),
  //       this.getGraphValue_portfolio('IDEAS_COMPLETED', id),
  //       '#3ab376'
  //     ]);
  //     this.data1.push([
  //       "In Progress",
  //       this.getGraphValue_portfolio('IDEAS_INPROGRESS', id),
  //       this.getGraphValue_portfolio('IDEAS_INPROGRESS', id),
  //       '#ff6f00'
  //     ]);

  //     this.ideasCount = this.getTitleByPortfolio('IDEAS', id);
  //     this.automationCount = this.getTitleByPortfolio('IDEAS_AUTOMATIONS', id);
  //     this.innovationCount = this.getTitleByPortfolio('IDEAS_INNOVATIONS', id);
  //     this.improvementsCount = this.getTitleByPortfolio('IDEAS_IMPROVEMENTS', id);
  //     this.hoursSaved = this.getTitleByPortfolio('IDEAS_HOURS', id);
  //     this.effortSaved = this.getTitleByPortfolio('IDEAS_DOLLARS', id);
  //   }
  //   else {
  //     this.fillGraphIdeasColumn();
  //   }
  // }

  // filterStaffingAndBillingSummary(id) {
  //   if (id != 0) {
  //     this.data2 = [];
  //     this.data2.push(["Offshore", this.getGraphValue_portfolio('OFFSHORE_TOTAL', id)]);
  //     this.data2.push(["Onsite", this.getGraphValue_portfolio('ONSITE_TOTAL', id)]);

  //     this.data3 = [];
  //     this.data3.push([
  //       "Non-Billable",
  //       this.getGraphValue_portfolio('ONSITE_NON_BILLABLE', id),
  //       this.getGraphValue_portfolio('ONSITE_NON_BILLABLE', id),
  //       this.getGraphValue_portfolio('OFFSHORE_NON_BILLABLE', id),
  //       this.getGraphValue_portfolio('OFFSHORE_NON_BILLABLE', id)]);
  //     this.data3.push([
  //       "Billable",
  //       this.getGraphValue_portfolio('ONSITE_BILLABLE', id),
  //       this.getGraphValue_portfolio('ONSITE_BILLABLE', id),
  //       this.getGraphValue_portfolio('OFFSHORE_BILLABLE', id),
  //       this.getGraphValue_portfolio('OFFSHORE_BILLABLE', id)]);
  //   }
  //   else {
  //     this.fillGraphStaffSummaryPie();
  //     this.fillGraphBillingSummaryColumn();
  //   }
  // }

  service_getPortfolioDetails() {
    this._appservice.GetPortfolioList().subscribe(data => {
      this.portfolioList = data;
    }, error => { this._util.serviceError(error); });
  }
  service_LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        //this.selectedCustomer = this.customerList[0];
        this.customerid = this.customerList[0].cusT_ID;
        this.service_GetDashboardDetails(this.customerid);
        this.loadSuccessGoalForPeriod(this.reset);
      }
    });
  }
  service_LoadCustomerByEmpIdByCustomerId(customerid) {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
        this.customerid = this.selectedCustomer.cusT_ID;
      }

      this.service_GetDashboardDetails(customerid);
      this.loadSuccessGoalForPeriod(this.reset);
    }, error => { this._util.serviceError(error); });
  }

  // getHighlightsForCurrentMonth()
  // {
  //   let currentdate = new Date();
  //   let firstDayOfMonth = new Date(currentdate.getFullYear(), currentdate.getMonth(), 1).toDateString();
  //   console.log("month "+ firstDayOfMonth);
  //   this._util.GetHighlights(this.customerid, null,firstDayOfMonth);
  // }

  service_GetDashboardDetails(customerid) {
    this._appservice.GetDashboardDetailsbyCustomerId(customerid).subscribe(data => {
      this.dashboardDetails = data;

    }, error => {
      this._util.serviceError(error);
    }, () => {
      this.fillGraphDetails();
    });
  }
  getTitleByCustomer(title) {
    let content: string = '';

    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
      if (details.length > 0) {
        content = details[0].content;
      }
    }

    if (this.quality != undefined && title == "SUCCESS_GOAL_SCORE_QUALITY")
      content = this.quality;
    else if (this.performance != undefined && title == "SUCCESS_GOAL_SCORE_PERFORMANCE")
      content = this.performance;
    else if (this.value != undefined && title == "SUCCESS_GOAL_SCORE_VALUE")
      content = this.value;
    else if (this.compliance != undefined && title == "SUCCESS_GOAL_SCORE_COMPLIANCE")
      content = this.compliance;
    else if (this.overallScore != undefined && title == "SUCCESS_GOAL_SCORE")
      content = this.overallScore;

    return content;
  }
  getColorByCustomer(title) {
    let content: string = '';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
      if (details.length > 0) {
        content = details[0].color;
      }
    }

    if (this.qColor != undefined && title == "SUCCESS_GOAL_SCORE_QUALITY")
      content = this.qColor;
    if (this.pColor != undefined && title == "SUCCESS_GOAL_SCORE_PERFORMANCE")
      content = this.pColor;
    if (this.vColor != undefined && title == "SUCCESS_GOAL_SCORE_VALUE")
      content = this.vColor;
    if (this.cColor != undefined && title == "SUCCESS_GOAL_SCORE_COMPLIANCE")
      content = this.cColor;
    return content;
  }

  getTitleByProject(title, projid) {
    let content: string = '-';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == projid);
      if (details.length > 0) {
        content = details[0].content;
      }
    }

    return content;
  }

  getTitlesByString(string, projid) {
    var list = [];
    if (this.dashboardDetails != undefined) {
      list = this.dashboardDetails.filter((entry) => entry.title.startsWith(string) && entry.proJ_ID == projid).filter((x, i, a) => a.indexOf(x) == i).map(x => x.title);
    }

    return list;
  }



  getTitleByPortfolio(title, portfolio) {
    let content: string = '-';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.portfoliO_ID == portfolio);
      if (details.length > 0) {
        content = details[0].content;
      }
    }

    if (this.healthScoresOverall != undefined && title == "OVERALL_HEALTH") {
      content = this.healthScoresOverall.filter(x => x.portfoliO_ID == portfolio)[0].healtH_SCORE;
      return content;
      if (title == "OVERALL_HEALTH" && portfolio == 1)
        content = this.healthScoresOverall[0].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 2)
        content = this.healthScoresOverall[1].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 3)
        content = this.healthScoresOverall[2].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 4)
        content = this.healthScoresOverall[3].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 5)
        content = this.healthScoresOverall[4].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 6)
        content = this.healthScoresOverall[5].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 99)
        content = this.healthScoresOverall[6].healtH_SCORE;
    }
    return content;
  }
  // getColorByPortfolio(title, portfolio) {
  //   let content: string = '-';
  //   if (this.dashboardDetails != undefined) {
  //     let details: DashboardDetailsModel[] = [];
  //     details = this.dashboardDetails.filter(t => t.title == title && t.portfoliO_ID == portfolio);
  //     if (details.length > 0) {
  //       content = details[0].color;
  //     }
  //   }

  //   if (this.healthScoresColor != undefined) {
  //     content = this.healthScoresOverall.filter(x => x.portfoliO_ID == portfolio)[0].healtH_SCORE;
  //     return content;
  //     if (title == "OVERALL_HEALTH" && portfolio == 1)
  //       content = this.healthScoresColor[0].healtH_SCORE;
  //     else if (title == "OVERALL_HEALTH" && portfolio == 2)
  //       content = this.healthScoresColor[1].healtH_SCORE;
  //     else if (title == "OVERALL_HEALTH" && portfolio == 3)
  //       content = this.healthScoresColor[2].healtH_SCORE;
  //     else if (title == "OVERALL_HEALTH" && portfolio == 4)
  //       content = this.healthScoresColor[3].healtH_SCORE;
  //     else if (title == "OVERALL_HEALTH" && portfolio == 5)
  //       content = this.healthScoresColor[4].healtH_SCORE;
  //     else if (title == "OVERALL_HEALTH" && portfolio == 6)
  //       content = this.healthScoresColor[5].healtH_SCORE;
  //     else if (title == "OVERALL_HEALTH" && portfolio == 99)
  //       content = this.healthScoresColor[6].healtH_SCORE;
  //   }

  //   return content;
  // }
  btnApplyMultiProjects_OnClick() {
    this.reset = false;
    this.loadSuccessGoalForPeriod(this.reset);
  }
  btnApplySingleProject_OnClick() {
    this.reset = false;
    //  let d = "1-" + this._dashboardUtil.CSG_FilterMonth + "-" + this._dashboardUtil.CSG_FilterYear;
    // this._util.GetTable(this.selectedCustomer.cusT_ID, this.projectScores[0].proJ_ID, d);
    // this.GetTable(this.selectedCustomer.cusT_ID, this.projectScores[0].proJ_ID, d);
    this.loadSuccessGoalForPeriod(this.reset);
    this.showSuccessGoalFilter = false;
  }
  btnApplySingleProd_OnClick() {
    this.reset = false;
    this.loadSuccessGoalForPeriod(this.reset);
    this.showProdFilter = false;
  }
  loadSuccessGoalForPeriod(bLastUpdated: boolean) {
    this._appservice.getSuccessGoalScoreForAPeriod(this.customerid, this._dashboardUtil.csG_FILTER_MONTH, this._dashboardUtil.csG_FILTER_YEAR, bLastUpdated).subscribe(
      data => {
        this.projectScores = data.projecT_SCORES;
        this.tempScoresArray = data.projecT_SCORES;
        if (this.projArray != undefined && this.projArray.length > 0 && this.projectScores != null) {
          this.projectScores = this.projectScores.filter(f => this.projArray.includes(f.proJ_ID));
        }
        this.successGoalScores = data.succesS_GOALS_SCORES;
        this.overallScore = data.overalL_SCORE;
        this.quality = data.quality;
        this.value = data.value;
        this.performance = data.performance;
        this.compliance = data.compliance;
        this.healthScoresOverall = data.healtH_SCORES_OVERALL;
        this.healthScoresColor = data.healtH_SCORES_COLOR;
        this.projectHealthHigh = data.projecT_HEALTH_HIGH;
        this.projectHealthMed = data.projecT_HEALTH_MEDIUM;
        this.projectHealthLow = data.projecT_HEALTH_LOW;
        this.qColor = data.qualitY_COLOR;
        this.pColor = data.performancE_COLOR;
        this.vColor = data.valuE_COLOR;
        this.cColor = data.compliancE_COLOR
        this.sMonth = data.month;
        this.iYear = data.year;

        this._dashboardUtil.csG_FILTER_MONTH = data.month;
        this._dashboardUtil.csG_FILTER_YEAR = data.year;
        this.highlights = data.highlights;

      },
      error => {
        this._util.serviceError(error);
      },
      () => {
        this.fillGraphCleverQualitySemicircleDonoughtChart();
        this.showSuccessGoalFilter = false;

        if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0) {
          this.getSelectedProjectsList(this._shared.selectedProjects)
        }
      }
    )
    // }
  }



  // showKPINotesForCustomer(custid) {
  //   this._appservice.getNotesForCustomer(custid)
  //     .subscribe
  //     (
  //       data => {
  //         this.notes = data;
  //         this.notes.sort((x, y): number => {
  //           if (x.publisH_DATE > y.publisH_DATE) return -1;
  //           if (x.publisH_DATE < y.publisH_DATE) return 1;
  //           return 0;
  //         });
  //         this.openKPINotes();
  //       }
  //       ,
  //       error => {
  //         this._util.serviceError(error);
  //       }
  //     );
  // }

  // openKPINotes() {

  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //     'notes': this.notes,
  //     'custid': this.selectedCustomer.cusT_ID
  //   },
  //     dialogConfig.maxWidth = "100%";
  //   dialogConfig.height = "100%";
  //   dialogConfig.width = "100vw";
  //   dialogConfig.panelClass = "myPanel";
  //   const dialogRef = this.dialog.open(AddNotesComponent, dialogConfig);

  // }

  // showRiskDetails(custid) {
  //   this._appservice.getRiskByCustomerId(custid).subscribe(
  //     data => {
  //       this.riskList = data;
  //       this.openRiskDialog();
  //     },
  //     error => {
  //       this._util.serviceError(error);
  //     }
  //   )
  // }

  // showIssuesDetails(custid) {
  //   this._appservice.getIssuesByCustomerId(custid).subscribe(
  //     data => {
  //       this.issueList = data;
  //       this.openIssuesDialog();
  //     },
  //     error => {
  //       this._util.serviceError(error);
  //     }
  //   )
  // }

  // showActionItemsDetails(custid) {
  //   this._appservice.getActionItemsDetails(custid).subscribe(
  //     data => {
  //       this.actionItemData = data;
  //       this.openActionItemsDialog();
  //     }
  //   )
  // }

  // ShowIdeasDetails(custid) {
  //   this._appservice.getIdeasDetails(custid).subscribe(
  //     data => {
  //       this.ideasdata = data;
  //       this.openIdeasDialog();
  //     }
  //   )
  // }

  // openIdeasDialog() {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //     'ideas': this.ideasdata
  //   },
  //     dialogConfig.maxWidth = "100%"
  //   dialogConfig.height = "100%",
  //     dialogConfig.width = "100vw"
  // }

  // openActionItemsDialog() {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //     'actionitems': this.actionItemData
  //   },
  //     dialogConfig.maxWidth = "100%"
  //   dialogConfig.height = "100%",
  //     dialogConfig.width = "100vw"
  // }

  // openIssuesDialog() {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //     'issues': this.issueList
  //   },
  //     dialogConfig.maxWidth = "100%"
  //   dialogConfig.height = "100%",
  //     dialogConfig.width = "100vw"
  // }

  // openRiskDialog() {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //     'risk': this.riskList
  //   },
  //     dialogConfig.maxWidth = "100%"
  //   dialogConfig.height = "100%",
  //     dialogConfig.width = "100vw"
  // }

  // GetProjectForecast(custid) {
  //   this._appservice.getProjectForeCastForCustomer(custid).subscribe(
  //     data => {
  //       if (data != null) {
  //         if (this._shared.selectedProjects.length > 0) {
  //           this.projectforecast = {};
  //           this.projectforecast.projectend = [];
  //           this.projectforecast.projectstart = [];
  //           this.projectforecast.projresrc = [];

  //           this._shared.selectedProjects.forEach(element => {
  //             this.projectforecast.projectend.push(...data.projectend.filter(p => p.proJ_ID === element));//"INT-FIN-Accounts Payable";
  //             this.projectforecast.projectstart.push(...data.projectstart.filter(p => p.proJ_ID === element));//this._shared.selectedProjects);
  //             this.projectforecast.projresrc.push(...data.projresrc.filter(p => p.proJ_ID === element));//this._shared.selectedProjects);
  //           });
  //         }
  //         else {
  //           this.projectforecast = data;
  //         }
  //       }

  //       this.openProjectStatusdialog();
  //     },
  //     error => {
  //       this._util.serviceError(error);
  //     }
  //   );
  // }

  // openProjectStatusdialog() {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //     'projectStatus': this.projectforecast,
  //     'custName': this.selectedCustomer.cusT_NM
  //   },
  //     dialogConfig.maxWidth = "90%"
  //   dialogConfig.height = "90%",
  //     dialogConfig.width = "100vw"
  //   const dialogRef = this.dialog.open(ProjectStatusComponent, dialogConfig);
  // }

  // openStaffingSummarydialog(custid) {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.data = {
  //     'custid': custid
  //   },
  //     dialogConfig.autoFocus = true;
  //   dialogConfig.maxWidth = "90%";
  //   dialogConfig.height = "90%";
  //   dialogConfig.width = "100vw";

  //   const dialogRef = this.dialog.open(StaffingSummaryComponent, dialogConfig);
  // }

  //**********************************************
  // Initiali
  ShowSideNav() {
    if (window.screen.width > 600) {
      this._util.ShowSideNav = true;
    }
    else {
      this._util.ShowSideNav = false;
    }
  }
  enablestatus() {
    if (this.count == 0) {
      this.legend = true;
      this.count = this.count + 1;
    }
    else {
      this.legend = false;
      this.count = 0
    }
  }
  logout() {
    if (confirm("Are you sure you want to log out?")) {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        let loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
        window.location.href = loginurl;
      }
      else {
        this.service_Logout();
        this._router.navigateByUrl('/login');
      }
    }
  }

  service_Logout() {
    this._appservice.Logout().subscribe(() => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }
  getGraphValue_customer(title) {
    let iValue = 0;
    let sValue = this.getTitleByCustomer(title);

    if (sValue != '-')
      sValue = sValue.replace("%", "");
    else
      sValue = '0';

    if (sValue != undefined)
      iValue = Number(sValue);
    return iValue;
  }

  getGraphValue_portfolio(title, id) {
    let iValue = 0;
    let sValue = this.getTitleByPortfolio(title, id);
    if (sValue != undefined && sValue != "-")
      iValue = Number(sValue);
    else
      iValue = 0;
    return iValue;
  }
  getGraphValue_project(title, projid) {
    let iValue = 0;
    let sValue = this.getTitleByProject(title, projid);
    if (sValue != undefined && sValue != "-") {
      sValue = sValue.replace(/\D/g, "");
      iValue = Number(sValue);
    }
    else
      iValue = 0;
    return iValue;
  }

  fillGraphDetails() {
    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0)
      this.applyFilter();
    else {
      this._appservice.getAllProjectsForCustomer(this.customerid).subscribe(data => {
        this.projArray = data.map(x => x.proJ_ID);
        this.applyFilter();
      })

      //  this.fillGraphIdeasColumn();
      //  this.fillGraphStaffSummaryPie();
      //  this.fillGraphBillingSummaryColumn();
      //  this.fillGraphProjectStatusSemicircleDonoughtChart();
      //  this.fillGraphActionsItemsCircleDonoughtChart();
      //  this.fillGraphIssuesCircleDonoughtChart();
      //  this.fillGraphRisksCircleDonoughtChart();
      //  this.fillGraphCleverQualitySemicircleDonoughtChart();
      //  this.fillQAAuditStatus();
      //  this.fillQAFindingsSummary();
      //  this.fillQAFindingsByTime();
      //  this.fillQAFindingsByStage();
      //  this.fillQAOverallComplianceScore();
      //  this.fillQAComplianceScoreByProcessModel();
    }
  }

  fillQAComplianceScoreByProcessModel() {
    let titles = []
    titles = this.gettitlesbystringForCustomer('COMPLIANCE_SCORE_', this.customerid);
    titles = titles.filter((x, i, a) => a.indexOf(x) == i);

    let values = ["0"];
    var title = "";
    this.compscoremodeldata = [];
    for (let i = 0; i < titles.length; i++) {
      values[i] = this.getTitleByCustomer(titles[i]);
      title = titles[i].substr(17);
      title = title.charAt(0) + title.substr(1).toLowerCase();
      this.compscoremodeldata.push([title, +values[i], values[i]]);
    }

  }

  fillQAOverallComplianceScore() {
    let value = this.getTitleByCustomer('OVERALL_COMPLIANCE_SCORE');
    this.compdata = [];
    this.compdata = [
      ['', +value]
    ];

  }

  fillQAFindingsByStage() {
    // let titles = ["STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION", "STAGE_FINDING_CAP REVIEW", "STAGE_FINDING_IMPLEMENT CAP", "STAGE_FINDING_VERIFY CAP IMPLEMENTATION"];
    let findingsTitle = [];
    // let result = ["STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION", "STAGE_FINDING_CAP REVIEW", "STAGE_FINDING_IMPLEMENT CAP", "STAGE_FINDING_VERIFY CAP IMPLEMENTATION"];
    //let result = [];
    let titles = []
    titles = this.gettitlesbystringForCustomer('STAGE_FINDING_', this.customerid);
    titles = titles.filter((x, i, a) => a.indexOf(x) == i);



    let values = ["0"];
    var title = "";
    this.findingdatastage = [];
    for (let i = 0; i < titles.length; i++) {
      values[i] = this.getTitleByCustomer(titles[i]);

      // title = titles[i].substr(14);
      // title = title.charAt(0) + title.substr(1).toLowerCase();
      title = this.stagesDict[titles[i]];
      this.findingdatastage.push([title, +values[i]]);
    }

    let valuesintArray = values.map(x => +x);
    var total = valuesintArray.reduce((x, y) => { return x + y });

    if (total == 0)
      this.isFindingsByStageEmpty = true;
    else
      this.isFindingsByStageEmpty = false;
  }

  rejectfindingsCount: string;

  fillQAFindingsByTime() {
    let titles = ["TIME_FINDING_WEEK1", "TIME_FINDING_WEEK2", "TIME_FINDING_WEEK3", "TIME_FINDING_WEEK4"];
    let values = ["0"];
    var title = "";
    this.findingdatatime = [];
    for (let i = 0; i < titles.length; i++) {
      values[i] = this.getTitleByCustomer(titles[i]);

      // title = titles[i].substr(13);
      // title = title.charAt(0) + title.substr(1).toLowerCase();
      title = this.findingsByTimeDict[titles[i]];
      this.findingdatatime.push([title, +values[i]]);
    }
    this.rejectfindingsCount = this.getTitleByCustomer('TIME_FINDING_REJECT');

    let valuesintArray = values.map(x => +x);
    var total = valuesintArray.reduce((x, y) => { return x + y });

    if (total == 0)
      this.isFindingsByTimeEmpty = true;
    else
      this.isFindingsByTimeEmpty = false;
  }



  fillQAFindingsSummary() {
    let titles = [];
    titles = this.gettitlesbystringForCustomer('FINDING_', this.customerid);
    titles = titles.filter((x, i, a) => a.indexOf(x) == i);
    let values = ["0"];
    var title = "";



    this.findingdata = [];
    for (let i = 0; i < titles.length; i++) {
      values[i] = this.getTitleByCustomer(titles[i]);

      title = titles[i].substr(8);
      title = title.charAt(0) + title.substr(1).toLowerCase();
      this.findingdata.push([title, +values[i]]);
    }
    //console.log("findingdata:",this.findingdata);
    this.getChartVal();
    let valuesintArray = values.map(x => +x);

    var total = valuesintArray.reduce((x, y) => { return x + y });
    if (total == 0)
      this.isFindingsByTypeEmpty = true;
    else
      this.isFindingsByTypeEmpty = false;
  }

  getChartVal() {
    let typerArr = [["Strength", 0], ["Weakness", 0], ["Opportunity", 0], ["Threat", 0]];
    this.findingdatatype = typerArr;

    typerArr.forEach((x, i) => {
      this.findingdata.forEach((y) => {
        if (x[0] === y[0]) {
          this.findingdatatype[i][1] = y[1];
        }
      });
    });
  }

  gettitlesbystringForCustomer(title, custid) {
    let output = [];
    if (this.dashboardDetails != undefined && this.dashboardDetails.length > 0) {
      output = this.dashboardDetails.filter((entry) => entry.title.startsWith(title) && entry.cusT_ID == custid).map(x => x.title);
    }

    return output;
  }
  //-------------------------------------
  //Ideas, Innovations & Improvements - column Chart
  //-------------------------------------
  type1 = 'ColumnChart';
  width1 = 180;
  height1 = 110;
  columnNames1 = ['status', 'Total', { 'role': 'annotation' }, { 'role': 'style' }]
  data1 = [
    ['Completed', 30, '30', '#3ab376'],
    ['In Progress', 20, '20', '#ff6f00'],
  ]
  options1: google.visualization.ColumnChartOptions = {
    legend: {
      position: 'none',
    },
    width: 180,
    height: 130,
    enableInteractivity: false,
    hAxis: {
      textStyle: {
        fontSize: 9
      }
    },
    vAxis:
    {
      //ticks: ['0', '5'],
      gridlines: {
        color: '#ebedf1'
      },
      baselineColor: '#FFFFFF',
    },
    bar: { groupWidth: "50%" },
    annotations: {
      alwaysOutside: false
    },
    // colors: ['#3ab376', '#ff6f00'],
    chartArea: {
      'width': '70%',
      'height': '80%', left: 25, top: 10
    },
    // series: ['Status', 'Value', { 'role': 'annotation' },
    //     'value1', { 'role': 'annotation' }],
  };
  //-------------------------------------
  fillGraphIdeasColumn() {
    this.data1 = [];
    this.data1.push([
      "Completed",
      this.getGraphValue_customer('IDEAS_COMPLETED'),
      this.getGraphValue_customer('IDEAS_COMPLETED'),
      '#3ab376'
    ]);
    this.data1.push([
      "In Progress",
      this.getGraphValue_customer('IDEAS_INPROGRESS'),
      this.getGraphValue_customer('IDEAS_INPROGRESS'),
      '#ff6f00'
    ]);

    this.ideasCount = this.getTitleByCustomer('IDEAS');
    this.automationCount = this.getTitleByCustomer('IDEAS_AUTOMATIONS');
    this.innovationCount = this.getTitleByCustomer('IDEAS_INNOVATIONS');
    this.improvementsCount = this.getTitleByCustomer('IDEAS_IMPROVEMENTS');
    this.hoursSaved = this.getTitleByCustomer('IDEAS_HOURS');
    this.effortSaved = this.getTitleByCustomer('IDEAS_DOLLARS');
  }

  fillQAAuditStatus() {
    if ((this.getGraphValue_customer('AUDIT_PLANNED') + this.getGraphValue_customer('AUDIT_IN PROGRESS') +
      this.getGraphValue_customer('AUDIT_COMPLETED') + this.getGraphValue_customer('AUDIT_CANCELLED')) == 0) {
      this.isAuditStatusEmpty = true;
    }
    else {
      this.isAuditStatusEmpty = false;
      this.auditdata = [];
      this.auditdata.push(["Planned", this.getGraphValue_customer('AUDIT_PLANNED')]);
      this.auditdata.push(["In Progress", this.getGraphValue_customer('AUDIT_IN PROGRESS')]);
      this.auditdata.push(["Completed", this.getGraphValue_customer('AUDIT_COMPLETED')]);
      this.auditdata.push(["Cancelled", this.getGraphValue_customer('AUDIT_CANCELLED')]);
    }
  }


  //-------------------------------------
  //Staffing Summary - Pie Chart
  //-------------------------------------
  type2 = 'PieChart';
  data2: any[] = [
    ['Offshore', 0],
    ['Onsite', 0]
  ]
  columnNames = ['Offshore', 'Onsite'];
  width2 = 170;
  height2 = 80;
  options2: google.visualization.PieChartOptions = {
    colors: ['#54b8e8', '#3ab376'],
    chartArea: { 'width': '100%', 'height': '80%' },
    legend: {
      position: 'right', alignment: 'center', textStyle: {
        fontSize: 9, bold: true
      }
    },
    tooltip: { trigger: 'selection' },
    pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9 }
  };


  typeaudit = 'PieChart';
  auditdata: any[] = [
    ["Planned", 0],
    ["In Progress", 0],
    ["Completed", 0],
    ["Cancelled", 0]
  ];


  columaudit = ['Status', 'Value'];
  widthaudit = 170;
  heightaudit = 85;
  optionaudit: google.visualization.PieChartOptions = {
    //colors: ['#54b8e8', '#ff6f00', '#3ab376', 'red'],
    chartArea: { 'width': '100%', 'height': '80%' },
    legend: {
      position: 'right', alignment: 'center'
    },
    tooltip: { trigger: 'selection' },
    //pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 10 },
  };

  // QA Assessment Summary

  typefindingBytype = 'PieChart';
  findingdata: any[] = [];
  columfinding = ['Status', 'Value'];
  widthfinding = 170;
  heightfinding = 85;
  optionfinding: google.visualization.PieChartOptions = {
    colors: ['#07A445', '#FFA500', '#0000FF', '#ff0000'],
    //colors: ['green', 'orange', 'blue', 'red'],
    sliceVisibilityThreshold: 0,

    chartArea: { 'width': '100%', 'height': '80%', 'left': 0 },

    legend: {
      position: 'right', alignment: 'center'
    },
    tooltip: { trigger: 'selection' },
    //pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 10 },
  };

  // QA Findings by time


  // typefindingBytime = 'PieChart';
  // findingdatatime: any[] = [];
  // columfindingtime = ['Status', 'Value'];
  // widthfindingtime = 170;
  // heightfindingtime = 85;
  // optionfindingtime: google.visualization.PieChartOptions = {
  //   // colors: ['#54b8e8', '#ff6f00', '#3ab376', 'red'],
  //   chartArea: { 'width': '100%', 'height': '80%', 'left': 0 },

  //   legend: {
  //     position: 'right', alignment: 'center'
  //   },
  //   tooltip: { trigger: 'selection' },
  //   //pieSliceBorderColor: 'transparent',
  //   pieSliceText: 'value',
  //   pieSliceTextStyle: { fontSize: 10 },
  // };

  // QA findings by stage

  typefindingBystage = 'PieChart';
  findingdatastage: any[] = [];
  columfindingstage = ['Status', 'Value'];
  widthfindingstage = 170;
  heightfindingstage = 85;
  optionfindingstage: google.visualization.PieChartOptions = {
    colors: ['rgb(16, 150, 24)', 'rgb(51, 102, 204)', 'rgb(255, 153, 0)', 'rgb(220, 57, 18)'],
    chartArea: { 'width': '100%', 'height': '80%', 'left': 0, right: 0 },

    legend: {
      position: 'right', alignment: 'center'
    },
    tooltip: { trigger: 'selection' },
    //pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 10 },
  };

  comptype = 'Gauge';
  compdata: any[] = [
    ['Overall Compliance', 35]
  ];
  compcolumn = ['Status', 'Value'];
  compwidth = 170;
  compheight = 90;
  compoption = {
    //colors: ['rgb(16, 150, 24)', 'rgb(51, 102, 204)', 'rgb(255, 153, 0)', 'rgb(220, 57, 18)'],
    chartArea: { 'width': '100%', 'height': '100%', right: 0 },
    alignment: 'centre',
    tooltip: { trigger: 'selection' },
    //pieSliceBorderColor: 'transparent',
    width: 170,
    height: 90,
    greenFrom: 91,
    greenTo: 100,
    redFrom: 0,
    redTo: 50,
    yellowFrom: 51,
    yellowTo: 90,
    minorTicks: 10,
    majorTicks: ['0', '50', '100']
  };
  //-------------------------------------
  fillGraphStaffSummaryPie() {
    this.data2 = [];
    this.data2.push(["Offshore", this.getGraphValue_customer('OFFSHORE_TOTAL')]);
    this.data2.push(["Onsite", this.getGraphValue_customer('ONSITE_TOTAL')]);
  }
  //-------------------------------------
  //Billing Summary - column Chart
  type3 = 'ColumnChart';
  data3: any[] =
    [
      ['Non-Billable', 0, '0', 0, '0'],
      ['Billable', 0, '0', 0, '0']
    ];
  columnNames3 = ['Status', 'Onsite', { 'role': 'annotation' }, 'Offshore', { 'role': 'annotation' }];
  options3: google.visualization.ColumnChartOptions
    = {
      legend: {
        position: 'none',
        alignment: 'center',
        textStyle: {
          fontName: 'Helvetica',
          fontSize: 8
        }
      },
      width: 210,
      height: 100,
      vAxis: {
        ticks: [],
        baselineColor: '#FFFFFF'
      },
      annotations: {
        textStyle: {
          fontSize: 11
        },
        alwaysOutside: false,
      },

      bar: { groupWidth: "70%", },
      colors: ['#3ab376', '#54b8e8'],

      chartArea: {
        'width': '70%', 'height': '70%', left: 10, top: 0
      },
    };

  //----------------------------------------
  // Compliance score by standards

  compscoremodeltype = 'ColumnChart';
  compscoremodeldata: any[] =
    [
      ['ISO 27000', 100, '0'],
      ['PMBOK', 67, '0'],
      ['TEST', 78, '0'],
      ['ITSM', 34, '0']
    ];
  compscoremodelcolumn = ['Status', 'Onsite', { 'role': 'annotation' }];
  compscoremodeloptions: google.visualization.ColumnChartOptions
    = {
      legend: {
        position: 'none',
        alignment: 'center',
        textStyle: {
          fontName: 'Helvetica',
          fontSize: 10
        }
      },
      width: 220,
      height: 140,
      vAxis: {
        ticks: [],
        baselineColor: '#FFFFFF'
      },
      annotations: {
        textStyle: {
          fontSize: 11
        },
        alwaysOutside: false,
      },

      bar: { groupWidth: "50%", },
      //colors: ['#3ab376', '#54b8e8'],

      chartArea: {
        'width': '60%', 'height': '70%', left: 0, top: 0
      },
    };

  //-------------------------------------
  fillGraphBillingSummaryColumn() {
    this.data3 = [];
    this.data3.push([
      "Non-Billable",
      this.getGraphValue_customer('ONSITE_NON_BILLABLE'),
      this.getGraphValue_customer('ONSITE_NON_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_NON_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_NON_BILLABLE')]);
    this.data3.push([
      "Billable",
      this.getGraphValue_customer('ONSITE_BILLABLE'),
      this.getGraphValue_customer('ONSITE_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_BILLABLE'),
      this.getGraphValue_customer('OFFSHORE_BILLABLE')]);
  }
  // isProjectStatusEmpty() {
  //   if (this.getGraphValue_customer('PROJECT_TO_START') == 0 && this.getGraphValue_customer('PROJECT_TO_END') == 0)
  //     return true;
  //   else
  //     return false;
  // }
  // isActionItemsEmpty() {
  //   if (this.getGraphValue_customer('PAST_DUE_DATE') == 0 && this.getGraphValue_customer('DUE_FOR_CLOSURE') == 0)
  //     return true;
  //   else
  //     return false;
  // }

  // isIssuesEmpty() {
  //   if (this.getGraphValue_customer('ISSUES_PAST_DUE_DATE') == 0 && this.getGraphValue_customer('ISSUES_DUE_FOR_CLOSURE') == 0)
  //     return true;
  //   else
  //     return false;
  // }

  // isRisksEmpty() {
  //   if (this.getGraphValue_customer('RISKS_PAST_DUE_DATE') == 0 && this.getGraphValue_customer('RISKS_DUE_FOR_CLOSURE') == 0)
  //     return true;
  //   else
  //     return false;
  // }
  //-------------------------------------
  //Project Status  - Semi circle Donought Chart
  //-------------------------------------
  // type5 = 'PieChart';
  // width5 = 160;
  // height5 = 100;
  // columnNames5 = ['status', 'count'];
  // data5 = [
  //   ['Projects to start', 0],
  //   ['Projects to end', 0],
  //   [null, 50]
  // ];
  // options5: google.visualization.PieChartOptions
  //   = {
  //     legend: {
  //       position: 'right',
  //       alignment:
  //         'center',
  //     },
  //     pieHole: 0.5,
  //     pieStartAngle: 270,
  //     pieSliceText: 'value',
  //     colors: ['#3ab376', '#ff0109'],
  //     chartArea: {
  //       'width': '100%',
  //       'height': '100%', bottom: 10, top: 10
  //     },
  //     slices: {
  //       2: {
  //         color: 'transparent',
  //         enableInteractivity: false
  //       }
  //     },
  //   };


  passedPosition: google.visualization.ChartLegendPosition = 'right';
  type5 = 'PieChart';
  width5 = 170;
  height5 = 85;
  columnNames5 = ['status', 'count'];
  data5 = [
    ['Projects to start', 20],
    ['Projects to end', 30],
    [null, 50]
  ];
  options5: google.visualization.PieChartOptions
    = {
      legend: {
        position: this.passedPosition,
        alignment:
          'center',
      },
      pieHole: 0.5,
      pieStartAngle: 270,
      sliceVisibilityThreshold: 0,
      height: 85,
      width: 170,
      pieSliceText: 'value',
      tooltip: { trigger: 'selection' },
      colors: ['#3ab376', '#ff0109'],
      chartArea: {
        'width': '100%',
        'height': '100%', bottom: 0, top: 0
      },
      slices: {
        2: {
          color: 'transparent',
          enableInteractivity: false
        }
      },
    };

  totalProjects = 0;
  //-------------------------------------
  fillGraphProjectStatusSemicircleDonoughtChart() {
    this.data5 = [];
    let data1 = this.getGraphValue_customer('PROJECT_TO_START');
    let data2 = this.getGraphValue_customer('PROJECT_TO_END');
    this.data5.push(["Projects to start", data1]);
    this.data5.push(["Projects to end", data2]);
    this.totalProjects = data1 + data2;
    this.isProjectStatusEmpty = this.totalProjects == 0 ? true : false;
    this.data5.push([null, this.totalProjects]);
  }
  //-------------------------------------
  //Action Items circle Donought Chart
  //-------------------------------------
  type6 = 'PieChart';
  width6 = 170;
  height6 = 85;
  columnNames6 =
    ['status', 'count'];
  data6 = [
    ['Due for closure', 20],
    ['Past due date', 30],
    [null, 50],
  ];
  options6: google.visualization.PieChartOptions = {
    titleTextStyle:
    {
      fontSize: 15,
      color: '#535d85',
      fontName: 'Helvetica Neue'
    },
    legend: {
      position: 'right',
      alignment: 'center',
    },
    pieHole: 0.5,
    pieStartAngle: 270,
    sliceVisibilityThreshold: 0,
    height: 85,
    width: 170,
    tooltip: { trigger: 'selection' },
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9 },
    colors: ['#3ab376', '#ff0109'],
    chartArea: {
      'width': '100%', 'height': '100%', bottom: 0, top: 0
    },
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  totalActionItems = 0;





  fillGraphActionsItemsCircleDonoughtChart() {
    this.data6 = [];
    this.data6.push(["Due for closure", this.getGraphValue_customer('DUE_FOR_CLOSURE')]);
    this.data6.push(["Past due date", this.getGraphValue_customer('PAST_DUE_DATE')]);
    this.totalActionItems = this.getGraphValue_customer('DUE_FOR_CLOSURE') + this.getGraphValue_customer('PAST_DUE_DATE');

    if (this.totalActionItems == 0)
      this.isActionItemsEmpty = true;
    else
      this.isActionItemsEmpty = false;
    this.data6.push([null, this.totalActionItems]);

    this.actionItemHigh = this.getTitleByCustomer('ACTION_ITEM_HIGH');
    this.actionItemMedium = this.getTitleByCustomer('ACTION_ITEM_MEDIUM');
    this.actionItemLow = this.getTitleByCustomer('ACTION_ITEM_LOW');

  }

  typeI = 'PieChart';
  widthI = 170;
  heightI = 85;
  columnNamesI =
    ['status', 'count'];
  dataI = [
    ['Due for closure', 20],
    ['Past due date', 30],
    [null, 50],
  ];
  optionsI: google.visualization.PieChartOptions = {
    titleTextStyle:
    {
      fontSize: 15,
      color: '#535d85',
      fontName: 'Helvetica Neue'
    },
    legend: {
      position: 'right',
      alignment: 'center',
    },
    pieHole: 0.5,
    pieStartAngle: 270,
    sliceVisibilityThreshold: 0,
    height: 85,
    width: 170,
    tooltip: { trigger: 'selection' },
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9 },
    colors: ['#3ab376', '#ff0109'],
    chartArea: {
      'width': '100%', 'height': '100%', bottom: 0, top: 0
    },
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  fillGraphIssuesCircleDonoughtChart() {
    this.dataI = [];
    let data1 = this.getGraphValue_customer('ISSUES_DUE_FOR_CLOSURE');
    let data2 = this.getGraphValue_customer('ISSUES_PAST_DUE_DATE');

    this.dataI.push(["Due for closure", data1]);
    this.dataI.push(["Past due date", data2]);
    this.totalIssues = data1 + data2;

    if (this.totalIssues == 0)
      this.isIssuesEmpty = true;
    else
      this.isIssuesEmpty = false;

    this.dataI.push([null, this.totalIssues]);
    this.issueHigh = this.getTitleByCustomer('ISSUES_HIGH');
    this.issueMedium = this.getTitleByCustomer('ISSUES_MEDIUM');
    this.issueLow = this.getTitleByCustomer('ISSUES_LOW');
  }

  typeR = 'PieChart';
  widthR = 170;
  heightR = 85;
  columnNamesR =
    ['status', 'count'];
  dataR = [
    ['Due for closure', 20],
    ['Past due date', 30],
    [null, 50],
  ];
  optionsR: google.visualization.PieChartOptions = {
    titleTextStyle:
    {
      fontSize: 15,
      color: '#535d85',
      fontName: 'Helvetica Neue'
    },
    legend: {
      position: 'right',
      alignment: 'center',
    },
    pieHole: 0.5,
    pieStartAngle: -90,
    sliceVisibilityThreshold: 0,
    height: 85,
    width: 170,
    tooltip: { trigger: 'selection' },
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9 },
    colors: ['#3ab376', '#ff0109', 'transparent'],
    chartArea: {
      'width': '100%', 'height': '100%', bottom: 0, top: 0
    },
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  fillGraphRisksCircleDonoughtChart() {
    this.dataR = [];
    let data1 = this.getGraphValue_customer('RISKS_DUE_FOR_CLOSURE');
    let data2 = this.getGraphValue_customer('RISKS_PAST_DUE_DATE');
    this.dataR.push(["Due for closure", data1]);
    this.dataR.push(["Past due date", data2]);
    this.totalRisks = data1 + data2;
    if (this.totalRisks == 0)
      this.isRisksEmpty = true;
    else
      this.isRisksEmpty = false;
    this.dataR.push([null, this.totalRisks]);

    this.riskHigh = this.getTitleByCustomer('RISKS_HIGH').toString();
    this.riskMedium = this.getTitleByCustomer('RISKS_MEDIUM').toString();
    this.riskLow = this.getTitleByCustomer('RISKS_LOW').toString();

  }


  //-------------------------------------
  //Clever quality  - Semi circle Donought Chart
  //-------------------------------------
  // type7 = 'PieChart';
  // width7 = 100;
  // height7 = 105;
  // columnNames7 = ['status', 'count'];
  // data7 = [
  //   ['Achieved', 90],
  //   [null, 10],
  // ];
  // options7: google.visualization.PieChartOptions
  //   = {
  //     legend: {
  //       position: 'none',
  //       alignment:
  //         'center',
  //     },
  //     pieHole: 0.6,
  //     width: 100,
  //     height: 105,
  //     pieStartAngle: 270,
  //     pieSliceText: 'value',
  //     pieSliceTextStyle :{
  //       fontSize : 8,
  //     },
  //     colors: ['#3ab376', '#ff0109'],
  //     chartArea: {
  //       'width': '100%',
  //       'height': '90%', bottom: 0, top: 20
  //     },
  //     slices: {
  //       2: {
  //         color: 'transparent',
  //         enableInteractivity: false
  //       }
  //     },
  //   };

  type8 = 'PieChart';
  width8 = 70;
  height8 = 105;
  columnNames8 = ['status', 'count'];
  data8 = [
    // ['Quality', 25],
    // ['Performance', 25],
    // ['Value1', 25],
    // ['Compliance', 25]
  ];
  options8: google.visualization.PieChartOptions
    = {
      legend: {
        position: 'none',
        alignment:
          'center',
      },
      // pieHole: 0.6,
      width: 70,
      height: 105,
      tooltip: { trigger: 'selection' },
      //  pieStartAngle: 270,
      pieSliceText: 'value',
      pieSliceTextStyle: {
        fontSize: 10,
      },
      colors: ['#5c66f2', '#5adb9a', '#3ab376', '#a9a9a9'],
      chartArea: {
        'width': '100%',
        'height': '90%', bottom: 10, top: 0,
        left: 0
      },

    };

  //-------------------------------------
  fillGraphCleverQualitySemicircleDonoughtChart() {
    // let achieved: number = this.getGraphValue_customer('SUCCESS_GOAL_SCORE');
    // this.achievedValueForOverallScore = achieved;
    // let notAchieved = 100 - achieved;

    let quality = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_QUALITY');
    let perf = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_PERFORMANCE');
    let value = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_VALUE');
    let compliance = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_COMPLIANCE');

    this.achievedValueForOverallScore = quality + perf + value + compliance;
    //this.achievedValueForOverallScore = 100;

    this.data8 = [];
    this.data8.push(["Quality", quality]);
    this.data8.push(["Performance", perf]);
    this.data8.push(["Value1", value]);
    this.data8.push(["Compliance", compliance]);
  }

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
    colors: ['#3ab376', '#ff6f00'],
    chartArea: { 'width': '100%', 'height': '80%', top: 6, bottom: 2 },
  };

  openKPItrendScreen() {
    //   const dialogConfig = new MatDialogConfig();
    //   dialogConfig.autoFocus = true;
    //   dialogConfig.data = {
    //     'custid': this.selectedCustomer.cusT_ID,
    //     'projids': this.projArray
    //   },
    //     dialogConfig.maxWidth = "75%";
    //   dialogConfig.height = "85%";
    //   dialogConfig.width = "75%";
    //   const dialogRef = this.dialog.open(KPITrendComponent, dialogConfig);
    // }
    // openDialog(){
    //   const dialogConfig = new MatDialogConfig();
    //   dialogConfig.autoFocus = true;

    //   dialogConfig.maxWidth = "75%";
    //   dialogConfig.height = "85%";
    //   dialogConfig.width = "75%";
    //   const dialogRef = this.dialog.open(ProductKpiDetailsComponent, dialogConfig);
  }

  // QA Findings by time


  typefindingBytime = 'ColumnChart';
  findingdatatime: any[] = [
    ['< 7d', 0, 0, 0, 0, 0, 0, 0, 0],
    ['> 7d', 0, 0, 0, 0, 0, 0, 0, 0],
    ['> 14d', 0, 0, 0, 0, 0, 0, 0, 0],
    ['> 21d', 0, 0, 0, 0, 0, 0, 0, 0],
    ['> 30d', 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  columfindingtime = ['AgeofDays', "Strength", "Weakness", "Opportunity", "Threat",
    "Major", "Minor", "Opportunities for Improvement", "Recommendations"];
  widthfindingtime = 160; // 140
  heightfindingtime = 85;
  optionfindingtime: google.visualization.ColumnChartOptions = {
    colors: ['#07A445', '#FFA500', '#0000FF', '#ff0000', '#F67280', '#00D7CD', '#D79300', '#4B5320'],
    chartArea: { 'width': '99%', 'height': '90%', bottom: 30, top: 8 },
    legend: {
      position: 'bottom', alignment: 'center'
    },
    tooltip: { trigger: 'selection' },
    isStacked: true,
    vAxis: {
      title: "count", textStyle: {
        fontSize: 8
      }
    },
    hAxis: {
      minValue: 0, title: "", textStyle: {
        fontSize: 8
      }
    },

  };

  GetAssessmentFindingsByTime(custId: string, projArray: any[]) {
    this.findingdatatime = [];
    let assessmentFindingData = [];

    this._appservice.getAssessmentFindingsByTime(custId, projArray).subscribe(data => {

      assessmentFindingData = data;
      if (assessmentFindingData.length > 0) {
        this.isFindingsByTimeEmpty = false;

        let lessThan7Days = assessmentFindingData.filter(x => x.agebydays == '< 7 days');
        let greaterThan7Days = assessmentFindingData.filter(x => x.agebydays == '> 7 days');
        let greaterThan14Days = assessmentFindingData.filter(x => x.agebydays == '> 14 days');
        let greaterThan21Days = assessmentFindingData.filter(x => x.agebydays == '> 21 days');
        let greaterThan30Days = assessmentFindingData.filter(x => x.agebydays == '> 30 days');

        this.findingdatatime.push(['< 7d', lessThan7Days.length > 0 ? lessThan7Days[0].strength : 0,
          lessThan7Days.length > 0 ? lessThan7Days[0].weakness : 0,
          lessThan7Days.length > 0 ? lessThan7Days[0].opportunity : 0,
          lessThan7Days.length > 0 ? lessThan7Days[0].threat : 0,
          lessThan7Days.length > 0 ? lessThan7Days[0].Major : 0,
          lessThan7Days.length > 0 ? lessThan7Days[0].Minor : 0,
          lessThan7Days.length > 0 ? lessThan7Days[0].OpportunitiesforImprovement : 0,
          lessThan7Days.length > 0 ? lessThan7Days[0].Recommendations : 0
        ])

        this.findingdatatime.push(['> 7d',
          greaterThan7Days.length > 0 ? greaterThan7Days[0].strength : 0,
          greaterThan7Days.length > 0 ? greaterThan7Days[0].weakness : 0,
          greaterThan7Days.length > 0 ? greaterThan7Days[0].opportunity : 0,
          greaterThan7Days.length > 0 ? greaterThan7Days[0].threat : 0,
          greaterThan7Days.length > 0 ? greaterThan7Days[0].Major : 0,
          greaterThan7Days.length > 0 ? greaterThan7Days[0].Minor : 0,
          greaterThan7Days.length > 0 ? greaterThan7Days[0].OpportunitiesforImprovement : 0,
          greaterThan7Days.length > 0 ? greaterThan7Days[0].Recommendations : 0
        ])

        this.findingdatatime.push(['> 14d',
          greaterThan14Days.length > 0 ? greaterThan14Days[0].strength : 0,
          greaterThan14Days.length > 0 ? greaterThan14Days[0].weakness : 0,
          greaterThan14Days.length > 0 ? greaterThan14Days[0].opportunity : 0,
          greaterThan14Days.length > 0 ? greaterThan14Days[0].threat : 0,

          greaterThan14Days.length > 0 ? greaterThan14Days[0].Major : 0,
          greaterThan14Days.length > 0 ? greaterThan14Days[0].Minor : 0,
          greaterThan14Days.length > 0 ? greaterThan14Days[0].OpportunitiesforImprovement : 0,
          greaterThan14Days.length > 0 ? greaterThan14Days[0].Recommendations : 0
        ])

        this.findingdatatime.push(['> 21d',
          greaterThan21Days.length > 0 ? greaterThan21Days[0].strength : 0,
          greaterThan21Days.length > 0 ? greaterThan21Days[0].weakness : 0,
          greaterThan21Days.length > 0 ? greaterThan21Days[0].opportunity : 0,
          greaterThan21Days.length > 0 ? greaterThan21Days[0].threat : 0,
          greaterThan21Days.length > 0 ? greaterThan21Days[0].Major : 0,
          greaterThan21Days.length > 0 ? greaterThan21Days[0].Minor : 0,
          greaterThan21Days.length > 0 ? greaterThan21Days[0].OpportunitiesforImprovement : 0,
          greaterThan21Days.length > 0 ? greaterThan21Days[0].Recommendations : 0
        ])

        this.findingdatatime.push(['> 30d',
          greaterThan30Days.length > 0 ? greaterThan30Days[0].strength : 0,
          greaterThan30Days.length > 0 ? greaterThan30Days[0].weakness : 0,
          greaterThan30Days.length > 0 ? greaterThan30Days[0].opportunity : 0,
          greaterThan30Days.length > 0 ? greaterThan30Days[0].threat : 0,
          greaterThan30Days.length > 0 ? greaterThan30Days[0].Major : 0,
          greaterThan30Days.length > 0 ? greaterThan30Days[0].Minor : 0,
          greaterThan30Days.length > 0 ? greaterThan30Days[0].OpportunitiesforImprovement : 0,
          greaterThan30Days.length > 0 ? greaterThan30Days[0].Recommendations : 0
        ]
        )

      }
      else
        this.isFindingsByTimeEmpty = true;
    }, error => { this._util.serviceError(error); },

    );
  }

  setValue() {
    localStorage.setItem('isFromFindingByAge', "true");
  }

  tasksEventstype = 'ColumnChart';
  tasksEventsColumnNames =
    ['Priority', 'Due', 'Overdue'];
  tasksEventsSummaryData = [
    ['High', 4, 3],
    ['Medium', 2, 7],
    ['Low', 1, 5]
  ];
  widthE = 185;
  heightE = 115;
  tasksEventsoptions: google.visualization.ColumnChartOptions =
    {
      chartArea: {
        'width': '88%', 'height': '100%', bottom: 30, top: 5
      },
      hAxis: {
        minValue: 0,
        textStyle: {
          bold: true,
          fontSize: 9,
          color: '#4d4d4d'
        },
        titleTextStyle: {
          bold: true,
          fontSize: 12,
          color: '#4d4d4d'
        }
      },
      legend: { position: 'bottom', maxLines: 2 },
      vAxis: {
        title: '',
        textStyle: {
          fontSize: 10,
          bold: true,
          color: '#848484'
        },
        titleTextStyle: {
          fontSize: 12,
          bold: true,
          color: '#848484'
        }
      }
    };

  GetTasksEventsSummary(customerId, employeeId) {
    this.tasksEventsSummaryData = [];
    this._appservice.GetTasksEventsSummary(customerId, employeeId).subscribe(data => {
      this.tasksEventsSummary = data;
    }, error => { this._util.serviceError(error); },
      () => {
        this.isTasksEventsEmpty = false;
        this.eventTasksHighValues = this.tasksEventsSummary.filter(x => x.priority.toLowerCase() == 'high')[0];
        this.eventTasksLowValues = this.tasksEventsSummary.filter(x => x.priority.toLowerCase() == 'low')[0];
        this.eventTasksMediumValues = this.tasksEventsSummary.filter(x => x.priority.toLowerCase() == 'medium')[0];
        this.tasksEventsSummaryData.push(['High', this.eventTasksHighValues.dueEvents + this.eventTasksHighValues.dueTasks, this.eventTasksHighValues.overdueEvents + this.eventTasksHighValues.overdueTasks]);
        this.tasksEventsSummaryData.push(['Medium', this.eventTasksMediumValues.dueEvents + this.eventTasksMediumValues.dueTasks, this.eventTasksMediumValues.overdueEvents + this.eventTasksMediumValues.overdueTasks]);
        this.tasksEventsSummaryData.push(['Low', this.eventTasksLowValues.dueEvents + this.eventTasksLowValues.dueTasks, this.eventTasksLowValues.overdueEvents + this.eventTasksLowValues.overdueTasks]);

      }
    );
  }

}

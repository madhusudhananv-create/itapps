import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatSelect } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { RiskchartComponent } from '../../../controls/risk-chart/risk-chart.component';
import { CustomerModel } from '../../../models/customer-model';
import { GlobalKPIRequest } from '../../../models/customer-projects-model';
import { HighlightsModel } from '../../../models/highlights-model';
import { IssueModel } from '../../../models/issue-model';
import { PortfolioModel, ProjectModelNew } from '../../../models/portfolio-model';
import { RiskModel } from '../../../models/risk-model';
import { ChartsService } from '../../../Services/charts.service';
import { AccessControl } from '../../../Shared/accessControl';
import { DashboardDetailsModel } from '../../../models/dashboard-details-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { SharedService } from '../../../Shared/shared.service';
import { IssueProgressStatusComponent } from '../../csm-dashboard/csm-customer-dashboard/issue-progress-status/issue-progress-status.component';
import { CSMDashboardService } from '../../csm-dashboard/csmdashboard.service';
import { AddNotesComponent } from '../../dashboard/dashboard-customer/add-notes/add-notes.component';
import { KPITrendComponent } from '../../dashboard/dashboard-customer/kpitrend/kpitrend.component';
import { ProjectStatusComponent } from '../../layout/project-status/project-status.component';
import { StaffingSummaryComponent } from '../../staffing-summary/staffing-summary.component';
import { COODashboardService } from '../coo-dashboard.service';
import { KPITrendByGoalComponent } from '../dashboard-controls/kpi-trend-by-goal/kpi-trend-by-goal.component';
import { CustomerSuccessGoalKPIPerformanceComponent } from '../dashboard-controls/customersuccessgoal-kpiperformance/customersuccessgoal-kpiperformance.component';
import { RiskIssueViewdetailsComponent } from '../dashboard-controls/risk-issue-viewdetails/risk-issue-viewdetails.component';
import { COODashboardCommon } from '../coo-dashboard-common';
import { ActionItemsPageComponent } from '../../layout/action-items-page/action-items-page.component';
import { IssuesPageComponent } from '../../layout/issues-page/issues-page.component';
import { RiskPageComponent } from '../../layout/risk-page/risk-page.component';

@Component({
  selector: 'app-overall-dashboard-status',
  templateUrl: './overall-dashboard-status.component.html',
  styleUrls: ['./overall-dashboard-status.component.scss']
})
export class OverallDashboardStatusComponent implements OnInit {

  @Input() showViewDashboard: boolean;
  Highcharts = Highcharts;
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
  selectedCustomerName: string;
  reset: boolean = true;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  count: number = 0;
  legend: boolean = false;
  achievedValueForOverallScore: number;
  goalDetails: any;
  highlights: any;
  portid: number;
  portArray: number[] = [];
  projectList: ProjectModelNew[];
  isFindingsByTypeEmpty: boolean = false;
  //data2 = [];

  menuToggleStatus: boolean;
  isFindingsByTimeEmpty: boolean = false;
  isFindingsByStageEmpty: boolean = false;

  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;
  dashboardDetails: DashboardDetailsModel[] = [];
  value2: number;
  value3: number;
  riskList: RiskModel[] = [];
  showFilter: boolean;

  showSuccessGoalFilter: boolean = false;
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
  isActionAreaItemsEmpty: boolean = false;
  isRiskAreaEmpty: boolean = false;
  isIssueAreaEmpty: boolean = false;
  actionItemHigh: any;
  actionItemMedium: any;
  actionItemLow: any;

  isIssuesEmpty: boolean = false;
  issueHigh: string;
  issueMedium: string;
  issueLow: string;

  totalIssues: number = 0;
  totalRisks: number = 0;
  dueRisks: number = 0;
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
  @ViewChild('mySel') projectSelect: MatSelect;
  showkpitrendbygoal: boolean = false;
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
  projectToStart: number = 0;
  projectToEnd: number = 0;
  teamSize: any[];
  pmCount: number = 0;
  qualityCount: number = 0;
  memberCount: number = 0;
  requestObj: GlobalKPIRequest = new GlobalKPIRequest();
  globaL_KPI_CATEGORY_IDs: number[] = [];
  processedData: any[] = [];
  selectedPeriod: string = 'Current Period';
  selectedQPeriod: string = "CP";
  gaugeData: any[] = [];
  needControl = [];
  underControl = [];
  params = new accountHealthParams();
  startDate = new Date();
  endDate = new Date();
  fromDate = new Date();
  toDate = new Date();
  lblfromDate: string;
  lbltoDate: string;
  @Input('customerId') customerId: string;
  @Input('projId') projID: string[];
  @Input('portfolioId') portID: number[];
  Customer: any[];
  custId: any;
  custName: any;
  Project: any[];
  projId: any;
  qStartMonth: string;
  qEndMonth: string;
  CSGYTMScore: number = 0;
  CSGLastQtrScore: number = 0;
  qStartDate: Date;
  qEndDate: Date;
  qStartYear: number;
  qEndYear: number;
  Year: any;
  projIds: any[];
  customerSuccessGoalScore: any = 0;
  showCustomersuccessgoalkpiperformance: boolean = false;
  showActionitemsViewdetails: boolean = false;
  showRiskIssueViewdetails: boolean = false;
  showContractStatusViewdetails: boolean = false;
  kpiId: any;
  goalName: any;
  overallActionItemData: any;
  actionItemsData: any;
  riskData: any;
  overallRiskData: any;

  constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _shared: SharedService,
    public _dashboardUtil: CSMDashboardService, private route: ActivatedRoute, private _router: Router,
    public _access: AccessControl, private _appservice: AppsService, public _util: myUtility,
    media: MediaMatcher, public dialog: MatDialog,
    public _chartsService: ChartsService, private _kpiTrendByGoalComponent: KPITrendByGoalComponent,
    private _customerSuccessGoalKPIPerformanceComponent: CustomerSuccessGoalKPIPerformanceComponent,
    private _riskIssueViewdetailsComponent: RiskIssueViewdetailsComponent) {

  }
  chartType = 'PieChart';
  typeR = 'PieChart';

  chartData = [
    ['Label', 'Value'],
    ['Progress', 75],
    ['Remaining', 25]
  ];

  chartOptions = {
    pieHole: 0.5,
    pieStartAngle: -90,
    pieEndAngle: 90,
    pieSliceTextStyle: {
      color: 'white'
    },
    slices: {
      0: {
        color: 'green'
      },
      1: {
        color: 'lightgray'
      }
    },
    legend: {
      position: 'none'
    }
  };
  chartWidth = 400;
  chartHeight = 200;

  ngOnInit() {
    if (this._cooDashboardCommon.selectedCustomerID != undefined && this._cooDashboardCommon.selectedCustomerID != "") {
      this._cooDashboardCommon.progressPopup = false;
      this.projIds = [];
      this.selectedCustomerName = this._cooDashboardCommon.selectedCustomerName;
      this.Year = new Date().getFullYear();
      //this.Year = this._cooDashboardCommon.dashboardStartdate.getFullYear();
      this.changeDates();
      this.service_GetDashboardDetails();
      this.service_getActionItems(this._cooDashboardCommon.selectedCustomerID)
      this.GetProjectForecast(this._cooDashboardCommon.selectedCustomerID);
    }
  }

  ngOnChanges() {
    let currentdate = new Date();
    let month = currentdate.getMonth();
    if (month >= 3)
      this.financialYearRange = currentdate.getFullYear().toString().substr(2) + '-' + (currentdate.getFullYear() + 1).toString().substr(2);
    else
      this.financialYearRange = (currentdate.getFullYear() - 1).toString().substr(2) + '-' + currentdate.getFullYear().toString().substr(2);
  }


  auditsbystatus: any[];
  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  changflagPath() {
    this._appservice.KpiCalledFromNewDashboard = true;
    if (window.location.pathname.indexOf("csm-dashboard") > -1) {
      this._util.btnCalledFromNewCSMDashboard = true;
    }
    else {
      this._util.btnCalledFromNewCSMDashboard = false;
    }
  }

  ngOnDestroy(): void {
    //this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  //Timer --------------------------
  fillerNav = Array(50).fill(0).map((_, i) => `Nav Item ${i + 1}`);

  getDataForStaffingSummary() {
    var datas = [];

    let row1 = {
      status: 'OFFSHORE',
      count: +this.getTitleByCustomer('OFFSHORE_TOTAL')
    }
    datas.push(row1);
    let row2 = {
      status: 'ONSITE',
      count: +this.getTitleByCustomer('ONSITE_TOTAL')
    }
    datas.push(row2);

    //this.data2 = datas;  
  }

  closeNav() {
    this.showSuccessGoalFilter = false;
  }

  closePopup(popupName: string) {
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
    return this._util.IsPremier(this._cooDashboardCommon.selectedCustomerID);
    if (this._cooDashboardCommon.selectedCustomerID == "202100062")
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
      this.service_GetDashboardDetails();
    }, error => {
      this.progress = false;
      this._util.serviceError(error);
    });
  }

  service_getAchievementsByCustomerSuccessGoal() {
    this._cooDashboardCommon.progressPopup = true;
    this._cooDashboardService.getAchievementsByCustomerSuccessGoal(this.projIds, this.qStartDate, this.qEndDate).subscribe(data => {
      this._cooDashboardCommon.progressPopup = false;
      this._cooDashboardCommon.achievementsByCustomerSuccessGoal = data;
    }, error => { this._util.serviceError(error); },
      () => {
      }
    );
  }


  clearData() {
    this._cooDashboardCommon.achievementsByCustomerSuccessGoal = [];
    this.customerSuccessGoalScore = 0;
    this.CSGLastQtrScore = 0;
    this.CSGYTMScore = 0;
    this._cooDashboardCommon.KPIPerspectives = [];
  }
  applyFilter() {
    //this.getProjectsFromProjectsByCustID();
    // this.loadGauge(); 
    this.clearData();
    this.getSuccessGoalScore();
    this.getLastQuarterandYTM();
    this.getKPIPerspectives();
    this.service_getAchievementsByCustomerSuccessGoal();
    // this.service_GetDashboardDetails();
    // this.getCurrentPreviousQuarter('currPeriod');
    this.loadTeamCountChart();
    this.filterActionItems1();
    //this.loadSuccessBar();
    this.loadActionItemArea();
    this.loadRiskItemArea();
    this.loadIssueItemArea();
    this.filterIssues1();
    this.filterRisks1();
    this.filterProjecttoStart();
    this.filterProjecttoEnd();

    //this.filterProjectStatus1();
    this.filterIdeasAndInnovation1();
    this.filterStaffingAndBillingSummary1();
    this.fillQAAuditStatus1();
    this.fillQAFindingsSummary1();
    this.fillQAFindingsByTime1();
    this.fillQAFindingsByStage1();
  }
  getCurrentPreviousQuarter(value) {
    var today = new Date(),
      quarter = Math.floor((today.getMonth() / 3));

    switch (value) {
      case "lastQuarter":
        this.startDate = new Date(today.getFullYear(), quarter * 3 - 3, 1);
        this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 3, 0);
        this.fromDate = this.startDate;
        this.toDate = this.endDate;
        this.lblfromDate = this.fromDate.toDateString();
        this.lbltoDate = this.toDate.toDateString();
        break;
      //default:
      case "currPeriod":
        this.startDate = new Date(today.getFullYear(), quarter * 3, 1);
        this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 3, 0);
        this.fromDate = this.startDate;
        this.toDate = this.endDate;
        this.lblfromDate = this.fromDate.toDateString();
        this.lbltoDate = this.toDate.toDateString();
        break;
    }

    // return {
    //     StartDate: this.startDate,
    //     EndDate: this.endDate
    // };
  }


  performanceBar: string;
  qualityBar: string;
  compilanceBar: string;
  valueBar: string
  selectedPeriod_OnChange() {
    this.getCurrentPreviousQuarter(this.selectedPeriod)
  }

  periodSelectionChange(event) {
    //this.getCurrentPreviousQuarter(event);
    this.lblfromDate = new Date(this.fromDate).toDateString();
    this.lbltoDate = new Date(this.toDate).toDateString();
    //this.loadGauge();
    //this.loadSuccessBar();
    //this.loadSuccessGoalForPeriod(this.reset, new Date(this.fromDate).toDateString(), new Date(this.toDate).toDateString());
  }
  projCount: number = 0;
  portCount: number = 0;
  OntabChange(index) {
    if (index == 0) {
      this.healthData = [];
      this.projCount = this.needControl.filter(x => x.projecT_COUNT)[0].projecT_COUNT;
      this.portCount = this.needControl.filter(x => x.portfoliO_COUNT)[0].portfoliO_COUNT;

      this.healthData.push(['Project', this.projCount]);
      this.healthData.push(['Portfolio', this.portCount]);
    }

    else if (index == 1) {
      this.healthData = [];
      this.projCount = this.underControl.filter(x => x.projecT_COUNT)[0].projecT_COUNT;
      this.portCount = this.underControl.filter(x => x.portfoliO_COUNT)[0].portfoliO_COUNT;

      this.healthData.push(['Project', this.projCount]);
      this.healthData.push(['Portfolio', this.portCount]);
    }
  }
  actionItemArea: any[] = [];
  riskItemArea: any[] = [];
  issueItemArea: any[] = [];
  dataArea1: any[] = [];


  service_getActionItems(custId) {
    this._appservice.getActionItemsDetails(custId, true, 1).subscribe(
      data => {
        this.overallActionItemData = data;
        if (this.overallActionItemData != null && this.overallActionItemData != undefined) {
          this.actionItemsData = this.overallActionItemData.filter(x => x.status == 'Planned' || x.status == 'Started' || x.status == 'Identified')
        }

        let DUE_FOR_CLOSURE = this.actionItemsData.filter(x => x.statuS_TYPE == "DUE_FOR_CLOSURE");
        let PAST_DUE_DATE = this.actionItemsData.filter(x => x.statuS_TYPE == "PAST_DUE_DATE");

        this.data6 = [];
        this.data6.push(["Due for closure", DUE_FOR_CLOSURE.length]);
        this.data6.push(["Past due date", PAST_DUE_DATE.length]);

        this.actionItemHigh = this.actionItemsData.filter(x => x.priority == "High");
        this.actionItemMedium = this.actionItemsData.filter(x => x.priority == "Medium");
        this.actionItemLow = this.actionItemsData.filter(x => x.priority == "Low");
      },
      error => { },
      () => {
      });
  }

  loadActionItemArea() {
    this._cooDashboardService.getActionitemsForProjects(this._cooDashboardCommon.LoadParams(), this.projIds).subscribe(data => {
      // this.dataArea1 = [];
      this.actionItemArea = data;
      this.isActionAreaItemsEmpty = false;
      if (this.actionItemArea.length > 0) {
        this.isActionAreaItemsEmpty = true;
        for (var row of this.actionItemArea) {
          this.dataArea1.push([row.montH_NAME, row.status]);
        }
      }
    }), error => { this._util.serviceError(error); }
  }

  loadRiskItemArea() {
    this._cooDashboardService.getRisksForProjects(this._cooDashboardCommon.LoadParams(), this.projIds).subscribe(data => {
      this.riskDataArea = [];
      this.riskItemArea = data;
      this.isRiskAreaEmpty = false;
      if (this.riskItemArea.length > 0) {
        this.isRiskAreaEmpty = true;
        for (var row of this.riskItemArea) {
          this.riskDataArea.push([row.montH_NAME, row.status]);
        }
      }
      this.loadRiskHeatMap();
    }), error => { this._util.serviceError(error); }
  }

  loadIssueItemArea() {
    this._cooDashboardService.getIssuesForProjects(this._cooDashboardCommon.LoadParams(), this.projIds).subscribe(data => {
      this.issueDataArea = [];
      this.issueItemArea = data;
      this.isIssueAreaEmpty = false;
      if (this.issueItemArea.length > 0) {
        this.isIssueAreaEmpty = true;
        for (var row of this.issueItemArea) {
          this.issueDataArea.push([row.montH_NAME, row.status]);
        }
      }
    }), error => { this._util.serviceError(error); }
  }

  getProjectsFromProjectsByCustID() {
    this.changeDates();
    if (this.projIds.length > 0) {
      this.applyFilter();
    }
    else {
      let p = this._cooDashboardCommon.getUniqueProject(this._cooDashboardCommon.selectedCustomerID.split(","));
      if (p != null) {
        this.projIds = p.map(x => x.proJ_ID);
        this._cooDashboardCommon.selectedprojIds = this.projIds;
        this.applyFilter();
      }
      else {
        this._cooDashboardService.getProjectsFromProjectsByCustID(this._cooDashboardCommon.LoadParams(), this._cooDashboardCommon.selectedCustomerID).subscribe(data => {
          this.projIds = data; this.projID = this.projIds;
          this._cooDashboardCommon.selectedprojIds = this.projIds;
          this.applyFilter();
        }), error => { this._util.serviceError(error); }
      }
    }
  }
  loadTeamCountChart() {
    this._cooDashboardService.getProjectTeamCountForProjects(this._cooDashboardCommon.LoadParams(), this.projIds).subscribe(data1 => {
      this.teamSize = data1;
      this.filterProjectCount();
    }), error => { this._util.serviceError(error); }

  }
  fillQAFindingsByStage1() {
    let findingsTitle = [];
    // let result = ["STAGE_FINDING_AUDITEE_ACCEPTANCE AND CAP SUBMISSION", "STAGE_FINDING_CAP REVIEW", "STAGE_FINDING_IMPLEMENT CAP", "STAGE_FINDING_VERIFY CAP IMPLEMENTATION"];
    let result = [];
    this.projID.forEach(x => {
      findingsTitle = this.getTitlesByString('STAGE_FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);

    let valuesArray = [0];

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projID.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projID[j]);
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

  getDataForselectedQPeriod(qtr) {
    this.selectedQPeriod = qtr;
    if (qtr == "CP")
      this.selectedPeriod = "Current Period";
    else if (qtr == "LQ")
      this.selectedPeriod = "Last Quarter";
    else if (qtr == "YT")
      this.selectedPeriod = "Year To Date";
    this.changeDates();
    this.getKPIPerspectives();
    this.getSuccessGoalScore();
    this.service_getAchievementsByCustomerSuccessGoal();
    this.getLastQuarterandYTM();
  }
  getSuccessGoalScore() {
    this._cooDashboardCommon.progress = true;
    this._cooDashboardService.getSuccessGoalScore(this.projIds, this.qStartDate, this.qEndDate).subscribe(data => {
      this._cooDashboardCommon.progress = false;
      this.customerSuccessGoalScore = data;
    }, error => {
      this._cooDashboardCommon.progress = false;
      this._util.serviceError(error);
    });
  }
  getKPIPerspectives() {
    this._cooDashboardService.getKPIPerspectives(this.projIds, this.qStartDate, this.qEndDate).subscribe(data => {
      this._cooDashboardCommon.KPIPerspectives = data;
    }, error => {
      //  this._cooDashboardService.progress = false;
      this._util.serviceError(error);
    });
  }

  getLastQuarterandYTM() {
    let lqtr = "Q" + this._util.getPreviuosQuarter();
    if (this.selectedQPeriod == "LQ")
      lqtr = this._util.getLastQuarterOf(lqtr);
    let year = this.Year;
    if (lqtr == "Q4" || lqtr == "Q3") year = this.Year - 1;
    let dates = this._util.getDatesForPeriod(lqtr, year);
    let qStartDate = this._util.setLocaleDate(dates.startDate);
    let qEndDate = this._util.setLocaleDate(dates.endDate);
    this._cooDashboardService.getSuccessGoalScore(this.projIds, qStartDate, qEndDate).subscribe(data => {
      this.CSGLastQtrScore = data;
    }, error => {
      this._util.serviceError(error);
    });
    if (this.selectedQPeriod != "YT") {
      dates = this._util.getDatesForPeriod("YT", this.Year);
      qStartDate = this._util.setLocaleDate(dates.startDate);
      qEndDate = this._util.setLocaleDate(dates.endDate);
      this._cooDashboardService.getSuccessGoalScore(this.projIds, qStartDate, qEndDate).subscribe(data => {
        this.CSGYTMScore = data;
      }, error => {
        this._util.serviceError(error);
      });
    }
  }

  changeDates() {
    let dates = this._util.getDatesForQuarter(this.selectedQPeriod, this.Year)
    this.qStartDate = this._util.setLocaleDate(dates.startDate);
    this.qEndDate = this._util.setLocaleDate(dates.endDate);
    this.qStartYear = this.qStartDate.getFullYear();
    this.qEndYear = this.qEndDate.getFullYear();
    this.qStartMonth = this._util.getMonthAbr(this.qStartDate.getMonth());
    this.qEndMonth = this._util.getMonthAbr(this.qEndDate.getMonth());
  }



  fillQAFindingsByTime1() {
    let result = ["TIME_FINDING_WEEK1", "TIME_FINDING_WEEK2", "TIME_FINDING_WEEK3", "TIME_FINDING_WEEK4"];
    let valuesArray = [0];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projID.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projID[j]);
      }
    }
    let rejectcount: number = 0;

    for (let j = 0; j < this.projID.length; j++) {
      rejectcount += this.getGraphValue_project('TIME_FINDING_REJECT', this.projID[j]);
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
    this.projID.forEach(x => {
      findingsTitle = this.getTitlesByString('FINDING_', x);
      result = result.concat(findingsTitle);
    });

    result = result.filter((x, i, a) => a.indexOf(x) === i);
    var valuesArray = [0];

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < this.projID.length; j++) {
        if (isNaN(valuesArray[i]))
          valuesArray[i] = 0;

        valuesArray[i] += this.getGraphValue_project(result[i], this.projID[j]);
      }
    }



    this.findingdata = [];
    var title = "";
    for (let i = 0; i < result.length; i++) {
      title = result[i].substr(8);
      title = title.charAt(0) + title.substr(1).toLowerCase();
      this.findingdata.push([title, valuesArray[i]]);
    }
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

    this.projID.forEach(x => {
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

  filterStaffingAndBillingSummary1() {
    if (this.projID.length == 0) {
      this.fillGraphStaffSummaryPie();
      this.fillGraphBillingSummaryColumn();
      return;
    }

    let offshoreTotal = 0;
    let onsiteTotal = 0;
    let onsiteBillable = 0;
    let onsiteNonBillable = 0;
    let offshoreBillable = 0;
    let offshoreNonBillable = 0;

    this.projID.forEach(x => {
      offshoreTotal = offshoreTotal + this.getGraphValue_project('OFFSHORE_TOTAL', x);
      onsiteTotal = onsiteTotal + this.getGraphValue_project('ONSITE_TOTAL', x);
      onsiteBillable = onsiteBillable + this.getGraphValue_project('ONSITE_BILLABLE', x);
      onsiteNonBillable = onsiteNonBillable + this.getGraphValue_project('ONSITE_NON_BILLABLE', x);
      offshoreBillable = offshoreBillable + this.getGraphValue_project('OFFSHORE_BILLABLE', x);
      onsiteBillable = onsiteBillable + this.getGraphValue_project('OFFSHORE_NON_BILLABLE', x);
    });

    this.data2 = [];
    this.data2.push(["Offshore", offshoreTotal]);
    this.data2.push(["Onsite", onsiteTotal]);

    this.data3 = [];
    this.data3.push([
      "Non-Billable",
      onsiteNonBillable,
      onsiteNonBillable,
      offshoreNonBillable,
      offshoreNonBillable]);
    this.data3.push([
      "Billable",
      onsiteBillable,
      onsiteBillable,
      offshoreBillable,
      offshoreBillable]);
  }

  filterIdeasAndInnovation1() {
    if (this.projID.length == 0) {
      this.fillGraphIdeasColumn();
      return;
    }

    let Completed = 0;
    let Inprogress = 0;
    let idea = 0;
    let innovation = 0;
    let automation = 0;
    let hoursSaved = 0;
    let effortSaved = 0;

    this.projID.forEach(x => {
      Completed = Completed + this.getGraphValue_project('IDEAS_COMPLETED', x);
      Inprogress = Inprogress + this.getGraphValue_project('IDEAS_INPROGRESS', x);
      idea = idea + this.getGraphValue_project('IDEAS', x);
      innovation = innovation + this.getGraphValue_project('IDEAS_INNOVATIONS', x)
      automation = automation + this.getGraphValue_project('IDEAS_AUTOMATIONS', x)
      hoursSaved = hoursSaved + this.getGraphValue_project('IDEAS_HOURS', x)
      effortSaved = effortSaved + this.getGraphValue_project('IDEAS_DOLLARS', x);
    });

    this.data1 = [];
    this.data1.push([
      "Completed",
      Completed,
      Completed,
      '#3ab376'
    ]);
    this.data1.push([
      "In Progress",
      Inprogress,
      Inprogress,
      '#ff6f00'
    ]);

    this.ideasCount = idea.toString();
    this.innovationCount = innovation.toString();
    this.automationCount = automation.toString();

    if (hoursSaved != 0)
      this.hoursSaved = hoursSaved.toString() + " hrs";
    else
      this.hoursSaved = "-";

    if (effortSaved != 0)
      this.effortSaved = "$" + effortSaved.toString() + "k";
    else
      this.effortSaved = "-";
  }


  // filterProjectStatus1() {
  //   if (this.projID.length == 0) {
  //     this.fillGraphProjectStatusSemicircleDonoughtChart();
  //     return;
  //   }
  //   this.totalProjects = 0;
  //   let data1 = 0;
  //   let data2 = 0;

  //   this.projID.forEach(x => {
  //     data1 = data1 + this.getGraphValue_project('PROJECT_TO_START', x);
  //     data2 = data2 + this.getGraphValue_project('PROJECT_TO_END', x);
  //   });

  //   this.totalProjects = data1 + data2;

  //   if (this.totalProjects == 0)
  //     this.isProjectStatusEmpty = true;
  //   else
  //     this.isProjectStatusEmpty = false;

  //   this.data5 = [];
  //   this.data5.push(["Projects to start", data1]);
  //   this.data5.push(["Projects to end", data2]);
  //   this.data5.push([null, this.totalProjects]);
  // }

  filterActionItems1() {

    this.totalActionItems = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    this.projID.forEach(x => {
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

    this.actionItemHigh = high.toString();
    this.actionItemMedium = medium.toString();
    this.actionItemLow = low.toString();
  }

  filterIssues1() {
    if (this.projID.length == 0) {
      this.fillGraphIssuesCircleDonoughtChart();
      return;
    }
    this.totalIssues = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    this.projID.forEach(x => {
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
    // this.dataI.push([null, this.totalIssues]);

    this.issueHigh = high.toString();
    this.issueMedium = medium.toString();
    this.issueLow = low.toString();
  }

  filterRisks1() {
    if (this.projID.length == 0) {
      this.fillGraphRisksCircleDonoughtChart();
      return;
    }

    this.totalRisks = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    this.projID.forEach(x => {
      data1 = data1 + this.getGraphValue_project('RISKS_PAST_DUE_DATE', x);
      data2 = data2 + this.getGraphValue_project('RISKS_DUE_FOR_CLOSURE', x);
      high = high + this.getGraphValue_project('RISKS_HIGH', x);
      medium = medium + this.getGraphValue_project('RISKS_MEDIUM', x);
      low = low + this.getGraphValue_project('RISKS_LOW', x);
    });
    this.dueRisks = data2;
    this.totalRisks = data1 + data2;

    if (this.totalRisks == 0)
      this.isRisksEmpty = true;
    else
      this.isRisksEmpty = false;

    this.dataR = [];
    this.dataR.push(["Due for closure", data2]);
    this.dataR.push(["Past due date", data1]);
    //this.dataR.push([null, this.totalRisks]);

    this.riskHigh = high.toString();
    this.riskMedium = medium.toString();
    this.riskLow = low.toString();
  }


  filterPortfolioWise(portfolioid: number) {
    this.filterActionItems(portfolioid);
    this.filterIssues(portfolioid);
    this.filterRisks(portfolioid);
    this.filterProjectStatus(portfolioid);
    this.filterIdeasAndInnovation(portfolioid);
    this.filterStaffingAndBillingSummary(portfolioid);
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
      //this.data6.push([null, this.totalActionItems]);

      this.actionItemHigh = this.getGraphValue_portfolio('ACTION_ITEM_HIGH', id).toString();
      this.actionItemMedium = this.getGraphValue_portfolio('ACTION_ITEM_MEDIUM', id).toString();
      this.actionItemLow = this.getGraphValue_portfolio('ACTION_ITEM_LOW', id).toString();
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

      // this.dataI.push([null, this.totalIssues]);
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

      // this.dataR.push([null, this.totalRisks]);
      this.riskHigh = this.getGraphValue_portfolio('RISKS_HIGH', id).toString();
      this.riskMedium = this.getGraphValue_portfolio('RISKS_MEDIUM', id).toString();
      this.riskLow = this.getGraphValue_portfolio('RISKS_LOW', id).toString();
    }
    else {
      this.fillGraphRisksCircleDonoughtChart();
    }
  }

  filterProjectStatus(id) {
    if (id != 0) {
      this.data5 = [];
      let data1 = this.getGraphValue_portfolio('PROJECT_TO_START', id);
      let data2 = this.getGraphValue_portfolio('PROJECT_TO_END', id);
      this.data5.push(["Projects to start", data1]);
      this.data5.push(["Projects to end", data2]);
      this.totalProjects = data1 + data2;
      this.isProjectStatusEmpty = this.totalProjects == 0 ? true : false;
      this.data5.push([null, this.totalProjects]);
    }
    else {
      this.fillGraphProjectStatusSemicircleDonoughtChart();
    }
  }

  filterIdeasAndInnovation(id) {
    if (id != 0) {
      this.data1 = [];
      this.data1.push([
        "Completed",
        this.getGraphValue_portfolio('IDEAS_COMPLETED', id),
        this.getGraphValue_portfolio('IDEAS_COMPLETED', id),
        '#3ab376'
      ]);
      this.data1.push([
        "In Progress",
        this.getGraphValue_portfolio('IDEAS_INPROGRESS', id),
        this.getGraphValue_portfolio('IDEAS_INPROGRESS', id),
        '#ff6f00'
      ]);

      this.ideasCount = this.getTitleByPortfolio('IDEAS', id);
      this.automationCount = this.getTitleByPortfolio('IDEAS_AUTOMATIONS', id);
      this.innovationCount = this.getTitleByPortfolio('IDEAS_INNOVATIONS', id);
      this.improvementsCount = this.getTitleByPortfolio('IDEAS_IMPROVEMENTS', id);
      this.hoursSaved = this.getTitleByPortfolio('IDEAS_HOURS', id);
      this.effortSaved = this.getTitleByPortfolio('IDEAS_DOLLARS', id);
    }
    else {
      this.fillGraphIdeasColumn();
    }
  }

  filterStaffingAndBillingSummary(id) {
    if (id != 0) {
      this.data2 = [];
      this.data2.push(["Offshore", this.getGraphValue_portfolio('OFFSHORE_TOTAL', id)]);
      this.data2.push(["Onsite", this.getGraphValue_portfolio('ONSITE_TOTAL', id)]);

      this.data3 = [];
      this.data3.push([
        "Non-Billable",
        this.getGraphValue_portfolio('ONSITE_NON_BILLABLE', id),
        this.getGraphValue_portfolio('ONSITE_NON_BILLABLE', id),
        this.getGraphValue_portfolio('OFFSHORE_NON_BILLABLE', id),
        this.getGraphValue_portfolio('OFFSHORE_NON_BILLABLE', id)]);
      this.data3.push([
        "Billable",
        this.getGraphValue_portfolio('ONSITE_BILLABLE', id),
        this.getGraphValue_portfolio('ONSITE_BILLABLE', id),
        this.getGraphValue_portfolio('OFFSHORE_BILLABLE', id),
        this.getGraphValue_portfolio('OFFSHORE_BILLABLE', id)]);
    }
    else {
      this.fillGraphStaffSummaryPie();
      this.fillGraphBillingSummaryColumn();
    }
  }
  service_LoadCustomerByEmpId() {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      if (this.customerList.length > 0) {
        if (localStorage.getItem('selectedCustomer') != undefined) {
          this.selectedCustomer = this.customerList.filter(x => x.cusT_ID.toString() == localStorage.getItem('selectedCustomer'))[0];
          this.customerId = localStorage.getItem('selectedCustomer');
        }
        else {
          this.selectedCustomer = this.customerList[0];
          this.customerId = this._cooDashboardCommon.selectedCustomerID;
        }
      }
    });
  }
  // service_LoadCustomerByEmpIdByCustomerId(customerid) {
  //   this._appservice.GetCustomerList(localStorage.getItem('empid')).subscribe(data => {
  //     this.customerList = data;

  //     if (this.customerList.length > 0) {

  //       this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerid)[0];
  //       this.customerId = this._cooDashboardService.selectedCustomerID;

  //       // this.service_GetDashboardDetails();
  //       // this.getCurrentPreviousQuarter('currPeriod');
  //       //this.loadSuccessGoalForPeriod(this.reset, this.fromDate.toDateString(), this.toDate.toDateString());
  //     }
  //   }, error => { this._util.serviceError(error); });
  // }


  service_GetDashboardDetails() {
    this._appservice.GetDashboardDetailsbyCustomerId(this._cooDashboardCommon.selectedCustomerID).subscribe(data => {
      this.dashboardDetails = data;
      this.fillGraphDetails();
    }, () => {
    });
  }
  getTitleByCustomer(title) {
    let content: string = '';

    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      //details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == null && t.portfoliO_ID == null);
      details = this.dashboardDetails.filter(t => t.title == title);

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

  filterProjectCount() {
    this.pmCount = 0;
    this.qualityCount = 0;
    this.memberCount = 0;
    if (this.teamSize.length > 0) {
      this.projID.forEach(x => {
        this.pmCount = this.pmCount + this.getproject_TeamCount('Project Manager', x);
        this.qualityCount = this.qualityCount + this.getproject_TeamCount('Quality', x);
        this.memberCount = this.memberCount + this.getproject_TeamCount('Team Member', x);
      });
    }
  }
  getproject_TeamCount(title, x) {
    let content: number = 0;
    if (this.teamSize != undefined) {
      let details: any[] = [];

      details = this.teamSize.filter(t => t.peoplE_TYPE == title && t.proJ_ID == x);
      if (details.length > 0) {
        content = details[0].membeR_COUNT;
      }
    }

    return content;

  }
  filterProjecttoStart() {
    this.projectToStart = 0;
    this.projID.forEach(x => {
      this.projectToStart = this.projectToStart + this.getGraphValue_project('PROJECT_TO_START', x);

    });
    return this.projectToStart;
  }
  filterProjecttoEnd() {
    this.projectToEnd = 0;
    this.projID.forEach(x => {
      this.projectToEnd = this.projectToEnd + this.getGraphValue_project('PROJECT_TO_END', x);

    });
    return this.projectToEnd;
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
  getColorByPortfolio(title, portfolio) {
    let content: string = '-';
    if (this.dashboardDetails != undefined) {
      let details: DashboardDetailsModel[] = [];
      details = this.dashboardDetails.filter(t => t.title == title && t.portfoliO_ID == portfolio);
      if (details.length > 0) {
        content = details[0].color;
      }
    }

    if (this.healthScoresColor != undefined) {
      content = this.healthScoresOverall.filter(x => x.portfoliO_ID == portfolio)[0].healtH_SCORE;
      return content;
      if (title == "OVERALL_HEALTH" && portfolio == 1)
        content = this.healthScoresColor[0].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 2)
        content = this.healthScoresColor[1].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 3)
        content = this.healthScoresColor[2].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 4)
        content = this.healthScoresColor[3].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 5)
        content = this.healthScoresColor[4].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 6)
        content = this.healthScoresColor[5].healtH_SCORE;
      else if (title == "OVERALL_HEALTH" && portfolio == 99)
        content = this.healthScoresColor[6].healtH_SCORE;
    }

    return content;
  }

  showKPINotesForCustomer(custid) {
    this._appservice.getNotesForCustomer(custid)
      .subscribe
      (
        data => {
          this.notes = data;
          this.notes.sort((x, y): number => {
            if (x.publisH_DATE > y.publisH_DATE) return -1;
            if (x.publisH_DATE < y.publisH_DATE) return 1;
            return 0;
          });
          this.openKPINotes();
        }
        ,
        error => {
          this._util.serviceError(error);
        }
      );
  }

  openKPINotes() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'notes': this.notes,
      'custid': this._cooDashboardCommon.selectedCustomerID
    },
      dialogConfig.maxWidth = "100%";
    dialogConfig.height = "100%";
    dialogConfig.width = "100vw";
    dialogConfig.panelClass = "myPanel";
    const dialogRef = this.dialog.open(AddNotesComponent, dialogConfig);

  }

  showRiskDetails(custid) {
    this._appservice.getRiskByCustomerId(custid).subscribe(
      data => {
        this.riskList = data;
        this.openRiskDialog();
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }

  showIssuesDetails(custid) {
    this._appservice.getIssuesByCustomerId(custid).subscribe(
      data => {
        this.issueList = data;
        this.openIssuesDialog();
      },
      error => {
        this._util.serviceError(error);
      }
    )
  }



  openIdeasDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'ideas': this.ideasdata
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
  }

  openActionItemsDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'actionitems': this.actionItemsData
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
  }

  openIssuesDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'issues': this.issueList
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
  }

  openRiskDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'risk': this.riskList
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
  }

  GetProjectForecast(custid) {
    this._appservice.getProjectForeCastForCustomer(custid).subscribe(
      data => {
        if (data != null) {
          if (this._shared.selectedProjects.length > 0) {
            this.projectforecast = {};
            this.projectforecast.projectend = [];
            this.projectforecast.projectstart = [];
            this.projectforecast.projresrc = [];

            this._shared.selectedProjects.forEach(element => {
              this.projectforecast.projectend.push(...data.projectend.filter(p => p.proJ_ID === element));//"INT-FIN-Accounts Payable";
              this.projectforecast.projectstart.push(...data.projectstart.filter(p => p.proJ_ID === element));//this._shared.selectedProjects);
              this.projectforecast.projresrc.push(...data.projresrc.filter(p => p.proJ_ID === element));//this._shared.selectedProjects);
            });
          }
          else {
            this.projectforecast = data;
          }
        }
      },
      error => {
        this._util.serviceError(error);
      }
    );
  }

  openProjectStatusdialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'projectStatus': this.projectforecast,
      'custName': this.selectedCustomerName
    },
      dialogConfig.maxWidth = "90%"
    dialogConfig.height = "90%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(ProjectStatusComponent, dialogConfig);
  }

  openStaffingSummarydialog(custid) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      'custid': custid
    },
      dialogConfig.autoFocus = true;
    dialogConfig.maxWidth = "90%";
    dialogConfig.height = "90%";
    dialogConfig.width = "100vw";

    const dialogRef = this.dialog.open(StaffingSummaryComponent, dialogConfig);
  }

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
  showcsgkpiperformance(goalId) {
    this.showCustomersuccessgoalkpiperformance = !this.showCustomersuccessgoalkpiperformance;
    this._customerSuccessGoalKPIPerformanceComponent.GetCustomersuccessKPIPerformance(this.projIds, this._cooDashboardCommon.dashboardStartdate, this._cooDashboardCommon.dashboardEnddate, goalId);
  }

  showActionitemsViewdetailsPopup() {
    this.openActionItemdialog();
  }

  showRiskViewdetailsPopup() {
    this.openRiskDetailsdialog();
  }

  showIssueViewdetailsPopup() {
    this.openIssueDetailsdialog();
  }

  showContractStatusViewdetailsPopup() {
    this.openProjectStatusdialog();
  }

  openActionItemdialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'custId': this._cooDashboardCommon.selectedCustomerID
    },
      dialogConfig.maxWidth = "90%"
    dialogConfig.height = "90%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(ActionItemsPageComponent, dialogConfig);
  }

  openRiskDetailsdialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'custId': this._cooDashboardCommon.selectedCustomerID
    },
      dialogConfig.maxWidth = "90%"
    dialogConfig.height = "90%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(RiskPageComponent, dialogConfig);
  }

  openIssueDetailsdialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'custId': this._cooDashboardCommon.selectedCustomerID
    },
      dialogConfig.maxWidth = "90%"
    dialogConfig.height = "90%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(IssuesPageComponent, dialogConfig);
  }

  showkpitrendbygoalpopup(kpiId, goalName) {
    this.kpiId = kpiId;
    this.goalName = goalName;
    this._cooDashboardCommon.showkpitrendbygoal = !this._cooDashboardCommon.showkpitrendbygoal;
    this._kpiTrendByGoalComponent.getTrendHighChartDetails();
  }
  fillGraphDetails() {
    this.projID = this.projIds;
    if (this.projID != undefined && this.projID.length > 0)
      this.applyFilter();
    else {
      this.getProjectsFromProjectsByCustID();
      // this.loadActionItemArea();
      // this.loadRiskItemArea();
      // this.loadIssueItemArea();
      // this.filterProjecttoStart();
      // this.filterProjecttoEnd();

      // this.fillGraphIdeasColumn();
      // this.fillGraphStaffSummaryPie();
      // this.fillGraphBillingSummaryColumn();
      // this.fillGraphProjectStatusSemicircleDonoughtChart();
      // this.fillGraphActionsItemsCircleDonoughtChart();
      // this.fillGraphIssuesCircleDonoughtChart();
      // this.fillGraphRisksCircleDonoughtChart();
      // this.fillGraphCleverQualitySemicircleDonoughtChart();
      // this.fillQAAuditStatus();
      // this.fillQAFindingsSummary();
      // this.fillQAFindingsByTime();
      // this.fillQAFindingsByStage();
      // this.fillQAOverallComplianceScore();
      // this.fillQAComplianceScoreByProcessModel();
    }
  }

  fillQAComplianceScoreByProcessModel() {
    let titles = []
    titles = this.gettitlesbystringForCustomer('COMPLIANCE_SCORE_', this._cooDashboardCommon.selectedCustomerID);
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
    titles = this.gettitlesbystringForCustomer('STAGE_FINDING_', this._cooDashboardCommon.selectedCustomerID);
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
    titles = this.gettitlesbystringForCustomer('FINDING_', this._cooDashboardCommon.selectedCustomerID);
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

  gaugeType = 'Gauge';
  gaugeWidth = 220;
  gaugeHeight = 140;
  gaugeColumn = ['Label', 'Value'];
  //gaugeData = [['Goal',0]];
  gaugeOptions = {

    chartArea: { 'width': '100%', 'height': '100%', right: 0 },
    alignment: 'centre',
    tooltip: { trigger: 'selection' },
    minorTicks: 10,
    majorTicks: ['0', '25', '50', '75', '100']
  };

  type1 = 'ColumnChart';
  width1 = 180;
  height1 = 110;
  columnNames1 = ['status', 'Total', { 'role': 'annotation' }, { 'role': 'style' }]
  data1 = [
    ['Completed', 0, '0', '#3ab376'],
    ['In Progress', 0, '0', '#ff6f00'],
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

  healthPie = 'PieChart';
  healthData: any[] = [];
  healthColumn = ['Title', 'value1'];
  healthWidth = 350;
  healthHeight = 121;
  healthOptions: google.visualization.PieChartOptions = {
    backgroundColor: { fill: 'transparent' },
    pieHole: 0.7,
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


  typefindingBytime = 'PieChart';
  findingdatatime: any[] = [];
  columfindingtime = ['Status', 'Value'];
  widthfindingtime = 170;
  heightfindingtime = 85;
  optionfindingtime: google.visualization.PieChartOptions = {
    // colors: ['#54b8e8', '#ff6f00', '#3ab376', 'red'],
    chartArea: { 'width': '100%', 'height': '80%', 'left': 0 },

    legend: {
      position: 'right', alignment: 'center'
    },
    tooltip: { trigger: 'selection' },
    //pieSliceBorderColor: 'transparent',
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 10 },
  };

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


  passedPosition: google.visualization.ChartLegendPosition = 'right';
  type5 = 'PieChart';
  width5 = 170;
  height5 = 85;
  columnNames5 = ['status', 'count'];
  data5 = [
    ['Projects to start', 0],
    ['Projects to end', 0],
    [null, 50]
  ];
  options5: google.visualization.PieChartOptions
    = {
      legend: {
        position: this.passedPosition,
        alignment:
          'center',
      },
      pieHole: 0.7,
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
  width6 = 320;
  height6 = 90;
  columnNames6 =
    ['status', 'count'];
  //  data6 = [
  //    ['Due for closure', 20],
  //    ['Past due date', 30]
  //  ];
  data6 = [
    ['Due for closure', 0],
    ['Past due date', 0]
  ];
  options6: google.visualization.PieChartOptions = {
    backgroundColor: { fill: 'transparent' },
    pieHole: 0.7,
    legend: {
      position: 'right',
      alignment: 'center'
    },
    titleTextStyle:
    {
      fontSize: 15,
      color: '#535d85',
      fontName: 'Helvetica Neue'
    },
    //pieStartAngle: 270,
    //colors: ['#3ab376', '#ff0109'],
    colors: ['#B0F4A9', '#FF7979'],
    sliceVisibilityThreshold: 0,
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9, color: '#000000' },
    chartArea: {
      'width': '100%', 'height': '100%', 'bottom': 0, 'top': 0
    },
    tooltip: { trigger: 'none' },
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
    //this.data6.push([null, this.totalActionItems]);

    this.actionItemHigh = this.getTitleByCustomer('ACTION_ITEM_HIGH');
    this.actionItemMedium = this.getTitleByCustomer('ACTION_ITEM_MEDIUM');
    this.actionItemLow = this.getTitleByCustomer('ACTION_ITEM_LOW');

  }

  typeArea1 = 'AreaChart';
  AreaWidth1 = 150;
  AreaHeight1 = 70;
  //dataArea1 = [["",20],["",20],["",20],["",20],["",20],["",20]];

  columnNamesArea1 = ['montH_NAME', 'status'];
  optionsArea1: google.visualization.AreaChartOptions = {
    backgroundColor: { fill: 'transparent' }
  };

  riskTypeArea = 'AreaChart';
  riskAreaWidth = 150;
  riskAreaHeight = 70;
  riskDataArea = [["", 20], ["", 20], ["", 20], ["", 20], ["", 20], ["", 20]];

  riskColumnNamesArea = ['montH_NAME', 'status'];
  riskOptionsArea: google.visualization.AreaChartOptions = {
    backgroundColor: { fill: 'transparent' },
    colors: ['#FEE8ED']
  };

  issueTypeArea = 'AreaChart';
  issueAreaWidth = 150;
  issueAreaHeight = 70;
  issueDataArea = [["", 20], ["", 20], ["", 20], ["", 20], ["", 20], ["", 20]];

  issueColumnNamesArea = ['montH_NAME', 'status'];
  issueOptionsArea: google.visualization.AreaChartOptions = {
    backgroundColor: { fill: 'transparent' }
  };

  typeI = 'PieChart';
  widthI = 301;
  heightI = 90;
  columnNamesI =
    ['status', 'count'];
  dataI = [
    ['Due for closure', 0],
    ['Past due date', 0],
    //[null, 50],
  ];
  optionsI: google.visualization.PieChartOptions = {
    backgroundColor: { fill: 'transparent' },
    pieHole: 0.7,
    legend: {
      position: 'right',
      alignment: 'center'
    },
    titleTextStyle:
    {
      fontSize: 15,
      color: '#535d85',
      fontName: 'Helvetica Neue'
    },
    //pieStartAngle: 270,
    //colors: ['#3ab376', '#ff0109'],
    colors: ['#B0F4A9', '#FF7979'],
    sliceVisibilityThreshold: 0,
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9, color: '#000000' },
    chartArea: {
      'width': '100%', 'height': '100%', 'bottom': 0, 'top': 0
    },
    tooltip: { trigger: 'none' },
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

    //  this.dataI.push([null, this.totalIssues]);
    this.issueHigh = this.getTitleByCustomer('ISSUES_HIGH');
    this.issueMedium = this.getTitleByCustomer('ISSUES_MEDIUM');
    this.issueLow = this.getTitleByCustomer('ISSUES_LOW');
  }
  widthR = 320;
  heightR = 90;
  columnNamesR =
    ['status', 'count'];
  dataR = [
    ['Due for closure', 0],
    ['Past due date', 0]
    //[null, 50],
  ];
  optionsR: google.visualization.PieChartOptions = {
    backgroundColor: { fill: 'transparent' },
    pieHole: 0.7,
    legend: {
      position: 'right',
      alignment: 'center'
    },
    titleTextStyle:
    {
      fontSize: 15,
      color: '#535d85',
      fontName: 'Helvetica Neue'
    },
    //pieStartAngle: 270,
    //colors: ['#3ab376', '#ff0109'],
    colors: ['#B0F4A9', '#FF7979'],
    sliceVisibilityThreshold: 0,
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9, color: '#000000' },
    chartArea: {
      'width': '100%', 'height': '100%', 'bottom': 0, 'top': 0
    },
    tooltip: { trigger: 'none' },
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
    //  this.dataR.push([null, this.totalRisks]);

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
      width: 40,
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
    pieHole: 0.7,
    legend: 'none',
    colors: ['#3ab376', '#ff6f00'],
    chartArea: { 'width': '100%', 'height': '80%', top: 6, bottom: 2 },
  };

  loadRiskHeatMap() {
    this._util.GetCharts(this.customerId, this.projIds);
  }
  openKPItrendScreen() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'custid': this._cooDashboardCommon.selectedCustomerID,
      'projids': this.projID
    },
      dialogConfig.maxWidth = "75%";
    dialogConfig.height = "85%";
    dialogConfig.width = "75%";
    const dialogRef = this.dialog.open(KPITrendComponent, dialogConfig);
  }


  openRiskPopUp() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'input': this._util.chartsMonthly.riskChart.data,
      'customerId': this._cooDashboardCommon.selectedCustomerID

    },
      dialogConfig.maxWidth = "75%";
    dialogConfig.height = "259px";
    dialogConfig.width = "403px";
    dialogConfig.panelClass = 'riskHeatMap';
    dialogConfig.position = {
      'top': '380px',
      'left': '76px'
    }
    const dialogRef = this.dialog.open(RiskchartComponent, dialogConfig);
  }

  openIssuePopUp() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'input': this._util.chartsMonthly.riskChart.data,
      'customerId': this._cooDashboardCommon.selectedCustomerID
    },
      dialogConfig.maxWidth = "75%";
    dialogConfig.height = "259px";
    dialogConfig.width = "403px";
    dialogConfig.panelClass = 'riskHeatMap';
    dialogConfig.position = {
      'top': '380px',
      'left': '76px'
    }
    //const dialogRef = this.dialog.open(IssueProgressStatusComponent, dialogConfig);
  }

  onClose() {
    this.showViewDashboard = !this.showViewDashboard;
  }
}
class accountHealthParams {
  month: number;
  year: number;
  projIds: string[];
}



import { Component, OnInit, Output, ViewChild, EventEmitter, NgModule } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { myUtility } from '../../../../Shared/myUtility';
import { AppsService } from '../../../../Services/apps.service';
import { LayoutService } from '../../../layout/layout.service';
import { COODashboardService } from '../../coo-dashboard.service';
import { MatOption, MatSelect } from '@angular/material';
import { ProjectModelNew } from '../../../../models/portfolio-model';
import { Chart, ChartModule } from 'angular-highcharts';
import { DateSelectionModel } from '../../../../models/DateSelection-model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { COODashboardComponent } from '../../coo-dashboard.component';
import { DashboardSearchParams, NameValuePair } from '../../../../models/coo-dashboard-model';
import { forEach } from '@angular/router/src/utils/collection';
import { AccountHealthViewdetailsComponent } from '../../dashboard-controls/account-health-viewdetails/account-health-viewdetails.component';
import { OverallHealthTrendComponent } from '../../dashboard-controls/overall-health-trend/overall-health-trend.component';
import { EILSEQ } from 'constants';
import { Top3PerformingComponent } from '../../dashboard-controls/top3-performing/top3-performing.component';
import { CSSViewdetailsComponent } from '../../dashboard-controls/css-viewdetails/css-viewdetails.component';
import { CustomerSuccessGoalKPIPerformanceComponent } from '../../dashboard-controls/customersuccessgoal-kpiperformance/customersuccessgoal-kpiperformance.component';
import { debugOutputAstAsTypeScript } from '@angular/compiler';
import { COODashboardCommon } from '../../coo-dashboard-common';



@Component({
  selector: 'app-overall-status-page1',
  templateUrl: './overall-status-page1.component.html',
  styleUrls: ['./overall-status-page1.component.scss']
})
export class OverallStatusPage1Component implements OnInit {
  NonPerformData: {}[];
  performData: { Accounts: NameValuePair[]; Portfolios: NameValuePair[]; Projects: NameValuePair[]; }[];
  performDataAccounts: NameValuePair[];
  performDataPortfolios: NameValuePair[];
  performDataProjects: NameValuePair[];
  nonPerformDataAccounts: NameValuePair[];
  nonPerformDataPortfolios: NameValuePair[];
  nonPerformDataProjects: NameValuePair[];
  isSlidingupVisible: boolean = false;
  isHealthTrendVisible: boolean = false;
  isAccountHealthViewdetailsVisible: boolean = false;
  showCustomersuccessgoalkpiperformance: boolean = false;
  donutChart: Chart;
  columnChart: Chart;
  loadDonutIp: string = "UC";
  progress: boolean;
  earlyWarningSignalCount: any;
  overallHealthIndex: any;
  selectedQPeriod: string = "Q1";
  Year = this._util.Year();
  qStartMonth = "";
  qEndMonth = "";
  qStartYear = 0;
  qEndYear = 0;
  CSGLastQtrScore = 0;
  CSGYTMScore = 0;
  private _dataModel: DashboardSearchParams = new DashboardSearchParams();
  accountOverallHealth: any;
  qStartDate: Date;
  qEndDate: Date;
  top3Performing: string = "P";
  customerSuccessGoalScore: any;
  showCSSViewdetails: boolean = false;
  cssNpsChangeStr: string = "0% decrease";
  top3Performingcss: string = "P";
  showViewDashboard: boolean;
  constructor(public _cooDashboardService: COODashboardService, public _cooDashboardCommon: COODashboardCommon, public _util: myUtility, private _accountHealthViewdetailsComponent: AccountHealthViewdetailsComponent
    , private _overallHealthTrendComponent: OverallHealthTrendComponent
    , private _top3PerformingComponent: Top3PerformingComponent, private _cssViewdetailsComponent: CSSViewdetailsComponent,
    private _customerSuccessGoalKPIPerformanceComponent: CustomerSuccessGoalKPIPerformanceComponent) {

  }
  ngOnInit() {
    this.qEndYear = this.Year;
    this.qStartYear = this.Year;
    this._cooDashboardCommon.selectedQPeriodCsg = "Q" + this._util.getCurrentQuarter();
    this.changeDates();
    this.CSGLastQtrScore = 0;
    this.CSGYTMScore = 0;
    this._cooDashboardCommon.LastQtrScore = 0;
    this._cooDashboardCommon.YTMScore = 0;
    this._cooDashboardCommon.customerSuccessGoalScore = 0;
    this.initDonut();
  }

  getAccountOverallHealth() {
    this._cooDashboardCommon.loadDonutIp = "UC";
    this.top3Performing = "P";
    this._cooDashboardCommon.progress = true;
    this._cooDashboardService.getOverallAccountHealth(this._cooDashboardCommon.LoadParams()).subscribe(data => {
      this._cooDashboardCommon.progress = false;
      this._cooDashboardCommon.accountOverallHealth = data;
      this._cooDashboardCommon.customerSuccessGoalScore = this._cooDashboardCommon.accountOverallHealth.overalL_SCORE;
      this.customerSuccessGoalScore = this._cooDashboardCommon.accountOverallHealth.overalL_SCORE;
      this._cooDashboardCommon.overallHealthIndex = this._cooDashboardCommon.accountOverallHealth.overalL_SCORE;
      this.getLastQuarterandYTM();

      let performDataAccounts = [];
      let performDataPortfolios = [];
      let performDataProjects = [];
      let nonPerformDataAccounts = [];
      let nonPerformDataPortfolios = [];
      let nonPerformDataProjects = [];
      let custd = this._cooDashboardCommon.accountOverallHealth.cusT_KPIS;
      custd.forEach(function (value) {
        if (value.score == 100) {
          performDataAccounts.push(new NameValuePair(value.cusT_NAME, value.score));
        }
        else {
          nonPerformDataAccounts.push(new NameValuePair(value.cusT_NAME, value.score));
        }
      });
      let portd = this._cooDashboardCommon.accountOverallHealth.portfoliO_KPIS;
      portd.forEach(function (value) {
        if (value.score == 100) {
          performDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.score));
        }
        else {
          nonPerformDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.score));
        }
      });
      let projd = this._cooDashboardCommon.accountOverallHealth.projecT_KPIS;
      projd.forEach(function (value) {
        if (value.score == 100) {
          performDataProjects.push(new NameValuePair(value.proJ_NAME, value.score));
        }
        else {
          nonPerformDataProjects.push(new NameValuePair(value.proJ_NAME, value.score));
        }
      });
      this._cooDashboardCommon.performDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts), true);// this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts));// performDataAccounts.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this._cooDashboardCommon.performDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataPortfolios), true);
      this._cooDashboardCommon.performDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataProjects), true); //performDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this._cooDashboardCommon.nonPerformDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataAccounts));  //nonPerformDataAccounts.sort((n1, n2) => { return n1.value - n2.value; })//;.slice(0, 3);
      this._cooDashboardCommon.nonPerformDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataPortfolios)); // nonPerformDataPortfolios.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this._cooDashboardCommon.nonPerformDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataProjects)); // nonPerformDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);

      this.performDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts), true);// this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts));// performDataAccounts.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this.performDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataPortfolios), true);
      this.performDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataProjects), true); //performDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this.nonPerformDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataAccounts));  //nonPerformDataAccounts.sort((n1, n2) => { return n1.value - n2.value; })//;.slice(0, 3);
      this.nonPerformDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataPortfolios)); // nonPerformDataPortfolios.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this.nonPerformDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataProjects)); // nonPerformDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);

      this.ontop3PerformingChange(this.top3Performing);
      this.loadDonutData(this._cooDashboardCommon.loadDonutIp);
    }, error => {
      this._cooDashboardCommon.progress = false;
      this._util.serviceError(error);
    });
  }


  async getAccountOverallHealthForPeriod(qStartDate, qEndDate) {
    this._cooDashboardCommon.progress = true;
    this._cooDashboardService.getAccountOverallHealthForPeriod(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
      this._cooDashboardCommon.progress = false;
      this.top3Performing = "P";
      this.accountOverallHealth = data;
      let performDataAccounts = [];
      let performDataPortfolios = [];
      let performDataProjects = [];
      let nonPerformDataAccounts = [];
      let nonPerformDataPortfolios = [];
      let nonPerformDataProjects = [];
      let custd = this.accountOverallHealth.cusT_KPIS;
      custd.forEach(function (value) {
        if (value.score == 100) {
          performDataAccounts.push(new NameValuePair(value.cusT_NAME, value.score));
        }
        else {
          nonPerformDataAccounts.push(new NameValuePair(value.cusT_NAME, value.score));
        }
      });
      let portd = this.accountOverallHealth.portfoliO_KPIS;
      portd.forEach(function (value) {
        if (value.score == 100) {
          performDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.score));
        }
        else {
          nonPerformDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.score));
        }
      });
      let projd = this.accountOverallHealth.projecT_KPIS;
      projd.forEach(function (value) {
        if (value.score == 100) {
          performDataProjects.push(new NameValuePair(value.proJ_NAME, value.score));
        }
        else {
          nonPerformDataProjects.push(new NameValuePair(value.proJ_NAME, value.score));
        }
      });
      this.performDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts), true);// this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataAccounts));// performDataAccounts.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this.performDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataPortfolios), true);
      this.performDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(performDataProjects), true); //performDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this.nonPerformDataAccounts = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataAccounts));  //nonPerformDataAccounts.sort((n1, n2) => { return n1.value - n2.value; })//;.slice(0, 3);
      this.nonPerformDataPortfolios = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataPortfolios)); // nonPerformDataPortfolios.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);
      this.nonPerformDataProjects = this._cooDashboardCommon.sortData(this._cooDashboardCommon.groupData(nonPerformDataProjects)); // nonPerformDataProjects.sort((n1, n2) => { return n1.value - n2.value; });//.slice(0, 3);

      this.ontop3PerformingChange(this.top3Performing);
    }, error => {
      this._cooDashboardCommon.progress = false;
      this._util.serviceError(error);
    });
  }
  showCSSViewdetailspopup() {
    this.showCSSViewdetails = !this.showCSSViewdetails;
    this._cssViewdetailsComponent.getcustomerSuccessSurvey();
  }
  getEarlyWarningSignalCount() {
    this._cooDashboardService.getEarlyWarningSignalCount(this._cooDashboardCommon.LoadParams()).subscribe(data => {
      this._cooDashboardCommon.earlyWarningSignalCount = data;
    }, error => {
      this._util.serviceError(error);
    });
  }
  showcsgkpiperformance(goalId = 0) {
    this.showCustomersuccessgoalkpiperformance = !this.showCustomersuccessgoalkpiperformance;
    this._customerSuccessGoalKPIPerformanceComponent.GetCustomersuccessKPIPerformance(this._cooDashboardCommon.projectIds, this._cooDashboardCommon.dashboardStartdate, this._cooDashboardCommon.dashboardEnddate, goalId);
  }
  async getKPIPerspectives(qStartDate, qEndDate) {
    this.Year = qStartDate.getFullYear();
    if (this._cooDashboardCommon.selectedQPeriodCsg == "Q4") this.Year = this.Year - 1;
    this._cooDashboardCommon.selectedYearCsg = this.Year;
    this._cooDashboardCommon.selectedYearCss = this._cooDashboardCommon.selectedYearCsg;
    this.changeDates();
    this._cooDashboardService.getKPIPerspectives(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
      this._cooDashboardCommon.KPIPerspectives = data;
    }, error => {
      this._util.serviceError(error);
    });
  }

  async getCustomerSuccessSurvey(qStartDate, qEndDate) {
    this._cooDashboardService.getCSSTableForProjects(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
      this._cooDashboardCommon.customerSuccessSurvey = data;
      this.top3Performingcss = "P";
      this._top3PerformingComponent.loaddata("CustomerSuccessSurvey");
      let lqtr = this._util.getLastQuarterOf(this._util.getQuarter(this.qEndDate.getMonth()));
      let year = this.qEndDate.getFullYear();
      if (lqtr == "Q4") year = year - 1;
      let dates = this._util.getDatesForQuarter(lqtr, year);

      let qStartDate = this._util.setLocaleDate(dates.startDate);
      let qEndDate = this._util.setLocaleDate(dates.endDate);
      this.getPreviousCSSNPSScoreForProjects(qStartDate, qEndDate);
    }, error => {
      this._util.serviceError(error);
    });
  }
  getCustomerSuccessSurveyForDates(qStartDate, qEndDate) {
    this._cooDashboardService.getCSSTableForProjects(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
      this._cooDashboardCommon.customerSuccessSurvey = data;
      this.top3Performingcss = "P";
      this._top3PerformingComponent.loaddata("CustomerSuccessSurvey");
      let lqtr = this._util.getLastQuarterOf(this._util.getQuarter(qEndDate.getMonth()));
      let year = qStartDate.getFullYear();
      if (lqtr == "Q4" || lqtr == "Q3") year = year - 1;
      let dates = this._util.getDatesForQuarter(lqtr, year);
      qStartDate = this._util.setLocaleDate(dates.startDate);
      qEndDate = this._util.setLocaleDate(dates.endDate);
      this.getPreviousCSSNPSScoreForProjects(qStartDate, qEndDate);
    }, error => {
      this._util.serviceError(error);
    });
  }
  getPreviousCSSNPSScoreForProjects(qStartDate, qEndDate) {
    this._cooDashboardService.getCSSNPSScoreForProjects(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
      let preveNPS = data;
      this.cssNpsChangeStr = this._cooDashboardCommon.getChangeInScore(this._cooDashboardCommon.customerSuccessSurvey.csaT_SUMMARY.npS_SCORE, preveNPS)
    }, error => {
      this._util.serviceError(error);
    });
  }
  changeDates() {
    let dates = this._util.getDatesForQuarter(this._cooDashboardCommon.selectedQPeriodCsg, this._cooDashboardCommon.selectedYearCsg)
    this.qStartDate = this._util.setLocaleDate(dates.startDate);
    this.qEndDate = this._util.setLocaleDate(dates.endDate);
    this.qStartYear = this.qStartDate.getFullYear();
    this.qEndYear = this.qEndDate.getFullYear();
    this.qStartMonth = this._util.getMonthAbr(this.qStartDate.getMonth());
    this.qEndMonth = this._util.getMonthAbr(this.qEndDate.getMonth());
  }

  getOverallHealthIndex() {
    this._cooDashboardService.getOverallHealthIndex(this._cooDashboardCommon.LoadParams()).subscribe(data => {
      this._cooDashboardCommon.overallHealthIndex = data;
      this._cooDashboardCommon.customerSuccessGoalScore = this._cooDashboardCommon.overallHealthIndex;
    }, error => {
      this._util.serviceError(error);
    });
  }
  bindOverallHealthIndex() {
    let sum: number = 0;
    if (this._cooDashboardCommon.accountOverallHealth.length > 0) {
      this._cooDashboardCommon.accountOverallHealth.forEach(a => sum += a.score);
      this._cooDashboardCommon.overallHealthIndex = Math.round(sum / this._cooDashboardCommon.accountOverallHealth.length);
    }
    else {
      this._cooDashboardCommon.overallHealthIndex = 0;
    }
    this._cooDashboardCommon.customerSuccessGoalScore = this._cooDashboardCommon.overallHealthIndex;
  }
  LoadTop3PerformerData() {
    this._cooDashboardCommon.top3Accounts = this.nonPerformDataAccounts;
    this._cooDashboardCommon.top3Portfolios = this.nonPerformDataPortfolios;
    this._cooDashboardCommon.top3Projects = this.nonPerformDataProjects;
  }
  getLastQuarterandYTM() {
    let lqtr = this._util.getLastQuarterOf(this._cooDashboardCommon.selectedQPeriodCsg);
    let year = this._cooDashboardCommon.selectedYearCsg;
    if (lqtr == "Q4") year = year - 1;
    let dates = this._util.getDatesForQuarter(lqtr, year);
    let qStartDate = this._util.setLocaleDate(dates.startDate);
    let qEndDate = this._util.setLocaleDate(dates.endDate);
    if (this._cooDashboardCommon.selectedQPeriodCsg != "YT") {
      this._cooDashboardService.getSuccessGoalScore(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
        this.CSGLastQtrScore = data;
        this._cooDashboardCommon.LastQtrScore = data;
        this.getChangeInScore();
      }, error => {
        this._util.serviceError(error);
      });
    }
    else {
      this.CSGLastQtrScore = 0;
      this._cooDashboardCommon.LastQtrScore = 0;
      this.getChangeInScore();
    }
    dates = this._util.getDatesForQuarter("YT", year);
    qStartDate = this._util.setLocaleDate(dates.startDate);
    qEndDate = this._util.setLocaleDate(dates.endDate);
    this._cooDashboardService.getSuccessGoalScore(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
      this.CSGYTMScore = data;
      this._cooDashboardCommon.YTMScore = data;
    }, error => {
      this._util.serviceError(error);
    });
  }
  getChangeInScore() {
    this._cooDashboardCommon.csgLastQtrChangeText = this._cooDashboardCommon.getChangeInScore(this.customerSuccessGoalScore, this.CSGLastQtrScore);
    this._cooDashboardCommon.kpiLastQtrChangeText = this._cooDashboardCommon.csgLastQtrChangeText;
  }
  OntabChange() {

  }
  EwsSlideup() {
    this.isSlidingupVisible = !this.isSlidingupVisible;
  }
  openOverallHealth() {
    this.isHealthTrendVisible = !this.isHealthTrendVisible;
    this._overallHealthTrendComponent.getOverallHealthIndexTrend();
  }
  openAccountHealthViewdetails() {
    this.isAccountHealthViewdetailsVisible = !this.isAccountHealthViewdetailsVisible;
    this._accountHealthViewdetailsComponent.getAccountOverallHealth();
  }
  ontop3PerformingChange(event) {
    this.top3Performing = event;
    this._cooDashboardCommon.top3AccountsCsg = [];
    this._cooDashboardCommon.top3PortfoliosCsg = [];
    this._cooDashboardCommon.top3ProjectsCsg = [];
    if (this.top3Performing == "P") {
      if (this._cooDashboardCommon.performDataAccounts != undefined && this._cooDashboardCommon.performDataAccounts != null)
        this._cooDashboardCommon.top3AccountsCsg = this._cooDashboardCommon.performDataAccounts.slice(0, 3);
      if (this._cooDashboardCommon.performDataPortfolios != undefined && this._cooDashboardCommon.performDataPortfolios != null)
        this._cooDashboardCommon.top3PortfoliosCsg = this._cooDashboardCommon.performDataPortfolios.slice(0, 3);
      if (this._cooDashboardCommon.performDataProjects != undefined && this._cooDashboardCommon.performDataProjects != null)
        this._cooDashboardCommon.top3ProjectsCsg = this._cooDashboardCommon.performDataProjects.slice(0, 3);
    }
    else {
      if (this._cooDashboardCommon.nonPerformDataAccounts != undefined && this._cooDashboardCommon.nonPerformDataAccounts != null)
        this._cooDashboardCommon.top3AccountsCsg = this._cooDashboardCommon.nonPerformDataAccounts.slice(0, 3);
      if (this._cooDashboardCommon.nonPerformDataPortfolios != undefined && this._cooDashboardCommon.nonPerformDataPortfolios != null)
        this._cooDashboardCommon.top3PortfoliosCsg = this._cooDashboardCommon.nonPerformDataPortfolios.slice(0, 3);
      if (this._cooDashboardCommon.nonPerformDataProjects != undefined && this._cooDashboardCommon.nonPerformDataProjects != null)
        this._cooDashboardCommon.top3ProjectsCsg = this._cooDashboardCommon.nonPerformDataProjects.slice(0, 3);
    }
  }
  getDataForselectedQPeriod(qtr) {
    this._cooDashboardCommon.selectedQPeriodCsg = qtr;
    this.changeDates();
    this.getKPIPerspectives(this.qStartDate, this.qEndDate);
    this.getSuccessGoalScore(this.qStartDate, this.qEndDate);
    this.getAccountOverallHealthForPeriod(this.qStartDate, this.qEndDate);
    this.getEarlyWarningSignalCount();
  }

  async getSuccessGoalScore(qStartDate, qEndDate) {
    this._cooDashboardCommon.progress = true;
    this._cooDashboardService.getSuccessGoalScore(this._cooDashboardCommon.projectIds, qStartDate, qEndDate).subscribe(data => {
      this._cooDashboardCommon.progress = false;
      this.customerSuccessGoalScore = data;
      this._cooDashboardCommon.customerSuccessGoalScore = data;
      this.getLastQuarterandYTM();
    }, error => {
      this._cooDashboardCommon.progress = false;
      this._util.serviceError(error);
    });
  }

  getDataforSelectedQuarter(q: any, Year: any) {
    this._cooDashboardCommon.selectedQPeriodCsg = '';
    this._cooDashboardCommon.selectedYearCsg = Year;
    this.getDataForselectedQPeriod(q);
  }

  ViewBatch_onClick(element) {
    element = this._cooDashboardCommon.customersList.filter(x => x.cusT_NM.toLowerCase() == element.Name.toLowerCase())[0];
    this._cooDashboardCommon.selectedCustomerID = element.cusT_ID;
    this._cooDashboardCommon.selectedCustomerName = element.cusT_NM;
    this.showViewDashboard = !this.showViewDashboard;
  }
  initDonut() {
    const donut = new Chart({
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        marginLeft: 60
      },
      title: {
        text: '',
        align: 'center',
        verticalAlign: 'middle',
        y: 0,
      },
      tooltip: {
        pointFormat: ': <b>{point.y}</b>',
      },
      credits: {
        enabled: false,
      },

      legend: {
        enabled: true,
        verticalAlign: 'middle',
        align: 'center',
        width: 100,

        symbolHeight: 5,
        symbolPadding: 5,

        symbolWidth: 2,
        itemStyle: {
          color: '#333333',
          cursor: 'pointer',
          fontSize: '11px', fontWeight: '200',
          textOverflow: 'ellpsis',
        },
        labelFormat: '{y} {name} ',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
            distance: -50,
            style: {
              fontWeight: 'bold',
              color: 'white',
            },
          },
          startAngle: -90,
          endAngle: -180,
          center: ['20%', '50%'],
          size: '100%',
          showInLegend: true,
        },
      },
      series: [
        {
          name: '',
          data: this._cooDashboardCommon.nfucSummaryData,
          type: 'pie',
          innerSize: '80%',
        },
      ],
    });
    this._cooDashboardCommon.donutChart = donut;
  }
  loadDonutData(ip: string) {
    this._cooDashboardCommon.loadDonutIp = ip;
    if (ip == 'NF') {
      this._cooDashboardCommon.nfucSummaryData = [
        {
          name: 'Accounts',
          y: this._cooDashboardCommon.nonPerformDataAccounts.length,
          color: '#7192ff'
        },
        {
          name: 'Portfolios',
          y: this._cooDashboardCommon.nonPerformDataPortfolios.length, color: 'orange'
        }, {
          name: 'Projects',
          y: this._cooDashboardCommon.nonPerformDataProjects.length, color: '#88cafa'
        }];

      this._cooDashboardCommon.top3Accounts = this._cooDashboardCommon.nonPerformDataAccounts.slice(0, 3);
      this._cooDashboardCommon.top3Portfolios = this._cooDashboardCommon.nonPerformDataPortfolios.slice(0, 3);
      this._cooDashboardCommon.top3Projects = this._cooDashboardCommon.nonPerformDataProjects.slice(0, 3);
    }
    else {
      this._cooDashboardCommon.nfucSummaryData = [
        {
          name: 'Accounts',
          y: this._cooDashboardCommon.performDataAccounts.length,
          color: '#7192ff'
        },
        {
          name: 'Portfolios',
          y: this._cooDashboardCommon.performDataPortfolios.length, color: 'orange'
        }, {
          name: 'Projects',
          y: this._cooDashboardCommon.performDataProjects.length, color: '#88cafa'
        }];
      this._cooDashboardCommon.top3Accounts = this._cooDashboardCommon.performDataAccounts.slice(0, 3);
      this._cooDashboardCommon.top3Portfolios = this._cooDashboardCommon.performDataPortfolios.slice(0, 3);
      this._cooDashboardCommon.top3Projects = this._cooDashboardCommon.performDataProjects.slice(0, 3);
    }
    this.initDonut();
  }

}


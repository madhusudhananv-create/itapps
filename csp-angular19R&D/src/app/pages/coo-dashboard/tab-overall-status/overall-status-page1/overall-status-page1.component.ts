import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';
import { DashboardSearchParams, NameValuePair } from '../../../../models/coo-dashboard-model';
import { COODashboardService } from '../../../../services/coo-dashboard.service';
import { AppsService } from '../../../../services/apps.service';
import { CustomerSuccessgoalChartComponent } from '../../dashboard-controls/customer-successgoal-chart/customer-successgoal-chart.component';
import { KpiPerspectivesWidgetComponent } from '../../dashboard-controls/kpi-perspectives-widget/kpi-perspectives-widget.component';
import { CustomersuccessgoalKpiperformanceComponent } from '../../dashboard-controls/customersuccessgoal-kpiperformance/customersuccessgoal-kpiperformance.component';
import { CustomerSuccessSurveyComponent } from '../../dashboard-controls/customer-success-survey/customer-success-survey.component';
import { QuarterFilterComponent } from '../../dashboard-controls/quarter-filter/quarter-filter.component';
import { Top3PerformingComponent } from '../../dashboard-controls/top3-performing/top3-performing.component';

@Component({
  selector: 'app-overall-status-page1',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatTooltipModule,
    HighchartsChartComponent,
    CustomerSuccessgoalChartComponent,
    KpiPerspectivesWidgetComponent,
    CustomersuccessgoalKpiperformanceComponent,
    CustomerSuccessSurveyComponent,
    QuarterFilterComponent,
    Top3PerformingComponent
  ],
  templateUrl: './overall-status-page1.component.html',
  styleUrl: './overall-status-page1.component.scss'
})
export class OverallStatusPage1Component implements OnInit {
  NonPerformData: {}[] = [];
  performData: { Accounts: NameValuePair[]; Portfolios: NameValuePair[]; Projects: NameValuePair[]; }[] = [];
  performDataAccounts: NameValuePair[] = [];
  performDataPortfolios: NameValuePair[] = [];
  performDataProjects: NameValuePair[] = [];
  nonPerformDataAccounts: NameValuePair[] = [];
  nonPerformDataPortfolios: NameValuePair[] = [];
  nonPerformDataProjects: NameValuePair[] = [];
  
  isSlidingupVisible: boolean = false;
  isHealthTrendVisible: boolean = false;
  isAccountHealthViewdetailsVisible: boolean = false;
  showCustomersuccessgoalkpiperformance: boolean = false;
  
  donutChart!: Highcharts.Options;
  columnChart!: Highcharts.Options;
  loadDonutIp: string = 'UC';
  progress: boolean = false;
  earlyWarningSignalCount: any;
  overallHealthIndex: any;
  
  selectedQPeriod: string = 'Q1';
  Year: number = new Date().getFullYear();
  qStartMonth: string = '';
  qEndMonth: string = '';
  qStartYear: number = 0;
  qEndYear: number = 0;
  CSGLastQtrScore: number = 0;
  CSGYTMScore: number = 0;
  
  private _dataModel: DashboardSearchParams = new DashboardSearchParams();
  accountOverallHealth: any;
  qStartDate!: Date;
  qEndDate!: Date;
  top3Performing: string = 'P';
  customerSuccessGoalScore: any;
  showCSSViewdetails: boolean = false;
  cssNpsChangeStr: string = '0% decrease';
  top3Performingcss: string = 'P';
  showViewDashboard: boolean = false;

  public _cooDashboardCommon!: COODashboardCommon;

  constructor(
    private _coodashboardService: COODashboardService,
    private _appservice: AppsService
  ) {
    this._cooDashboardCommon = COODashboardCommon.GetInstance();
  }

  ngOnInit(): void {
    this.qEndYear = this.Year;
    this.qStartYear = this.Year;
    this._cooDashboardCommon.selectedQPeriodCsg = 'Q' + this.getCurrentQuarter();
    this.changeDates();
    this.CSGLastQtrScore = 0;
    this.CSGYTMScore = 0;
    this._cooDashboardCommon.LastQtrScore = 0;
    this._cooDashboardCommon.YTMScore = 0;
    this._cooDashboardCommon.customerSuccessGoalScore = 0;
    this.initDonut();
    
    // Do not load data here - it will be triggered from filter component
    // Data will load when filters are applied
  }
  
  /**
   * Load all dashboard data
   * Called from tab-overall-status when Apply button is clicked
   */
  loadDashboardData(): void {
    // Check if customerIds and projectIds are available
    if (!this._cooDashboardCommon.customerIds || this._cooDashboardCommon.customerIds.length === 0) {
      console.warn('Cannot load dashboard data: customerIds not set');
      return;
    }
    
    if (!this._cooDashboardCommon.projectIds || this._cooDashboardCommon.projectIds.length === 0) {
      console.warn('Cannot load dashboard data: projectIds not set');
      return;
    }
    
    // Update dates for current selection
    this.changeDates();
    
    // Load all dashboard widgets with proper date ranges
    this.getEarlyWarningSignalCount();
    this.getAccountOverallHealth();
    this.getKPIPerspectives(this.qStartDate, this.qEndDate);
    this.getSuccessGoalScore(this.qStartDate, this.qEndDate);
    this.getCustomerSuccessSurvey(this._cooDashboardCommon.dashboardStartdate, this._cooDashboardCommon.dashboardEnddate);
  }

  getCurrentQuarter(): number {
    const now = new Date();
    const month = now.getMonth() + 1;
    if (month >= 4 && month <= 6) return 1;
    else if (month >= 7 && month <= 9) return 2;
    else if (month >= 10 && month <= 12) return 3;
    else return 4;
  }

  getAccountOverallHealth(): void {
    this._cooDashboardCommon.loadDonutIp = 'UC';
    this.top3Performing = 'P';
    this._cooDashboardCommon.progress = true;
    
    this._coodashboardService.getOverallAccountHealth(this._cooDashboardCommon.LoadParams()).subscribe(
      (data: any) => {
        this._cooDashboardCommon.progress = false;
        this._cooDashboardCommon.accountOverallHealth = data;
        this._cooDashboardCommon.customerSuccessGoalScore = this._cooDashboardCommon.accountOverallHealth.overalL_SCORE;
        this.customerSuccessGoalScore = this._cooDashboardCommon.accountOverallHealth.overalL_SCORE;
        this._cooDashboardCommon.overallHealthIndex = this._cooDashboardCommon.accountOverallHealth.overalL_SCORE;
        this.getLastQuarterandYTM();

        this.processAccountHealthData(data);
        this.ontop3PerformingChange(this.top3Performing);
        this.loadDonutData(this._cooDashboardCommon.loadDonutIp);
      },
      (error: any) => {
        this._cooDashboardCommon.progress = false;
        console.error('Error loading account health:', error);
      }
    );
  }

  processAccountHealthData(data: any): void {
    let performDataAccounts: NameValuePair[] = [];
    let performDataPortfolios: NameValuePair[] = [];
    let performDataProjects: NameValuePair[] = [];
    let nonPerformDataAccounts: NameValuePair[] = [];
    let nonPerformDataPortfolios: NameValuePair[] = [];
    let nonPerformDataProjects: NameValuePair[] = [];

    // Process customers
    let custd = data.cusT_KPIS || [];
    custd.forEach((value: any) => {
      if (value.score == 100) {
        performDataAccounts.push(new NameValuePair(value.cusT_NAME, value.score));
      } else {
        nonPerformDataAccounts.push(new NameValuePair(value.cusT_NAME, value.score));
      }
    });

    // Process portfolios
    let portd = data.portfoliO_KPIS || [];
    portd.forEach((value: any) => {
      if (value.score == 100) {
        performDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.score));
      } else {
        nonPerformDataPortfolios.push(new NameValuePair(value.portfoliO_NAME, value.score));
      }
    });

    // Process projects
    let projd = data.projecT_KPIS || [];
    projd.forEach((value: any) => {
      if (value.score == 100) {
        performDataProjects.push(new NameValuePair(value.proJ_NAME, value.score));
      } else {
        nonPerformDataProjects.push(new NameValuePair(value.proJ_NAME, value.score));
      }
    });

    // Store sorted and grouped data
    this._cooDashboardCommon.performDataAccounts = this.sortData(this.groupData(performDataAccounts), true);
    this._cooDashboardCommon.performDataPortfolios = this.sortData(this.groupData(performDataPortfolios), true);
    this._cooDashboardCommon.performDataProjects = this.sortData(this.groupData(performDataProjects), true);
    this._cooDashboardCommon.nonPerformDataAccounts = this.sortData(this.groupData(nonPerformDataAccounts));
    this._cooDashboardCommon.nonPerformDataPortfolios = this.sortData(this.groupData(nonPerformDataPortfolios));
    this._cooDashboardCommon.nonPerformDataProjects = this.sortData(this.groupData(nonPerformDataProjects));

    this.performDataAccounts = this._cooDashboardCommon.performDataAccounts;
    this.performDataPortfolios = this._cooDashboardCommon.performDataPortfolios;
    this.performDataProjects = this._cooDashboardCommon.performDataProjects;
    this.nonPerformDataAccounts = this._cooDashboardCommon.nonPerformDataAccounts;
    this.nonPerformDataPortfolios = this._cooDashboardCommon.nonPerformDataPortfolios;
    this.nonPerformDataProjects = this._cooDashboardCommon.nonPerformDataProjects;
  }

  groupData(data: NameValuePair[]): NameValuePair[] {
    // Group data logic - placeholder for now
    return data;
  }

  sortData(data: NameValuePair[], descending: boolean = false): NameValuePair[] {
    return data.sort((a, b) => {
      return descending ? b.value - a.value : a.value - b.value;
    });
  }

  getEarlyWarningSignalCount(): void {
    this._coodashboardService.getEarlyWarningSignalCount(this._cooDashboardCommon.LoadParams()).subscribe(
      (data: any) => {
        this._cooDashboardCommon.earlyWarningSignalCount = data;
      },
      (error: any) => {
        console.error('Error loading early warning signals:', error);
      }
    );
  }

  getLastQuarterandYTM(): void {
    let lqtr = this.getLastQuarterOf(this._cooDashboardCommon.selectedQPeriodCsg);
    let year = this._cooDashboardCommon.selectedYearCsg;
    if (lqtr == 'Q4') year = year - 1;
    
    let dates = this.getDatesForQuarter(lqtr, year);
    let qStartDate = this.setLocaleDate(dates.startDate);
    let qEndDate = this.setLocaleDate(dates.endDate);
    
    if (this._cooDashboardCommon.selectedQPeriodCsg != 'YT') {
      this._coodashboardService.getSuccessGoalScore(
        this._cooDashboardCommon.projectIds,
        qStartDate,
        qEndDate
      ).subscribe(
        (data: any) => {
          this.CSGLastQtrScore = data;
          this._cooDashboardCommon.LastQtrScore = data;
          this.getChangeInScore();
        },
        (error: any) => {
          console.error('Error loading last quarter score:', error);
        }
      );
    } else {
      this.CSGLastQtrScore = 0;
      this._cooDashboardCommon.LastQtrScore = 0;
      this.getChangeInScore();
    }

    // Get YTM score
    dates = this.getDatesForQuarter('YT', year);
    qStartDate = this.setLocaleDate(dates.startDate);
    qEndDate = this.setLocaleDate(dates.endDate);
    
    this._coodashboardService.getSuccessGoalScore(
      this._cooDashboardCommon.projectIds,
      qStartDate,
      qEndDate
    ).subscribe(
      (data: any) => {
        this.CSGYTMScore = data;
        this._cooDashboardCommon.YTMScore = data;
      },
      (error: any) => {
        console.error('Error loading YTM score:', error);
      }
    );
  }

  getChangeInScore(): void {
    this._cooDashboardCommon.csgLastQtrChangeText = this.getChangeInScoreText(
      this.customerSuccessGoalScore,
      this.CSGLastQtrScore
    );
    this._cooDashboardCommon.kpiLastQtrChangeText = this._cooDashboardCommon.csgLastQtrChangeText;
  }

  getChangeInScoreText(currentScore: number, previousScore: number): string {
    if (previousScore === 0) return '0% change';
    let change = currentScore - previousScore;
    let percentChange = (change / previousScore) * 100;
    let direction = change >= 0 ? 'increase' : 'decrease';
    return `${Math.abs(percentChange).toFixed(1)}% ${direction}`;
  }

  changeDates(): void {
    let dates = this.getDatesForQuarter(
      this._cooDashboardCommon.selectedQPeriodCsg,
      this._cooDashboardCommon.selectedYearCsg
    );
    this.qStartDate = this.setLocaleDate(dates.startDate);
    this.qEndDate = this.setLocaleDate(dates.endDate);
    this.qStartYear = this.qStartDate.getFullYear();
    this.qEndYear = this.qEndDate.getFullYear();
    this.qStartMonth = this.getMonthAbr(this.qStartDate.getMonth());
    this.qEndMonth = this.getMonthAbr(this.qEndDate.getMonth());
  }

  getDatesForQuarter(quarter: string, year: number): { startDate: string; endDate: string } {
    // Fiscal quarters: Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
    const quarters: { [key: string]: { startDate: string; endDate: string } } = {
      'Q1': { startDate: `${year}-04-01`, endDate: `${year}-06-30` },
      'Q2': { startDate: `${year}-07-01`, endDate: `${year}-09-30` },
      'Q3': { startDate: `${year}-10-01`, endDate: `${year}-12-31` },
      'Q4': { startDate: `${year + 1}-01-01`, endDate: `${year + 1}-03-31` },
      'YT': { startDate: `${year}-04-01`, endDate: `${year + 1}-03-31` }
    };
    return quarters[quarter] || quarters['Q1'];
  }

  setLocaleDate(dateStr: string): Date {
    return new Date(dateStr);
  }

  getMonthAbr(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month] || 'Jan';
  }

  getLastQuarterOf(quarter: string): string {
    const quarters = { 'Q1': 'Q4', 'Q2': 'Q1', 'Q3': 'Q2', 'Q4': 'Q3', 'YT': 'Q4' };
    return quarters[quarter as keyof typeof quarters] || 'Q4';
  }

  getDataForselectedQPeriod(qtr: string): void {
    this._cooDashboardCommon.selectedQPeriodCsg = qtr;
    this.changeDates();
    this.getKPIPerspectives(this.qStartDate, this.qEndDate);
    this.getSuccessGoalScore(this.qStartDate, this.qEndDate);
    this.getAccountOverallHealthForPeriod(this.qStartDate, this.qEndDate);
    this.getEarlyWarningSignalCount();
  }

  getKPIPerspectives(qStartDate: Date, qEndDate: Date): void {
    this.Year = qStartDate.getFullYear();
    if (this._cooDashboardCommon.selectedQPeriodCsg == 'Q4') this.Year = this.Year - 1;
    this._cooDashboardCommon.selectedYearCsg = this.Year;
    this._cooDashboardCommon.selectedYearCss = this._cooDashboardCommon.selectedYearCsg;
    this.changeDates();
    
    this._coodashboardService.getKPIPerspectives(
      this._cooDashboardCommon.projectIds,
      qStartDate,
      qEndDate
    ).subscribe(
      (data: any) => {
        this._cooDashboardCommon.KPIPerspectives = data;
      },
      (error: any) => {
        console.error('Error loading KPI perspectives:', error);
      }
    );
  }

  getSuccessGoalScore(qStartDate: Date, qEndDate: Date): void {
    this._cooDashboardCommon.progress = true;
    this._coodashboardService.getSuccessGoalScore(
      this._cooDashboardCommon.projectIds,
      qStartDate,
      qEndDate
    ).subscribe(
      (data: any) => {
        this._cooDashboardCommon.progress = false;
        this.customerSuccessGoalScore = data;
        this._cooDashboardCommon.customerSuccessGoalScore = data;
        this.getLastQuarterandYTM();
      },
      (error: any) => {
        this._cooDashboardCommon.progress = false;
        console.error('Error loading success goal score:', error);
      }
    );
  }

  getAccountOverallHealthForPeriod(qStartDate: Date, qEndDate: Date): void {
    this._cooDashboardCommon.progress = true;
    this._coodashboardService.getAccountOverallHealthForPeriod(
      this._cooDashboardCommon.projectIds,
      qStartDate,
      qEndDate
    ).subscribe(
      (data: any) => {
        this._cooDashboardCommon.progress = false;
        this.top3Performing = 'P';
        this.accountOverallHealth = data;
        this.processAccountHealthData(data);
        this.ontop3PerformingChange(this.top3Performing);
      },
      (error: any) => {
        this._cooDashboardCommon.progress = false;
        console.error('Error loading account health for period:', error);
      }
    );
  }

  ontop3PerformingChange(event: string): void {
    this.top3Performing = event;
    this._cooDashboardCommon.top3AccountsCsg = [];
    this._cooDashboardCommon.top3PortfoliosCsg = [];
    this._cooDashboardCommon.top3ProjectsCsg = [];
    
    if (this.top3Performing == 'P') {
      if (this._cooDashboardCommon.performDataAccounts)
        this._cooDashboardCommon.top3AccountsCsg = this._cooDashboardCommon.performDataAccounts.slice(0, 3);
      if (this._cooDashboardCommon.performDataPortfolios)
        this._cooDashboardCommon.top3PortfoliosCsg = this._cooDashboardCommon.performDataPortfolios.slice(0, 3);
      if (this._cooDashboardCommon.performDataProjects)
        this._cooDashboardCommon.top3ProjectsCsg = this._cooDashboardCommon.performDataProjects.slice(0, 3);
    } else {
      if (this._cooDashboardCommon.nonPerformDataAccounts)
        this._cooDashboardCommon.top3AccountsCsg = this._cooDashboardCommon.nonPerformDataAccounts.slice(0, 3);
      if (this._cooDashboardCommon.nonPerformDataPortfolios)
        this._cooDashboardCommon.top3PortfoliosCsg = this._cooDashboardCommon.nonPerformDataPortfolios.slice(0, 3);
      if (this._cooDashboardCommon.nonPerformDataProjects)
        this._cooDashboardCommon.top3ProjectsCsg = this._cooDashboardCommon.nonPerformDataProjects.slice(0, 3);
    }
  }

  EwsSlideup(): void {
    this.isSlidingupVisible = !this.isSlidingupVisible;
  }

  openOverallHealth(): void {
    this.isHealthTrendVisible = !this.isHealthTrendVisible;
  }

  openAccountHealthViewdetails(): void {
    this.isAccountHealthViewdetailsVisible = !this.isAccountHealthViewdetailsVisible;
  }

  showcsgkpiperformance(goalId: number = 0): void {
    this.showCustomersuccessgoalkpiperformance = !this.showCustomersuccessgoalkpiperformance;
  }

  showCSSViewdetailspopup(): void {
    this.showCSSViewdetails = !this.showCSSViewdetails;
  }

  OntabChange(): void {
    // Tab change handler
  }

  ViewBatch_onClick(element: any): void {
    this._cooDashboardCommon.selectedCustomerName = element.Name;
    this.showViewDashboard = !this.showViewDashboard;
  }

  initDonut(): void {
    const donut: Highcharts.Options = {
      chart: {
        plotBackgroundColor: undefined,
        plotBorderWidth: 0,
        plotShadow: false,
        marginLeft: 60
      },
      title: {
        text: '',
        align: 'center',
        verticalAlign: 'middle',
        y: 0
      },
      tooltip: {
        pointFormat: ': <b>{point.y}</b>'
      },
      credits: {
        enabled: false
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
          fontSize: '11px',
          fontWeight: '200',
          textOverflow: 'ellipsis'
        },
        labelFormat: '{y} {name} '
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
              color: 'white'
            }
          },
          startAngle: -90,
          endAngle: -180,
          center: ['20%', '50%'],
          size: '100%',
          showInLegend: true
        }
      },
      series: [
        {
          name: '',
          data: this._cooDashboardCommon.nfucSummaryData,
          type: 'pie',
          innerSize: '80%'
        }
      ]
    };
    this._cooDashboardCommon.donutChart = donut;
  }

  loadDonutData(ip: string): void {
    this._cooDashboardCommon.loadDonutIp = ip;
    if (ip == 'NF') {
      this._cooDashboardCommon.nfucSummaryData = [
        { name: 'Accounts', y: this._cooDashboardCommon.nonPerformDataAccounts.length, color: '#7192ff' },
        { name: 'Portfolios', y: this._cooDashboardCommon.nonPerformDataPortfolios.length, color: 'orange' },
        { name: 'Projects', y: this._cooDashboardCommon.nonPerformDataProjects.length, color: '#88cafa' }
      ];
      this._cooDashboardCommon.top3Accounts = this._cooDashboardCommon.nonPerformDataAccounts.slice(0, 3);
      this._cooDashboardCommon.top3Portfolios = this._cooDashboardCommon.nonPerformDataPortfolios.slice(0, 3);
      this._cooDashboardCommon.top3Projects = this._cooDashboardCommon.nonPerformDataProjects.slice(0, 3);
    } else {
      this._cooDashboardCommon.nfucSummaryData = [
        { name: 'Accounts', y: this._cooDashboardCommon.performDataAccounts.length, color: '#7192ff' },
        { name: 'Portfolios', y: this._cooDashboardCommon.performDataPortfolios.length, color: 'orange' },
        { name: 'Projects', y: this._cooDashboardCommon.performDataProjects.length, color: '#88cafa' }
      ];
      this._cooDashboardCommon.top3Accounts = this._cooDashboardCommon.performDataAccounts.slice(0, 3);
      this._cooDashboardCommon.top3Portfolios = this._cooDashboardCommon.performDataPortfolios.slice(0, 3);
      this._cooDashboardCommon.top3Projects = this._cooDashboardCommon.performDataProjects.slice(0, 3);
    }
    this.initDonut();
  }
  
  getCustomerSuccessSurvey(qStartDate: Date, qEndDate: Date): void {
    this._coodashboardService.getCSSTableForProjects(
      this._cooDashboardCommon.projectIds,
      qStartDate,
      qEndDate
    ).subscribe(
      (data: any) => {
        this._cooDashboardCommon.customerSuccessSurvey = data;
        this.top3Performingcss = 'P';
      },
      (error: any) => {
        console.error('Error loading customer success survey:', error);
      }
    );
  }
}

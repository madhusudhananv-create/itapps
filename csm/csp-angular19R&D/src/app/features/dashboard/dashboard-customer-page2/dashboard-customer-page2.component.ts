import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';
import { inject } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';

import { AppsService } from '../../../core/services/apps.service';
import { AuthService } from '../../../core/services/auth.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SharedData } from '../../../shared/shared-data';
import { DashboardService } from '../../../services/dashboard.service';
import { QSPOCPopupComponent } from '../../../pages/dashboard/qspoc-popup/qspoc-popup.component';
import { SemicircularGaugeComponent } from '../../../components/semicircular-gauge/semicircular-gauge.component';

/**
 * TasksEventsSummary - Interface for Events & Tasks summary data
 */
interface TasksEventsSummary {
  priority: string;
  dueEvents: number;
  overdueEvents: number;
  nextWeekEvents: number;
  nextMonthEvents: number;
  dueTasks: number;
  overdueTasks: number;
  nextWeekTasks: number;
  nextMonthTasks: number;
  thisWeekEvents: number;
  thisMonthEvents: number;
  thisWeekTasks: number;
  thisMonthTasks: number;
}

/**
 * Dashboard Customer Page 2 Component
 * Second page of operational dashboard showing KPI performance
 * 
 * Features:
 * - Overall Health Index gauge (Quality, Performance, Value, Compliance)
 * - Performance of KPI table with project scores
 * - Events & Tasks widget
 * - Action Items, Issues, Risks widgets
 * - Appreciations widget
 * - Month/Year filtering
 * - Upload project files (Frontier)
 * - View KPI trends
 * - Edit KPI
 */
@Component({
  selector: 'app-dashboard-customer-page2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    GoogleChartsModule,
    SemicircularGaugeComponent
  ],
  templateUrl: './dashboard-customer-page2.component.html',
  styleUrls: ['./dashboard-customer-page2.component.scss']
})
export class DashboardCustomerPage2Component implements OnInit, OnDestroy, OnChanges {
  // Injected services
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly appsService = inject(AppsService);
  private readonly authService = inject(AuthService);
  private readonly media = inject(MediaMatcher);
  private readonly dialog = inject(MatDialog);
  public readonly util = inject(MyUtility);
  public readonly access = inject(AccessControl);
  public readonly _shared = inject(SharedData);
  public readonly dashboardUtil = inject(DashboardService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();
  private timerSubscription?: Subscription;

  // Inputs from parent component
  @Input() customerid: string = '';
  @Input() customerName: string = '';
  @Input() portArray: any[] = [];
  @Input() projectArray: any[] = [];
  @Input() productArray: any[] = [];

  // Component properties
  empId: string = '';
  progress: boolean = false;

  // Mobile query
  mobileQuery!: MediaQueryList;

  // Dashboard state
  showSuccessGoalFilter: boolean = false;
  showQualityHelp: boolean = false;
  showPerformanceHelp: boolean = false;
  showValueHelp: boolean = false;
  showComplianceHelp: boolean = false;

  // Customer-specific flags
  isFrontier: boolean = false;

  // Month/Year for filtering
  sMonth: string = '';
  iYear: number = 0;
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Success Goal Scores
  projectScores: any[] = [];
  successGoalScores: any[] = [];
  tempScoresArray: any[] = [];
  achievedValueForOverallScore: number = 0;
  overallScore?: string;
  quality?: string;
  performance?: string;
  value?: string;
  compliance?: string;
  qColor?: string;
  pColor?: string;
  vColor?: string;
  cColor?: string;

  // Overall Health Index gauge
  type8: ChartType = ChartType.PieChart;
  width8 = 70;
  height8 = 105;
  data8: any[] = [];
  options8 = {
    legend: {
      position: 'none',
      alignment: 'center',
    },
    width: 70,
    height: 105,
    tooltip: { trigger: 'selection' },
    pieSliceText: 'value',
    pieSliceTextStyle: {
      fontSize: 10,
    },
    colors: ['#5c66f2', '#5adb9a', '#3ab376', '#a9a9a9'],
    chartArea: {
      width: '100%',
      height: '90%',
      bottom: 10,
      top: 0,
      left: 0
    },
  };

  // Events & Tasks
  tasksEventsSummary: TasksEventsSummary[] = [];
  eventTasksHighValues!: TasksEventsSummary;
  eventTasksLowValues!: TasksEventsSummary;
  eventTasksMediumValues!: TasksEventsSummary;
  totaltasksEvents: number = 0;
  isTasksEventsEmpty: boolean = true;
  tasksEventstype: ChartType = ChartType.ColumnChart;
  tasksEventsSummaryData: any[] = [];
  widthE = 185;
  heightE = 75;
  tasksEventsoptions = {
    chartArea: {
      width: '88%',
      height: '100%',
      bottom: 30,
      top: 5
    },
    hAxis: {
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
      minValue: 0,
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

  // Action Items
  actionItemHigh: string = '0';
  actionItemMedium: string = '0';
  actionItemLow: string = '0';
  actionItemDueForClosure: string = '0';  // Status: Due for closure
  actionItemPastDueDate: string = '0';    // Status: Past due date
  totalActionItems: number = 0;
  isActionItemsEmpty: boolean = true;
  data6: any[] = [];
  type6: ChartType = ChartType.PieChart;
  width6 = 170;
  height6 = 85;
  options6 = {
    titleTextStyle: {
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
      width: '100%',
      height: '100%',
      bottom: 0,
      top: 0
    },
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  // Issues
  issueHigh: string = '0';
  issueMedium: string = '0';
  issueLow: string = '0';
  issueDueForClosure: string = '0';  // Status: Due for closure  
  issuePastDueDate: string = '0';    // Status: Past due date
  totalIssues: number = 0;
  isIssuesEmpty: boolean = true;
  dataI: any[] = [];
  typeI: ChartType = ChartType.PieChart;
  widthI = 170;
  heightI = 85;
  optionsI = {
    titleTextStyle: {
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
      width: '100%',
      height: '100%',
      bottom: 0,
      top: 0
    },
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  // Risks
  riskHigh: string = '0';
  riskMedium: string = '0';
  riskLow: string = '0';
  riskDueForClosure: string = '0';  // Status: Due for closure
  riskPastDueDate: string = '0';    // Status: Past due date
  totalRisks: number = 0;
  isRisksEmpty: boolean = true;
  dataR: any[] = [];
  typeR: ChartType = ChartType.PieChart;
  widthR = 170;
  heightR = 85;
  optionsR = {
    titleTextStyle: {
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
      width: '100%',
      height: '100%',
      bottom: 0,
      top: 0
    },
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  // Appreciations
  appreciationArray: any[] = [];
  appreciationHigh: string = '0';
  appreciationMedium: string = '0';
  appreciationLow: string = '0';
  totalAppreciation: number = 0;
  isAppreciationsEmpty: boolean = true;
  dataA: any[] = [
    ['Appreciations', 100],
    [null, 0],
  ];
  typeA: ChartType = ChartType.PieChart;
  widthA = 180;
  heightA = 90;
  optionsA = {
    titleTextStyle: {
      fontSize: 15,
      color: '#ff0109',
      fontName: 'Helvetica Neue'
    },
    legend: 'none',
    pieHole: 0.5,
    pieStartAngle: 270,
    sliceVisibilityThreshold: 0,
    height: 82,
    width: 165,
    tooltip: { trigger: 'selection' },
    pieSliceText: 'value',
    pieSliceTextStyle: { fontSize: 9 },
    colors: ['#3ab376'],
    chartArea: {
      width: '100%',
      height: '100%',
      bottom: 0,
      top: 0
    }
  };

  // Dashboard details
  dashboardDetails: any[] = [];

  // Auto-refresh timer
  timeLeft: number = 60;

  constructor() {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');

    // Initialize empty values
    this.eventTasksHighValues = this.createEmptyTasksEventsSummary('high');
    this.eventTasksLowValues = this.createEmptyTasksEventsSummary('low');
    this.eventTasksMediumValues = this.createEmptyTasksEventsSummary('medium');
  }

  ngOnInit(): void {
    // Set default month and year
    const currentDate = new Date();
    this.sMonth = this.monthNames[currentDate.getMonth()];
    this.iYear = currentDate.getFullYear();

    // Get employee ID
    this.empId = localStorage.getItem('empid') || '';

    // Check if this is Frontier customer
    this.isFrontier = this.customerid == "202100007";

    // Initialize dashboard if we have a customer ID
    // Use setTimeout to ensure @Input bindings are complete
    setTimeout(() => {
      if (this.customerid) {
        this.initializeDashboard();
      }
    }, 0);

    // Start auto-refresh timer
    this.startTimer();
  }

  ngOnDestroy(): void {
    // Close all popups to prevent them from staying visible when component is destroyed
    this.showSuccessGoalFilter = false;
    this.showQualityHelp = false;
    this.showPerformanceHelp = false;
    this.showValueHelp = false;
    this.showComplianceHelp = false;
    
    this.subscriptions.unsubscribe();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle customerid changes (including first change when component is created)
    if (changes['customerid'] && changes['customerid'].currentValue) {
      const isFirstChange = changes['customerid'].firstChange;
      this.isFrontier = this.customerid == "202100007";
      
      // Initialize dashboard if customerid just became available
      // or if it changed to a different customer
      if (this.customerid) {
        // On first change, only initialize if ngOnInit hasn't done it yet
        if (isFirstChange) {
          // ngOnInit will handle initialization
        } else {
          // Customer changed - reload everything
          this.initializeDashboard(); 
        }
      }
    }

    // Handle project/portfolio filter changes
    if (changes['projectArray'] || changes['portArray'] || changes['productArray']) {
      if (!changes['projectArray']?.firstChange && this.customerid) {
        this.applyFilter();
      }
    }
  }

  /**
   * Initialize dashboard data
   */
  initializeDashboard(): void {
    this.service_GetDashboardDetails(this.customerid);
    this.GetTasksEventsSummary(this.customerid, this.empId);
    this.loadSuccessGoalForPeriod(false);
  }

  /**
   * Create empty TasksEventsSummary object
   */
  createEmptyTasksEventsSummary(priority: string): TasksEventsSummary {
    return {
      priority: priority,
      dueEvents: 0,
      overdueEvents: 0,
      nextWeekEvents: 0,
      nextMonthEvents: 0,
      dueTasks: 0,
      overdueTasks: 0,
      nextWeekTasks: 0,
      nextMonthTasks: 0,
      thisWeekEvents: 0,
      thisMonthEvents: 0,
      thisWeekTasks: 0,
      thisMonthTasks: 0
    };
  }

  /**
   * Start auto-refresh timer
   */
  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 60;
        this.service_GetDashboardDetails(this.customerid);
      }
    });
  }

  /**
   * Refresh dashboard data
   */
  Refresh_Onclick(): void {
    this.progress = true;
    this.appsService.refreshDashboardDetails().subscribe({
      next: () => {
        this.progress = false;
        this.service_GetDashboardDetails(this.customerid);
      },
      error: (error: any) => {
        this.progress = false;
        this.util.serviceError(error);
      }
    });
  }

  /**
   * Get dashboard details
   */
  service_GetDashboardDetails(customerid: string): void {
    this.appsService.getDashboardDetailsByCustomerId(customerid).subscribe({
      next: (data: any) => {
        this.dashboardDetails = data;        // If projectArray is not set, fetch all projects for the customer
        if (!this.projectArray || this.projectArray.length === 0) {
          this.loadAllProjects();
        } else {
          this.fillAllGraphs();
        }
      },
      error: (error: any) => {
        this.util.serviceError(error);
      }
    });
  }

  /**
   * Load all projects for the customer
   */
  loadAllProjects(): void {
    this.appsService.getAllProjectsForCustomer(this.customerid).subscribe({
      next: (data: any) => {
        this.projectArray = data.map((x: any) => x.proJ_ID);        this.fillAllGraphs();
      },
      error: (error: any) => {
        this.util.serviceError(error);
      }
    });
  }

  /**
   * Fill all graphs with data
   * Note: Overall Health Index is filled separately after loadSuccessGoalForPeriod completes
   */
  fillAllGraphs(): void {
    // Don't fill Overall Health Index here - it needs success goal data from loadSuccessGoalForPeriod
    this.fillGraphActionItemsCircleDonoughtChart();
    this.fillGraphIssuesCircleDonoughtChart();
    this.fillGraphRisksCircleDonoughtChart();
    this.fillGraphAppreciationsCircleDonoughtChart();
    // Note: Don't call filterProjectList() here - it overwrites projectScores loaded by loadSuccessGoalForPeriod()
    // with data from a different API that lacks Business Unit and Achievement data
  }

  /**
   * Fill Overall Health Index gauge
   */
  fillGraphCleverQualitySemicircleDonoughtChart(): void {
    const quality = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_QUALITY');
    const perf = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_PERFORMANCE');
    const value = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_VALUE');
    const compliance = this.getGraphValue_customer('SUCCESS_GOAL_SCORE_COMPLIANCE');

    this.achievedValueForOverallScore = quality + perf + value + compliance;

    this.data8 = [];
    this.data8.push(["Quality", quality]);
    this.data8.push(["Performance", perf]);
    this.data8.push(["Value1", value]);
    this.data8.push(["Compliance", compliance]);
  }

  /**
   * Fill Action Items chart
   */
  fillGraphActionItemsCircleDonoughtChart(): void {
    this.data6 = [];
    
    // If multiple projects, aggregate from project-level data
    if (this.projectArray && this.projectArray.length > 0) {
      let data1 = 0;  // Due for closure
      let data2 = 0;  // Past due date
      let high = 0;
      let medium = 0;
      let low = 0;

      this.projectArray.forEach(projid => {
        data1 += this.getGraphValue_project('DUE_FOR_CLOSURE', projid);
        data2 += this.getGraphValue_project('PAST_DUE_DATE', projid);
        high += this.getGraphValue_project('ACTION_ITEM_HIGH', projid);
        medium += this.getGraphValue_project('ACTION_ITEM_MEDIUM', projid);
        low += this.getGraphValue_project('ACTION_ITEM_LOW', projid);
      });

      // Store STATUS counts for gauge
      this.actionItemDueForClosure = data1.toString();
      this.actionItemPastDueDate = data2.toString();
      
      // Store SEVERITY counts for stats display
      this.actionItemHigh = high.toString();
      this.actionItemMedium = medium.toString();
      this.actionItemLow = low.toString();
      
      // Total is based on STATUS counts (matching legacy)
      this.totalActionItems = data1 + data2;
      
      this.data6.push(["Due for closure", data1]);
      this.data6.push(["Past due date", data2]);
      this.data6.push([null, this.totalActionItems]);
    } else {
      // Use customer-level data
      const data1 = this.getGraphValue_customer('ACTION_ITEMS_DUE_FOR_CLOSURE');
      const data2 = this.getGraphValue_customer('ACTION_ITEMS_PAST_DUE_DATE');
      
      // Store STATUS counts for gauge
      this.actionItemDueForClosure = data1.toString();
      this.actionItemPastDueDate = data2.toString();
      
      // Store SEVERITY counts for stats display
      this.actionItemHigh = this.getTitleByCustomer('ACTION_ITEMS_HIGH');
      this.actionItemMedium = this.getTitleByCustomer('ACTION_ITEMS_MEDIUM');
      this.actionItemLow = this.getTitleByCustomer('ACTION_ITEMS_LOW');
      
      // Total is based on STATUS counts (matching legacy)
      this.totalActionItems = data1 + data2;
      
      this.data6.push(["Due for closure", data1]);
      this.data6.push(["Past due date", data2]);
      this.data6.push([null, this.totalActionItems]);
    }

    if (this.totalActionItems == 0) {
      this.isActionItemsEmpty = true;
    } else {
      this.isActionItemsEmpty = false;
    }
  }

  /**
   * Fill Issues chart
   */
  fillGraphIssuesCircleDonoughtChart(): void {
    this.dataI = [];
    
    // If multiple projects, aggregate from project-level data
    if (this.projectArray && this.projectArray.length > 0) {
      let data1 = 0;  // Due for closure
      let data2 = 0;  // Past due date
      let high = 0;
      let medium = 0;
      let low = 0;

      this.projectArray.forEach(projid => {
        data1 += this.getGraphValue_project('ISSUES_DUE_FOR_CLOSURE', projid);
        data2 += this.getGraphValue_project('ISSUES_PAST_DUE_DATE', projid);
        high += this.getGraphValue_project('ISSUES_HIGH', projid);
        medium += this.getGraphValue_project('ISSUES_MEDIUM', projid);
        low += this.getGraphValue_project('ISSUES_LOW', projid);
      });

      // Store STATUS counts for gauge
      this.issueDueForClosure = data1.toString();
      this.issuePastDueDate = data2.toString();
      
      // Store SEVERITY counts for stats display
      this.issueHigh = high.toString();
      this.issueMedium = medium.toString();
      this.issueLow = low.toString();
      
      // Total is based on STATUS counts (matching legacy)
      this.totalIssues = data1 + data2;
      
      this.dataI.push(["Due for closure", data1]);
      this.dataI.push(["Past due date", data2]);
      this.dataI.push([null, this.totalIssues]);
    } else {
      // Use customer-level data
      const data1 = this.getGraphValue_customer('ISSUES_DUE_FOR_CLOSURE');
      const data2 = this.getGraphValue_customer('ISSUES_PAST_DUE_DATE');
      
      // Store STATUS counts for gauge
      this.issueDueForClosure = data1.toString();
      this.issuePastDueDate = data2.toString();
      
      // Store SEVERITY counts for stats display
      this.issueHigh = this.getTitleByCustomer('ISSUES_HIGH');
      this.issueMedium = this.getTitleByCustomer('ISSUES_MEDIUM');
      this.issueLow = this.getTitleByCustomer('ISSUES_LOW');
      
      // Total is based on STATUS counts (matching legacy)
      this.totalIssues = data1 + data2;
      
      this.dataI.push(["Due for closure", data1]);
      this.dataI.push(["Past due date", data2]);
      this.dataI.push([null, this.totalIssues]);
    }

    if (this.totalIssues == 0) {
      this.isIssuesEmpty = true;
    } else {
      this.isIssuesEmpty = false;
    }
  }

  /**
   * Fill Risks chart
   */
  fillGraphRisksCircleDonoughtChart(): void {
    this.dataR = [];
    
    // If multiple projects, aggregate from project-level data
    if (this.projectArray && this.projectArray.length > 0) {
      let data1 = 0;  // Due for closure
      let data2 = 0;  // Past due date
      let high = 0;
      let medium = 0;
      let low = 0;

      this.projectArray.forEach(projid => {
        data1 += this.getGraphValue_project('RISKS_DUE_FOR_CLOSURE', projid);
        data2 += this.getGraphValue_project('RISKS_PAST_DUE_DATE', projid);
        high += this.getGraphValue_project('RISKS_HIGH', projid);
        medium += this.getGraphValue_project('RISKS_MEDIUM', projid);
        low += this.getGraphValue_project('RISKS_LOW', projid);
      });

      // Store STATUS counts for gauge
      this.riskDueForClosure = data1.toString();
      this.riskPastDueDate = data2.toString();
      
      // Store SEVERITY counts for stats display
      this.riskHigh = high.toString();
      this.riskMedium = medium.toString();
      this.riskLow = low.toString();
      
      // Total is based on STATUS counts (matching legacy)
      this.totalRisks = data1 + data2;
      
      this.dataR.push(["Due for closure", data1]);
      this.dataR.push(["Past due date", data2]);
      this.dataR.push([null, this.totalRisks]);
    } else {
      // Use customer-level data
      const data1 = this.getGraphValue_customer('RISKS_DUE_FOR_CLOSURE');
      const data2 = this.getGraphValue_customer('RISKS_PAST_DUE_DATE');
      
      // Store STATUS counts for gauge
      this.riskDueForClosure = data1.toString();
      this.riskPastDueDate = data2.toString();
      
      // Store SEVERITY counts for stats display
      this.riskHigh = this.getTitleByCustomer('RISKS_HIGH').toString();
      this.riskMedium = this.getTitleByCustomer('RISKS_MEDIUM').toString();
      this.riskLow = this.getTitleByCustomer('RISKS_LOW').toString();
      
      // Total is based on STATUS counts (matching legacy)
      this.totalRisks = data1 + data2;
      
      this.dataR.push(["Due for closure", data1]);
      this.dataR.push(["Past due date", data2]);
      this.dataR.push([null, this.totalRisks]);
    }

    if (this.totalRisks == 0) {
      this.isRisksEmpty = true;
    } else {
      this.isRisksEmpty = false;
    }
  }

  /**
   * Fill Appreciations chart
   */
  /**
   * Fill Appreciations chart
   * Gets ALL appreciations for the customer (doesn't filter by project)
   * This matches legacy behavior where appreciations widget shows all customer appreciations
   */
  fillGraphAppreciationsCircleDonoughtChart(): void {
    this.appsService.getAppreciationDetails(this.customerid, true).subscribe({
      next: (data: any) => {
        this.appreciationArray = data || [];
        
        // Don't filter by projects - show all appreciations for the customer
        // This matches the legacy appreciation-widget-source component behavior
        
        this.totalAppreciation = this.appreciationArray.length;

        if (this.totalAppreciation === 0) {
          this.isAppreciationsEmpty = true;
          this.appreciationHigh = '0';
          this.appreciationMedium = '0';
          this.appreciationLow = '0';
        } else {
          this.isAppreciationsEmpty = false;
          // Reset data array and add appreciation count
          this.dataA = [];
          this.dataA.push(["Appreciation Received", this.totalAppreciation]);
          this.dataA.push([null, 0]);
          
          // Set appreciation values (set total to low for display)
          this.appreciationHigh = '0';
          this.appreciationMedium = '0';
          this.appreciationLow = this.totalAppreciation.toString();
        }
      },
      error: (error: any) => {
        this.isAppreciationsEmpty = true;
        this.appreciationHigh = '0';
        this.appreciationMedium = '0';
        this.appreciationLow = '0';
        this.util.serviceError(error);
      }
    });
  }

  /**
   * Get graph value for customer-level metrics
   * Uses getTitleByCustomer to leverage override logic
   * Migrated from legacy: removes "%" and handles "-" values
   */
  getGraphValue_customer(title: string): number {
    let stringValue = this.getTitleByCustomer(title);
    
    // Handle "-" which means no data - convert to '0'
    if (stringValue === '-') {
      stringValue = '0';
    } else if (stringValue && stringValue !== '-') {
      // Remove percentage sign if present (e.g., "75%" -> "75")
      stringValue = stringValue.replace('%', '');
    }
    
    // Parse to number
    const numericValue = stringValue ? Number(stringValue) : 0;
    return numericValue;
  }

  /**
   * Get title/label by customer
   * Migrated from legacy: Check dashboardDetails first, then override with specific properties
   */
  getTitleByCustomer(title: string): string {
    let content: string = '';
    
    // First check dashboardDetails (customer-level only, not project/portfolio level)
    const detail = this.dashboardDetails.find(x => x.title === title && x.proJ_ID == null && x.portfoliO_ID == null);
    if (detail && detail.content) {
      content = detail.content;
    }
    
    // Override with specific properties from API if available
    if (this.quality != undefined && title == "SUCCESS_GOAL_SCORE_QUALITY") {
      content = this.quality;
    } else if (this.performance != undefined && title == "SUCCESS_GOAL_SCORE_PERFORMANCE") {
      content = this.performance;
    } else if (this.value != undefined && title == "SUCCESS_GOAL_SCORE_VALUE") {
      content = this.value;
    } else if (this.compliance != undefined && title == "SUCCESS_GOAL_SCORE_COMPLIANCE") {
      content = this.compliance;
    } else if (this.overallScore != undefined && title == "SUCCESS_GOAL_SCORE") {
      content = this.overallScore;
    }
    
    return content;
  }

  /**
   * Get color by customer metric
   * Override with specific color properties when available
   */
  getColorByCustomer(title: string): string {
    let color = '';
    
    // First get from dashboardDetails (customer-level only)
    const detail = this.dashboardDetails.find(x => x.title === title && x.proJ_ID == null && x.portfoliO_ID == null);
    if (detail) {
      color = detail.color || '';
    }
    
    // Override with specific color properties if available
    if (this.qColor != undefined && title == "SUCCESS_GOAL_SCORE_QUALITY") {
      color = this.qColor;
    } else if (this.pColor != undefined && title == "SUCCESS_GOAL_SCORE_PERFORMANCE") {
      color = this.pColor;
    } else if (this.vColor != undefined && title == "SUCCESS_GOAL_SCORE_VALUE") {
      color = this.vColor;
    } else if (this.cColor != undefined && title == "SUCCESS_GOAL_SCORE_COMPLIANCE") {
      color = this.cColor;
    }
    
    return color || 'gray';
  }

  /**
   * Get title/label by project
   * @param title - Metric title
   * @param projid - Project ID
   */
  getTitleByProject(title: string, projid: any): string {
    let content: string = '-';
    if (this.dashboardDetails != undefined) {
      const details = this.dashboardDetails.filter(t => t.title == title && t.proJ_ID == projid);
      if (details.length > 0) {
        content = details[0].content;
      }
    }
    return content;
  }

  /**
   * Get graph value for project-level metrics
   * @param title - Metric title
   * @param projid - Project ID
   */
  getGraphValue_project(title: string, projid: any): number {
    let iValue = 0;
    let sValue = this.getTitleByProject(title, projid);
    if (sValue != undefined && sValue != "-") {
      sValue = sValue.replace(/\D/g, "");
      iValue = Number(sValue);
    } else {
      iValue = 0;
    }
    return iValue;
  }

  /**
   * Clear portfolio and project filters before navigating to appreciation page
   * This ensures the appreciation page shows all appreciations for the customer
   */
  clearFiltersForAppreciation(): void {
    this._shared.savedportfolioId = 0;
    this._shared.selectedProjects = [];
    this._shared.selectedPortfolios = [];
  }

  /**
   * Filter project list
   */
  filterProjectList(): void {
    this.appsService.getSuccessGoalScoresForProject(this.customerid).subscribe({
      next: (data: any) => {
        this.tempScoresArray = data || [];
        this.projectScores = data || [];

        // Get success goal scores for a single project if applicable
        if (this.util.IsPremier(this.customerid) && this.projectScores.length === 1) {
          this.getSuccessGoalScoresForAProject(
            this.projectScores[0].cusT_ID,
            this.projectScores[0].proJ_ID
          );
        }
      },
      error: (error: any) => {
        this.util.serviceError(error);
      }
    });
  }

  /**
   * Get success goal scores for a specific project
   */
  getSuccessGoalScoresForAProject(custId: string, projId: string): void {
    this.appsService.getSuccessGoalScoreForAPeriod(this.customerid, this.sMonth, this.iYear.toString(), false).subscribe({
      next: (data: any) => {
        this.successGoalScores = data.succesS_GOALS_SCORES || data.SUCCESS_GOALS_SCORES || [];
        this.overallScore = data.overalL_SCORE || data.OVERALL_SCORE;
        this.quality = data.quality || data.QUALITY;
        this.value = data.value || data.VALUE;
        this.performance = data.performance || data.PERFORMANCE;
        this.compliance = data.compliance || data.COMPLIANCE;
      },
      error: (error: any) => {
        this.util.serviceError(error);
        this.successGoalScores = [];
      }
    });
  }

  /**
   * Load success goal scores for the current period
   */
  loadSuccessGoalForPeriod(bLastUpdated: boolean): void {
    this.appsService.getSuccessGoalScoreForAPeriod(this.customerid, this.sMonth, this.iYear.toString(), bLastUpdated).subscribe({
      next: (data: any) => {
        this.projectScores = data.projecT_SCORES || data.PROJECT_SCORES || [];
        this.tempScoresArray = data.projecT_SCORES || data.PROJECT_SCORES || [];
        
        // Filter by selected projects if any
        if (this.projectArray && this.projectArray.length > 0 && this.projectScores) {
          this.projectScores = this.projectScores.filter((f: any) => this.projectArray.includes(f.proJ_ID));
        }
        
        this.successGoalScores = data.succesS_GOALS_SCORES || data.SUCCESS_GOALS_SCORES || [];
        // Set values from API response - matching legacy property order
        this.overallScore = data.overalL_SCORE || data.OVERALL_SCORE;
        this.quality = data.quality || data.QUALITY;
        this.value = data.value || data.VALUE;
        this.performance = data.performance || data.PERFORMANCE;
        this.compliance = data.compliance || data.COMPLIANCE;
        this.qColor = data.qualitY_COLOR || data.QUALITY_COLOR;
        this.pColor = data.performancE_COLOR || data.PERFORMANCE_COLOR;
        this.vColor = data.valuE_COLOR || data.VALUE_COLOR;
        this.cColor = data.compliancE_COLOR || data.COMPLIANCE_COLOR;
        this.sMonth = data.month || data.MONTH || this.sMonth;
        this.iYear = data.year || data.YEAR || this.iYear;

        // Update the Overall Health Index chart
        this.fillGraphCleverQualitySemicircleDonoughtChart();
      },
      error: (error: any) => {
        this.util.serviceError(error);
        this.projectScores = [];
        this.successGoalScores = [];
      }
    });
  }

  /**
   * Get Tasks and Events Summary
   */
  GetTasksEventsSummary(customerId: string, employeeId: string): void {
    this.tasksEventsSummaryData = [];
    this.appsService.getTasksEventsSummary(customerId, employeeId).subscribe({
      next: (data: any) => {
        this.tasksEventsSummary = data;
        this.isTasksEventsEmpty = false;

        this.eventTasksHighValues = this.tasksEventsSummary.find((x: TasksEventsSummary) => x.priority.toLowerCase() === 'high') 
          || this.createEmptyTasksEventsSummary('high');
        this.eventTasksLowValues = this.tasksEventsSummary.find((x: TasksEventsSummary) => x.priority.toLowerCase() === 'low') 
          || this.createEmptyTasksEventsSummary('low');
        this.eventTasksMediumValues = this.tasksEventsSummary.find((x: TasksEventsSummary) => x.priority.toLowerCase() === 'medium') 
          || this.createEmptyTasksEventsSummary('medium');

        this.tasksEventsSummaryData.push([
          'High',
          this.eventTasksHighValues.dueEvents + this.eventTasksHighValues.dueTasks,
          this.eventTasksHighValues.overdueEvents + this.eventTasksHighValues.overdueTasks
        ]);
        this.tasksEventsSummaryData.push([
          'Medium',
          this.eventTasksMediumValues.dueEvents + this.eventTasksMediumValues.dueTasks,
          this.eventTasksMediumValues.overdueEvents + this.eventTasksMediumValues.overdueTasks
        ]);
        this.tasksEventsSummaryData.push([
          'Low',
          this.eventTasksLowValues.dueEvents + this.eventTasksLowValues.dueTasks,
          this.eventTasksLowValues.overdueEvents + this.eventTasksLowValues.overdueTasks
        ]);

        // Calculate total
        this.totaltasksEvents = this.eventTasksHighValues.dueEvents + this.eventTasksHighValues.dueTasks +
          this.eventTasksHighValues.overdueEvents + this.eventTasksHighValues.overdueTasks +
          this.eventTasksMediumValues.dueEvents + this.eventTasksMediumValues.dueTasks +
          this.eventTasksMediumValues.overdueEvents + this.eventTasksMediumValues.overdueTasks +
          this.eventTasksLowValues.dueEvents + this.eventTasksLowValues.dueTasks +
          this.eventTasksLowValues.overdueEvents + this.eventTasksLowValues.overdueTasks;
      },
      error: (error: any) => {
        this.util.serviceError(error);
      }
    });
  }

  /**
   * Apply filter for multi-project view
   */
  btnApplyMultiProjects_OnClick(): void {
    this.closeNav();
    this.service_GetDashboardDetails(this.customerid);
  }

  /**
   * Apply filter for single project view
   */
  btnApplySingleProject_OnClick(): void {
    this.closeNav();
    if (this.successGoalScores && this.successGoalScores.length > 0) {
      this.getSuccessGoalScoresForAProject(
        this.successGoalScores[0].cusT_ID,
        this.successGoalScores[0].proJ_ID
      );
    }
  }

  /**
   * Apply filter based on portfolio/project selection
   */
  applyFilter(): void {
    // Filter logic for project arrays
    if (this.projectArray && this.projectArray.length > 0) {
      // Reload success goal data with the new filter
      // loadSuccessGoalForPeriod already handles filtering by projectArray
      this.loadSuccessGoalForPeriod(false);
      this.fillGraphActionItemsCircleDonoughtChart();
      this.fillGraphIssuesCircleDonoughtChart();
      this.fillGraphRisksCircleDonoughtChart();    }
  }

  /**
   * Close filter navigation
   */
  closeNav(): void {
    this.showSuccessGoalFilter = false;
  }

  /**
   * Close help popups
   */
  closePopup(popupName: string): void {
    if (popupName === "QualityHelp") {
      this.showQualityHelp = false;
    } else if (popupName === "PerformanceHelp") {
      this.showPerformanceHelp = false;
    } else if (popupName === "ValueHelp") {
      this.showValueHelp = false;
    } else if (popupName === "ComplianceHelp") {
      this.showComplianceHelp = false;
    }
  }

  /**
   * Open KPI trend screen
   */
  openKPItrendScreen(): void {
    this.router.navigate(['/kpi/trend', this.customerid]);
  }

  /**
   * Set flag when navigating to KPI edit
   */
  changKPIflag(): void {
    this.appsService.KpiCalledFromNewDashboard = true;
  }

  /**
   * View QSPOC popup
   */
  viewQSPOC(proJ_ID: string, proJ_NM: string): void {
    const dialog = this.dialog.open(QSPOCPopupComponent, {
      width: "55%",
      maxWidth: "750px",
      height: "85%",
      panelClass: 'qspoc-dialog-panel',
      data: {
        custid: this.customerid,
        projids: proJ_ID,
        custname: this.customerName,
        projname: proJ_NM
      },
    });
    dialog.afterClosed().subscribe((result) => {
      // Handle dialog close if needed
    });
  }

  /**
   * Upload project file (Frontier only)
   */
  UploadProjectFile(proJ_ID?: string): void {
    // TODO: Implement ProjectFileUploadComponent
  }

  /**
   * Check if project list is empty
   */
  IsProjectEmpty(): boolean {
    return !this.projectScores || this.projectScores.length === 0;
  }
}

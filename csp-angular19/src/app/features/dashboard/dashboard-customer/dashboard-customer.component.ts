import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';
import { inject } from '@angular/core';
import { Subscription, forkJoin, of, catchError } from 'rxjs';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';

import { AppsService } from '../../../core/services/apps.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChartsService } from '../../../services/charts.service';
import { MyUtility } from '../../../shared/my-utility';
import { AccessControl } from '../../../shared/access-control';
import { SharedData } from '../../../shared/shared-data';
import { CustomerModel } from '../../../models/customer.model';
import { PortfolioProjectSelectorComponent } from '../../../shared/components/portfolio-project-selector/portfolio-project-selector.component';
import { QSPOCPopupComponent } from '../../../pages/dashboard/qspoc-popup/qspoc-popup.component';
import { AddNotesComponent } from './add-notes/add-notes.component';
import { DashboardCustomerNextPageComponent } from '../dashboard-customer-next-page/dashboard-customer-next-page.component';
import { DashboardSuccessJourneyComponent } from '../dashboard-success-journey/dashboard-success-journey.component';
import { DashboardService } from '../../../services/dashboard.service';
import { SemicircularGaugeComponent } from '../../../components/semicircular-gauge/semicircular-gauge.component';
import { ProjectStatusComponent } from '../project-status/project-status.component';
import { AchievementTrendComponent } from './achievement-trend/achievement-trend.component';

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
 * Dashboard Customer Component
 * Main operational dashboard for a specific customer
 * 
 * Features:
 * - Customer header with logo and navigation
 * - Performance of Success Goal table
 * - Events & Tasks widget
 * - Action Items widget
 * - Risks widget
 * - Issues widget
 * - Appreciations widget
 * - Contract Status widget
 * - Key Highlights section
 * - Service Improvement Plan table
 * - Month/Year filtering
 * - Portfolio/Project filtering
 * - Previous/Next navigation
 */
@Component({
  selector: 'app-dashboard-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    GoogleChartsModule,
    PortfolioProjectSelectorComponent,
    QSPOCPopupComponent,
    DashboardCustomerNextPageComponent,
    DashboardSuccessJourneyComponent,
    SemicircularGaugeComponent
  ],
  templateUrl: './dashboard-customer.component.html',
  styleUrls: ['./dashboard-customer.component.scss']
})
export class DashboardCustomerComponent implements OnInit, OnDestroy, OnChanges {
  // Injected services
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly appsService = inject(AppsService);
  private readonly chartsService = inject(ChartsService);
  private readonly authService = inject(AuthService);
  private readonly media = inject(MediaMatcher);
  private readonly dialog = inject(MatDialog);
  public readonly _util = inject(MyUtility);
  public readonly _access = inject(AccessControl);
  public readonly _shared = inject(SharedData);
  public readonly _dashboardUtil = inject(DashboardService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  // Inputs from parent component
  @Input() custid: string = '';
  @Input() reset: boolean = false;  // Default to false to show current month data

  // Component properties
  customerid: string = '';
  selectedCustomer: CustomerModel | null = null;
  progress: boolean = false;
  empId: string = '';
  isGAVSUser: boolean = false;

  // Mobile query
  mobileQuery: MediaQueryList;

  // Dashboard state
  currIndex: number = 0;
  isBaseMeasureEnabled: boolean = false;
  showFilter: boolean = false;
  showSuccessGoalFilter: boolean = false;

  // Customer-specific flags
  isCBH: boolean = false;
  isFrontier: boolean = false;

  // Month/Year for filtering
  sMonth: string = '';
  iYear: string = '';
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  availableYears: number[] = [];

  // Project Scores for Success Goal Table
  projectScores: any[] = [];

  // Events & Tasks
  tasksEventsSummary: TasksEventsSummary[] = [];
  eventTasksHighValues: TasksEventsSummary;
  eventTasksLowValues: TasksEventsSummary;
  eventTasksMediumValues: TasksEventsSummary;
  totaltasksEvents: number = 0;
  eventTasksHighCount: number = 0;
  eventTasksMediumCount: number = 0;
  eventTasksLowCount: number = 0;
  isTasksEventsEmpty: boolean = true;

  // Google Charts configuration for Events & Tasks
  tasksEventstype: ChartType = ChartType.ColumnChart;
  tasksEventsColumnNames = ['Priority', 'Due', 'Overdue'];
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
  width6 = 200;
  height6 = 90;
  options6 = {
    pieSliceText: 'none',
    pieHole: 0.5,
    legend: 'none',
    chartArea: { left: 0, top: 0, width: '100%', height: '100%' },
    colors: ['#3ab376', '#ef5350'], // Green (due for closure), Red (past due date)
    tooltip: { trigger: 'none' },
    pieStartAngle: 270, // Start from bottom for gauge-like semi-circle
    enableInteractivity: false,
    sliceVisibilityThreshold: 0,
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  // Appreciations
  appreciationHigh: string = '0';
  appreciationMedium: string = '0';
  appreciationLow: string = '0';
  totalAppreciations: number = 0;
  isAppreciationsEmpty: boolean = true;

  // Risks
  riskHigh: string = '0';
  riskMedium: string = '0';
  riskLow: string = '0';
  riskDueForClosure: string = '0';  // Status: Due for closure
  riskPastDueDate: string = '0';    // Status: Past due date
  totalRisks: number = 0;
  isRisksEmpty: boolean = true;
  dataR = [
    ['Due for closure', 20],
    ['Past due date', 30],
    [null, 50],
  ];
  typeR: ChartType = ChartType.PieChart;
  widthR = 190;
  heightR = 90;
  optionsR = {
    pieSliceText: 'none',
    pieHole: 0.5,
    legend: 'none',
    chartArea: { left: 0, top: 0, width: '100%', height: '100%' },
    colors: ['#3ab376', '#ef5350'], // Green (due for closure), Red (past due date)
    tooltip: { trigger: 'none' },
    pieStartAngle: 270, // Start from bottom for gauge-like semi-circle
    enableInteractivity: false,
    sliceVisibilityThreshold: 0,
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
  widthI = 190;
  heightI = 90;
  optionsI = {
    pieSliceText: 'none',
    pieHole: 0.5,
    legend: 'none',
    chartArea: { left: 0, top: 0, width: '100%', height: '100%' },
    colors: ['#3ab376', '#ef5350'], // Green (due for closure), Red (past due date)
    tooltip: { trigger: 'none' },
    pieStartAngle: 270, // Start from bottom for gauge-like semi-circle
    enableInteractivity: false,
    sliceVisibilityThreshold: 0,
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  // Contract Status
  totalProjects: number = 0;
  isProjectStatusEmpty: boolean = true;
  projectToStart: number = 0;
  projectToEnd: number = 0;
  data5: any[] = [];
  type5: ChartType = ChartType.PieChart;
  width5 = 190;
  height5 = 70;
  options5 = {
    pieSliceText: 'none',
    pieHole: 0.5,
    legend: 'none',
    chartArea: { left: 0, top: 0, width: '100%', height: '100%' },
    colors: ['#3ab376', '#ef5350'], // Green (to start), Red (to end)
    tooltip: { trigger: 'none' },
    pieStartAngle: 270, // Start from bottom for gauge-like semi-circle
    enableInteractivity: false,
    sliceVisibilityThreshold: 0,
    slices: {
      2: {
        color: 'transparent',
        enableInteractivity: false
      }
    }
  };

  // Key Highlights
  highlights: any[] = [];
  temp: any[] = [];
  SelectedWeek: number = 0;
  weekOptions = [
    { value: 0, label: 'Month' },
    { value: 1, label: 'Week 1' },
    { value: 2, label: 'Week 2' },
    { value: 3, label: 'Week 3' },
    { value: 4, label: 'Week 4' },
    { value: 5, label: 'Week 5' }
  ];

  // Service Improvement Plan (CAPA)
  projectCAPACount: any[] = [];

  // Dashboard details
  dashboardDetails: any[] = [];

  // Portfolio/Project filtering
  portArray: any[] = [];
  projArray: any[] = [];
  prodArray: any[] = [];

  constructor() {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    
    // Initialize Events & Tasks empty values
    this.eventTasksHighValues = this.createEmptyTasksEventsSummary('high');
    this.eventTasksLowValues = this.createEmptyTasksEventsSummary('low');
    this.eventTasksMediumValues = this.createEmptyTasksEventsSummary('medium');
    
    // CRITICAL FIX: Initialize month/year in constructor
    // This must run before ngOnChanges (which can call loadCustomerData)
    this.initializeMonthYear();
  }

  get isMobile(): boolean {
    return this.mobileQuery.matches;
  }

  ngOnInit(): void {
    // Scroll to top on navigation
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Get user information
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.empId = userInfo.empId || '';
      this.isGAVSUser = userInfo.isGAVSUser || false;
    }

    // Month/year already initialized in constructor
    // (must be there to run before ngOnChanges)

    // NOTE: Don't load data here if custid is provided as Input
    // ngOnChanges will handle it (it runs before ngOnInit)
    if (this.custid) {
      return;
    }

    // Otherwise, subscribe to route parameters (for direct routing)
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        this.customerid = params['customerid'] || '';
        
        // CRITICAL FIX: Default reset to false to show current month data
        // Only use last updated (reset=true) if explicitly passed in URL
        this.reset = params['reset'] === 'true' || params['reset'] === true;

        if (this.customerid) {
          this.isBaseMeasureEnabled = this._util.IsBaseMeasureEnabledCustomer(this.customerid);
          this.setCustomerFlags();
          this.loadCustomerData();
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('=== Dashboard Customer ngOnChanges ===');
    console.log('Changes:', changes);
    
    // Handle changes to Input properties
    
    // Handle reset input changes
    if (changes['reset'] && !changes['reset'].firstChange) {
      this.reset = changes['reset'].currentValue;
      console.log('Reset input changed to:', this.reset);
    }
    
    if (changes['custid']) {
      const custidChange = changes['custid'];
      console.log('custid changed:', custidChange);
      console.log('currentValue:', custidChange.currentValue);
      console.log('previousValue:', custidChange.previousValue);
      console.log('firstChange:', custidChange.firstChange);
      
      // Load data when custid changes and has a value
      // On first change, previousValue will be undefined, so we need to check firstChange as well
      if (custidChange.currentValue && (custidChange.firstChange || custidChange.currentValue !== custidChange.previousValue)) {
        this.customerid = this.custid;
        console.log('AFTER assignment - this.customerid:', this.customerid);
        console.log('AFTER assignment - this.custid:', this.custid);
        console.log('AFTER assignment - custidChange.currentValue:', custidChange.currentValue);
        
        this.isBaseMeasureEnabled = this._util.IsBaseMeasureEnabledCustomer(this.customerid);
        this.setCustomerFlags();
        this.loadCustomerData();
      } else {
        console.log('NOT loading data - custid is empty or unchanged');
      }
    }
    console.log('=====================================');
  }

  private setCustomerFlags(): void {
    // Set customer-specific flags based on customer ID
    this.isCBH = this.customerid === "202100110";
    this.isFrontier = this.customerid === "202100007";
    
    // Initialize currIndex based on isBaseMeasureEnabled
    // For BaseMeasure customers, start at index 1 to show main dashboard
    // For non-BaseMeasure customers, start at index 0
    if (this.isBaseMeasureEnabled) {
      this.currIndex = 1;
    } else {
      this.currIndex = 0;
    }
  }

  private initializeMonthYear(): void {
    const currentDate = new Date();
    this.sMonth = this.monthNames[currentDate.getMonth()];
    this.iYear = currentDate.getFullYear().toString();
    
    // Generate year dropdown - show last 10 years for historical data analysis
    // Current year (2026) down to 10 years ago (2017)
    this.availableYears = this._util.Years(10);
    
    // Initialize dashboard util filter properties
    this._dashboardUtil.csG_FILTER_MONTH = this.sMonth;
    this._dashboardUtil.csG_FILTER_YEAR = parseInt(this.iYear);
  }

  private loadCustomerData(): void {
    this.progress = true;
    
    // DEBUG: Log filter values being sent to API
    console.log('=== Dashboard Loading ===');
    console.log('Month:', this.sMonth);
    console.log('Year:', this.iYear);
    console.log('Reset flag:', this.reset);
    console.log('Customer ID (this.customerid):', this.customerid);
    console.log('Selected Customer:', this.selectedCustomer?.cusT_ID);
    console.log('========================');
    
    // Parallelize customer list and dashboard details loading
    const requests = {
      customerList: this.appsService.getCustomerList(this.empId, false).pipe(
        catchError(() => of([]))
      ),
      dashboardDetails: this.appsService.getDashboardDetailsByCustomerId(this.customerid).pipe(
        catchError(() => of([]))
      )
    };

    this.subscriptions.add(
      forkJoin(requests).subscribe({
        next: (results) => {
          // Process customer list
          const customerList = results.customerList;
          if (customerList && customerList.length > 0) {
            const customer = customerList.find((c: CustomerModel) => c.cusT_ID === this.customerid);
            if (customer) {
              this.selectedCustomer = customer;
            } else {
              this.createFallbackCustomer();
            }
          } else {
            this.createFallbackCustomer();
          }

          // Store dashboard details
          this.dashboardDetails = results.dashboardDetails || [];
          
          // Now load all dashboard components in parallel
          this.loadDashboardData();
          
          this.progress = false;
          this.changeDetectorRef.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading customer data:', error);
          this.createFallbackCustomer();
          this.dashboardDetails = [];
          this.loadDashboardData();
          this.progress = false;
          this.changeDetectorRef.detectChanges();
        }
      })
    );
  }

  private createFallbackCustomer(): void {
    this.selectedCustomer = {
      cusT_ID: this.customerid,
      cusT_NM: 'Customer ' + this.customerid,
      industrY_TYPE: '',
      url: '',
      createD_BY: '',
      createD_DATE: new Date(),
      updateD_BY: '',
      updateD_DATE: new Date(),
      iS_SLA_AVAILABLE: false
    };
  }

  private loadDashboardData(): void {
    if (!this.selectedCustomer || !this.customerid) {
      this.fillGraphDefaults();
      return;
    }

    // Parallelize independent API calls using forkJoin for faster loading
    const requests = {
      projectScores: this.appsService.getSuccessGoalScoreForAPeriod(
        this.selectedCustomer.cusT_ID,
        this.sMonth,
        this.iYear,
        this.reset
      ).pipe(catchError(() => of({ projecT_SCORES: [] }))),
      
      tasksEvents: this.empId 
        ? this.appsService.getTasksEventsSummary(this.customerid, this.empId).pipe(catchError(() => of([])))
        : of([]),
      
      appreciations: this.appsService.getAppreciationDetails(this.customerid, false).pipe(catchError(() => of([]))),
      
      projects: this.projArray.length > 0 
        ? of(this.projArray.map((id: string) => ({ proJ_ID: id })))
        : this.appsService.getAllProjectsForCustomer(this.customerid).pipe(catchError(() => of([])))
    };

    // Execute all API calls in parallel
    this.subscriptions.add(
      forkJoin(requests).subscribe({
        next: (results) => {
          // Process project scores
          this.projectScores = results.projectScores.projecT_SCORES || [];
          
          if (this.projArray && this.projArray.length > 0 && this.projectScores) {
            this.projectScores = this.projectScores.filter((proj: any) => 
              this.projArray.includes(proj.proJ_ID)
            );
          }
          if (this.projectScores.length > 0) {
            this.highlights = this.projectScores[0].highlights || [];
          }
          this.temp = this.projectScores;
          this.GetProjectCAPACount();

          // Process tasks/events
          this.tasksEventsSummary = results.tasksEvents || [];
          this.processTasksEventsData();

          // Process appreciations
          const count = results.appreciations ? results.appreciations.length : 0;
          this.totalAppreciations = count;
          this.isAppreciationsEmpty = count === 0;
          this.appreciationHigh = '0';
          this.appreciationMedium = '0';
          this.appreciationLow = count.toString();

          // Process projects
          if (!this.projArray || this.projArray.length === 0) {
            this.projArray = results.projects.map((x: any) => x.proJ_ID);
          }
          this.applyProjectFilter();
        },
        error: (error: any) => {
          console.error('Error loading dashboard data:', error);
          this.fillGraphDefaults();
        }
      })
    );
  }

  private loadProjectScores(): void {
    if (!this.selectedCustomer) return;

    // Load success goal scores for the selected period
    this.subscriptions.add(
      this.appsService.getSuccessGoalScoreForAPeriod(
        this.selectedCustomer.cusT_ID,
        this.sMonth,
        this.iYear,
        this.reset
      ).subscribe({
        next: (data: any) => {
          // Extract project scores from the response
          this.projectScores = data.projecT_SCORES || [];
          
          // Apply project filter if any projects are selected
          if (this.projArray && this.projArray.length > 0 && this.projectScores) {
            this.projectScores = this.projectScores.filter((proj: any) => 
              this.projArray.includes(proj.proJ_ID)
            );
          }

          // Store highlights data
          this.temp = data.highlights || [];
          // Initially show "Month" highlights (week == 0)
          this.highlights = this.temp.filter((i: any) => i.week == 0);


          // Load CAPA data
          this.GetProjectCAPACount();
          
          // IMPORTANT: After filter applied and data loaded, keep reset=false
          // so the achievement trend uses the same filtered dates
          // Only reset back to true on page navigation or customer change
        },
        error: (error: any) => {
          console.error('Error loading project scores:', error);
          this.projectScores = [];
          this.highlights = [];
          this.temp = [];
        }
      })
    );
  }

  private loadTasksEventsSummary(): void {
    if (!this.customerid || !this.empId) return;

    // Call API to get tasks/events summary
    this.subscriptions.add(
      this.appsService.getTasksEventsSummary(this.customerid, this.empId).subscribe({
        next: (data: TasksEventsSummary[]) => {
          this.tasksEventsSummary = data || [];
          this.processTasksEventsData();
        },
        error: (error: any) => {
          console.error('Error loading tasks/events summary:', error);
          this.isTasksEventsEmpty = true;
          // Set empty data on error
          this.tasksEventsSummary = [
            this.createEmptyTasksEventsSummary('high'),
            this.createEmptyTasksEventsSummary('medium'),
            this.createEmptyTasksEventsSummary('low')
          ];
          this.processTasksEventsData();
        }
      })
    );
  }

  private loadAppreciationCount(): void {
    if (!this.customerid) return;

    // Load appreciation details to count them
    this.subscriptions.add(
      this.appsService.getAppreciationDetails(this.customerid, false).subscribe({
        next: (data: any[]) => {
          const count = data ? data.length : 0;
          this.totalAppreciations = count;
          this.isAppreciationsEmpty = count === 0;
          this.appreciationHigh = '0';
          this.appreciationMedium = '0';
          this.appreciationLow = count.toString();
        },
        error: (error: any) => {
          console.error('Error loading appreciations:', error);
          this.totalAppreciations = 0;
          this.isAppreciationsEmpty = true;
          this.appreciationHigh = '0';
          this.appreciationMedium = '0';
          this.appreciationLow = '0';
        }
      })
    );
  }

  private processTasksEventsData(): void {
    if (!this.tasksEventsSummary || this.tasksEventsSummary.length === 0) {
      this.isTasksEventsEmpty = true;
      return;
    }

    // Always show the chart, even with zero values
    this.isTasksEventsEmpty = false;

    // Extract data by priority
    this.eventTasksHighValues = this.tasksEventsSummary.find(x => x.priority?.toLowerCase() === 'high') || this.createEmptyTasksEventsSummary('high');
    this.eventTasksLowValues = this.tasksEventsSummary.find(x => x.priority?.toLowerCase() === 'low') || this.createEmptyTasksEventsSummary('low');
    this.eventTasksMediumValues = this.tasksEventsSummary.find(x => x.priority?.toLowerCase() === 'medium') || this.createEmptyTasksEventsSummary('medium');

    // Calculate total counts for display
    this.eventTasksHighCount = this.eventTasksHighValues.dueEvents + this.eventTasksHighValues.dueTasks;
    this.eventTasksMediumCount = this.eventTasksMediumValues.dueEvents + this.eventTasksMediumValues.dueTasks;
    this.eventTasksLowCount = this.eventTasksLowValues.dueEvents + this.eventTasksLowValues.dueTasks;
    
    // Calculate total for center label in donut chart
    this.totaltasksEvents = this.eventTasksHighCount + this.eventTasksMediumCount + this.eventTasksLowCount;

    // Prepare chart data for ColumnChart - showing Due and Overdue
    // Format: [['Priority', Due, Overdue], ...]
    this.tasksEventsSummaryData = [
      ['High', 
        this.eventTasksHighValues.dueEvents + this.eventTasksHighValues.dueTasks,
        this.eventTasksHighValues.overdueEvents + this.eventTasksHighValues.overdueTasks
      ],
      ['Medium', 
        this.eventTasksMediumValues.dueEvents + this.eventTasksMediumValues.dueTasks,
        this.eventTasksMediumValues.overdueEvents + this.eventTasksMediumValues.overdueTasks
      ],
      ['Low', 
        this.eventTasksLowValues.dueEvents + this.eventTasksLowValues.dueTasks,
        this.eventTasksLowValues.overdueEvents + this.eventTasksLowValues.overdueTasks
      ]
    ];
  }

  private createEmptyTasksEventsSummary(priority: string): TasksEventsSummary {
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

  // Navigation methods
  onPrev(): void {
    if (this.currIndex > 0) {
      this.currIndex--;
    }
  }

  onNext(): void {
    const maxIndex = this.isBaseMeasureEnabled ? 3 : 2;
    if (this.currIndex < maxIndex) {
      this.currIndex++;
    }
  }

  // KPI Edit flag method
  changKPIflag(): void {
    // Set KPI edit mode flag
    // This method is called before navigating to KPI edit page
    // Legacy uses this to set _shared.isKPIEdit = true
    this._shared.isKPIEdit = true;
  }

  // Filter methods
  Refresh_Onclick(): void {
    this.loadDashboardData();
  }

  getSelectedProjectsList(event: any): void {
    this.projArray = event;
    this.applyFilter();
  }

  getSelectedProdList(event: any): void {
    this.prodArray = event;
    this.applyFilter();
  }

  applyFilter(): void {
    // Re-load data with filters applied
    this.loadDashboardData();
  }

  // Utility methods
  resetValues(): void {
    this._shared.selectedPortfolios = [];
    this._shared.selectedProjects = [];
    this._shared.selectedProducts = [];
    
    // Set flag to prevent auto-redirect
    sessionStorage.setItem('skipAutoRedirect', 'true');
    
    // Force navigation by using window.location - this ensures a full page load
    // This is necessary because navigating between sibling routes may not trigger component reload
    window.location.href = '/newdashboard/custm';
  }

  // Success Goal table methods
  openAchievementtrendScreen(projId: string): void {
    
    if (!this.selectedCustomer) {
      console.error('No customer selected');
      return;
    }
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      'custid': this.selectedCustomer.cusT_ID,
      'projids': projId,
      // CRITICAL FIX: Pass filter month/year to achievement trend
      // Trend will show 6 months ending at the filtered date
      'filterMonth': this.sMonth,  // e.g., "Apr"
      'filterYear': this.iYear     // e.g., "2024"
    };
    dialogConfig.maxWidth = "95vw";
    dialogConfig.height = "600px";
    dialogConfig.width = "1200px";
    dialogConfig.panelClass = 'achievement-trend-dialog';
    
    const dialogRef = this.dialog.open(AchievementTrendComponent, dialogConfig);
  }

  viewQSPOC(projId: string, projName: string): void {
    if (!this.selectedCustomer) return;
    
    const dialog = this.dialog.open(QSPOCPopupComponent, {
      width: "55%",
      maxWidth: "750px",
      height: "85%",
      panelClass: 'qspoc-dialog-panel',
      data: {
        custid: this.selectedCustomer.cusT_ID,
        projids: projId,
        custname: this.selectedCustomer.cusT_NM,
        projname: projName
      },
    });
    
    dialog.afterClosed().subscribe((result) => {
      // Handle dialog close if needed
      if (result === undefined) {
        // Dialog was cancelled or closed
      }
    });
  }

  closeSuccessGoalFilter(): void {
    this.showSuccessGoalFilter = false;
  }

  applySuccessGoalFilter(): void {
    this.showSuccessGoalFilter = false;
    
    // CRITICAL FIX: Set reset = false when user explicitly selects month/year
    // This tells backend to use the selected dates, not last updated
    this.reset = false;
    
    // Reload dashboard data with new month/year filter
    this.loadCustomerData();
  }

  /**
   * Upload Project File - Frontier Customer Only
   * Opens a dialog to upload files for a specific project
   * Only available for Frontier customers (customerid === "202100007")
   * Requires access control permission (103, 1)
   * 
   * @param projId Project ID
   */
  UploadProjectFile(projId: string): void {
    if (!this.selectedCustomer) return;

    // Only show for Frontier customer
    if (!this.isFrontier) {
      console.warn('Upload Project File is only available for Frontier customers');
      return;
    }

    // Check access control
    if (!this._access.IsAllowed(103, 1, '', '')) {
      console.warn('User does not have permission to upload project files');
      return;
    }

    // TODO: Import and use ProjectFileUploadComponent when available
    // const dialog = this.dialog.open(ProjectFileUploadComponent, {
    //   width: "70%",
    //   height: "70%",
    //   data: {
    //     custid: this.selectedCustomer.cusT_ID,
    //     projids: projId,
    //   },
    // });
    // dialog.afterClosed().subscribe((result) => {
    //   // Refresh data if file was uploaded
    //   if (result) {
    //     this.loadProjectScores();
    //   }
    // });
    
  }

  UploadProjectFileFromHeader(): void {
    if (!this.selectedCustomer) return;

    // Only show for Frontier customer
    if (!this.isFrontier) {
      console.warn('Upload Project File is only available for Frontier customers');
      return;
    }

    // Check access control
    if (!this._access.IsAllowed(103, 1, '', '')) {
      console.warn('User does not have permission to upload project files');
      return;
    }

    // If only one project, use it directly
    if (this.projectScores && this.projectScores.length === 1) {
      this.UploadProjectFile(this.projectScores[0].proJ_ID);
      return;
    }

    // If multiple projects, show selection or use first project
    // For now, use the first project - can be enhanced to show a project selector dialog
    if (this.projectScores && this.projectScores.length > 0) {
      this.UploadProjectFile(this.projectScores[0].proJ_ID);
    } else {
      console.warn('No projects available for file upload');
    }
  }

  // Widget data processing methods
  private applyProjectFilter(): void {
    this.filterActionItems();
    this.filterRisks();
    this.filterIssues();
    this.filterAppreciations();
    this.filterProjectStatus();
  }

  private fillGraphDefaults(): void {
    this.fillGraphActionsItemsCircleDonoughtChart();
    this.fillGraphRisksCircleDonoughtChart();
    this.fillGraphIssuesCircleDonoughtChart();
    // Appreciation data is loaded separately via loadAppreciationCount()
    this.fillGraphProjectStatusSemicircleDonoughtChart();
  }

  private filterActionItems(): void {
    this.totalActionItems = 0;
    let data1 = 0;  // Due for closure
    let data2 = 0;  // Past due date
    let high = 0;
    let medium = 0;
    let low = 0;

    if (this.projArray.length === 0) {
      this.fillGraphActionsItemsCircleDonoughtChart();
      return;
    }

    this.projArray.forEach(x => {
      data1 = data1 + this.getGraphValue_project('DUE_FOR_CLOSURE', x);
      data2 = data2 + this.getGraphValue_project('PAST_DUE_DATE', x);
      high = high + this.getGraphValue_project('ACTION_ITEM_HIGH', x);
      medium = medium + this.getGraphValue_project('ACTION_ITEM_MEDIUM', x);
      low = low + this.getGraphValue_project('ACTION_ITEM_LOW', x);
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
    this.isActionItemsEmpty = this.totalActionItems === 0;

    this.data6 = [];
    this.data6.push(["Due for closure", data1]);
    this.data6.push(["Past due date", data2]);
    this.data6.push([null, this.totalActionItems]);
  }

  private filterRisks(): void {
    this.totalRisks = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    if (this.projArray.length === 0) {
      this.fillGraphRisksCircleDonoughtChart();
      return;
    }

    this.projArray.forEach(x => {
      data1 = data1 + this.getGraphValue_project('RISKS_DUE_FOR_CLOSURE', x);
      data2 = data2 + this.getGraphValue_project('RISKS_PAST_DUE_DATE', x);
      high = high + this.getGraphValue_project('RISKS_HIGH', x);
      medium = medium + this.getGraphValue_project('RISKS_MEDIUM', x);
      low = low + this.getGraphValue_project('RISKS_LOW', x);
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
    this.isRisksEmpty = this.totalRisks === 0;

    this.dataR = [];
    this.dataR.push(["Due for closure", data1]);
    this.dataR.push(["Past due date", data2]);
    this.dataR.push([null, this.totalRisks]);
  }

  private filterIssues(): void {
    this.totalIssues = 0;
    let data1 = 0;
    let data2 = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    if (this.projArray.length === 0) {
      this.fillGraphIssuesCircleDonoughtChart();
      return;
    }

    this.projArray.forEach(x => {
      data1 = data1 + this.getGraphValue_project('ISSUES_DUE_FOR_CLOSURE', x);
      data2 = data2 + this.getGraphValue_project('ISSUES_PAST_DUE_DATE', x);
      high = high + this.getGraphValue_project('ISSUES_HIGH', x);
      medium = medium + this.getGraphValue_project('ISSUES_MEDIUM', x);
      low = low + this.getGraphValue_project('ISSUES_LOW', x);
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
    this.isIssuesEmpty = this.totalIssues === 0;

    this.dataI = [];
    this.dataI.push(["Due for closure", data1]);
    this.dataI.push(["Past due date", data2]);
    this.dataI.push([null, this.totalIssues]);
  }

  private filterAppreciations(): void {
    // Appreciation data is already loaded by loadAppreciationCount()
    // It's customer-level data, not project-specific
    // No filtering needed - just keep the values already loaded
    return;
  }

  private filterProjectStatus(): void {
    this.totalProjects = 0;
    let data1 = 0;
    let data2 = 0;

    if (this.projArray.length === 0) {
      this.fillGraphProjectStatusSemicircleDonoughtChart();
      return;
    }

    this.projArray.forEach(x => {
      data1 = data1 + this.getGraphValue_project('PROJECT_TO_START', x);
      data2 = data2 + this.getGraphValue_project('PROJECT_TO_END', x);
    });

    this.projectToStart = data1;
    this.projectToEnd = data2;
    this.totalProjects = data1 + data2;
    this.isProjectStatusEmpty = this.totalProjects === 0;

    this.data5 = [];
    this.data5.push(["Projects to start", data1]);
    this.data5.push(["Projects to end", data2]);
    this.data5.push([null, this.totalProjects]);
  }

  private fillGraphActionsItemsCircleDonoughtChart(): void {
    let data1 = this.getGraphValue_customer('DUE_FOR_CLOSURE');
    let data2 = this.getGraphValue_customer('PAST_DUE_DATE');
    
    // Store STATUS counts for gauge
    this.actionItemDueForClosure = data1.toString();
    this.actionItemPastDueDate = data2.toString();
    
    // Store SEVERITY counts for stats display
    this.actionItemHigh = this.getTitleByCustomer('ACTION_ITEM_HIGH');
    this.actionItemMedium = this.getTitleByCustomer('ACTION_ITEM_MEDIUM');
    this.actionItemLow = this.getTitleByCustomer('ACTION_ITEM_LOW');
    
    // Total is based on STATUS counts (matching legacy)
    this.totalActionItems = data1 + data2;
    this.isActionItemsEmpty = this.totalActionItems === 0;

    this.data6 = [];
    this.data6.push(["Due for closure", data1]);
    this.data6.push(["Past due date", data2]);
    this.data6.push([null, this.totalActionItems]);
  }

  private fillGraphRisksCircleDonoughtChart(): void {
    let data1 = this.getGraphValue_customer('RISKS_DUE_FOR_CLOSURE');
    let data2 = this.getGraphValue_customer('RISKS_PAST_DUE_DATE');
    
    // Store STATUS counts for gauge
    this.riskDueForClosure = data1.toString();
    this.riskPastDueDate = data2.toString();
    
    // Store SEVERITY counts for stats display
    this.riskHigh = this.getTitleByCustomer('RISKS_HIGH');
    this.riskMedium = this.getTitleByCustomer('RISKS_MEDIUM');
    this.riskLow = this.getTitleByCustomer('RISKS_LOW');
    
    // Total is based on STATUS counts (matching legacy)
    this.totalRisks = data1 + data2;
    this.isRisksEmpty = this.totalRisks === 0;

    this.dataR = [];
    this.dataR.push(["Due for closure", data1]);
    this.dataR.push(["Past due date", data2]);
    this.dataR.push([null, this.totalRisks]);
  }

  private fillGraphIssuesCircleDonoughtChart(): void {
    let data1 = this.getGraphValue_customer('ISSUES_DUE_FOR_CLOSURE');
    let data2 = this.getGraphValue_customer('ISSUES_PAST_DUE_DATE');
    
    // Store STATUS counts for gauge
    this.issueDueForClosure = data1.toString();
    this.issuePastDueDate = data2.toString();
    
    // Store SEVERITY counts for stats display
    this.issueHigh = this.getTitleByCustomer('ISSUES_HIGH');
    this.issueMedium = this.getTitleByCustomer('ISSUES_MEDIUM');
    this.issueLow = this.getTitleByCustomer('ISSUES_LOW');
    
    // Total is based on STATUS counts (matching legacy)
    this.totalIssues = data1 + data2;
    this.isIssuesEmpty = this.totalIssues === 0;

    this.dataI = [];
    this.dataI.push(["Due for closure", data1]);
    this.dataI.push(["Past due date", data2]);
    this.dataI.push([null, this.totalIssues]);
  }

  private fillGraphProjectStatusSemicircleDonoughtChart(): void {
    let data1 = this.getGraphValue_customer('PROJECT_TO_START');
    let data2 = this.getGraphValue_customer('PROJECT_TO_END');
    
    this.projectToStart = data1;
    this.projectToEnd = data2;
    this.totalProjects = data1 + data2;
    this.isProjectStatusEmpty = this.totalProjects === 0;

    this.data5 = [];
    this.data5.push(["Projects to start", data1]);
    this.data5.push(["Projects to end", data2]);
    this.data5.push([null, this.totalProjects]);
  }

  private getGraphValue_customer(title: string): number {
    let iValue = 0;
    let sValue = this.getTitleByCustomer(title);

    if (sValue !== '-') {
      sValue = sValue.replace("%", "");
    } else {
      sValue = '0';
    }

    if (sValue !== undefined) {
      iValue = Number(sValue);
    }
    return iValue;
  }

  private getGraphValue_project(title: string, projid: string): number {
    let iValue = 0;
    let sValue = this.getTitleByProject(title, projid);
    
    if (sValue !== undefined && sValue !== "-") {
      sValue = sValue.replace(/\D/g, "");
      iValue = Number(sValue);
    } else {
      iValue = 0;
    }
    return iValue;
  }

  private getTitleByCustomer(title: string): string {
    let content: string = '';

    if (this.dashboardDetails !== undefined && this.dashboardDetails.length > 0) {
      let details: any[] = [];
      details = this.dashboardDetails.filter(t => 
        t.title === title && t.proJ_ID === null && t.portfoliO_ID === null
      );
      if (details.length > 0) {
        content = details[0].content;
      }
    }

    return content;
  }

  private getTitleByProject(title: string, projid: string): string {
    let content: string = '';

    if (this.dashboardDetails !== undefined && this.dashboardDetails.length > 0) {
      let details: any[] = [];
      details = this.dashboardDetails.filter(t => 
        t.title === title && t.proJ_ID === projid
      );
      if (details.length > 0) {
        content = details[0].content;
      }
    }

    return content;
  }

  // Key Highlights methods
  weekChange(event: any): void {
    setTimeout(() => {
      this.highlights = [];
      this.highlights = this.temp.filter(i => {
        return (i.week == event.value);
      });
    }, 500);
  }

  showKPINotesForCustomer(): void {
    if (!this.selectedCustomer) return;

    // Check access control (13, 3)
    if (!this._access.IsAllowed(13, 3, '', '')) {
      console.warn('User does not have permission to edit key highlights');
      return;
    }

    // Open AddNotesComponent dialog
    this.subscriptions.add(
      this.chartsService.getNotesForCustomer(this.selectedCustomer?.cusT_ID || '').subscribe({
        next: (notes: any[]) => {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.autoFocus = true;
          dialogConfig.data = {
            'notes': notes,
            'custid': this.selectedCustomer?.cusT_ID || ''
          };
          dialogConfig.maxWidth = "100%";
          dialogConfig.height = "100%";
          dialogConfig.width = "100vw";
          dialogConfig.panelClass = "myPanel";
          const dialogRef = this.dialog.open(AddNotesComponent, dialogConfig);
          
          // Reload project scores (which includes highlights) when dialog closes
          dialogRef.afterClosed().subscribe(() => {
            this.loadProjectScores();
          });
        },
        error: (error: any) => {
          console.error('Error loading notes:', error);
          this._util.serviceError(error);
        }
      })
    );

  }

  // Contract Status methods
  GetProjectForecast(): void {
    if (!this.selectedCustomer) return;

    this.subscriptions.add(
      this.appsService.getProjectForeCastForCustomer(this.selectedCustomer.cusT_ID).subscribe({
        next: (data: any) => {
          if (data != null && this.selectedCustomer) {
            let projectforecast = data;
            
            // Filter by selected projects if any
            if (this._shared.selectedProjects.length > 0) {
              projectforecast = {
                projectend: data.projectend.filter((p: any) => this._shared.selectedProjects.includes(p.proJ_ID)),
                projectstart: data.projectstart.filter((p: any) => this._shared.selectedProjects.includes(p.proJ_ID)),
                projresrc: data.projresrc.filter((p: any) => this._shared.selectedProjects.includes(p.proJ_ID))
              };
            }

            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = false;
            dialogConfig.data = {
              'projectStatus': projectforecast,
              'custName': this.selectedCustomer.cusT_NM
            };
            dialogConfig.width = '860px';
            dialogConfig.maxWidth = '95vw';
            dialogConfig.maxHeight = '90vh';
            dialogConfig.panelClass = 'apple-dialog-panel';
            dialogConfig.hasBackdrop = true;
            dialogConfig.disableClose = false;
            dialogConfig.restoreFocus = false;
            const dialogRef = this.dialog.open(ProjectStatusComponent, dialogConfig);
          }
        },
        error: (error: any) => {
          console.error('Error loading project forecast:', error);
        }
      })
    );
  }

  // Service Improvement Plan methods
  private GetProjectCAPACount(): void {
    if (!this.selectedCustomer) return;

    // API expects month name (e.g., "Jan", "Feb") and year as number
    // sMonth is already a month name from monthNames array
    this.subscriptions.add(
      this.appsService.GetProjectCAPACount(
        this.selectedCustomer.cusT_ID,
        this.sMonth,  // Pass month name directly (e.g., "Jan", "Feb")
        parseInt(this.iYear)
      ).subscribe({
        next: (data: any[]) => {
          this.projectCAPACount = data || [];
        },
        error: (error: any) => {
          console.error('Error loading project CAPA count:', error);
          this.projectCAPACount = [];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.mobileQuery.removeListener(() => {});
  }
}

import { Component, OnInit, OnChanges, OnDestroy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

// Services
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';

/**
 * CSM Customer Dashboard Component - Phase 1
 * Migrated from Angular 6 to Angular 19
 * 
 * Displays comprehensive customer dashboard with:
 * - Customer logo and header
 * - Success goals/KPI performance
 * - Account health (Premier customers)
 * - Risks and issues tracking
 * - Action items
 * - Contract status
 * - Events and tasks
 */
@Component({
  selector: 'app-csm-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatProgressBarModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './csm-customer-dashboard.component.html',
  styleUrls: ['./csm-customer-dashboard.component.scss']
})
export class CsmCustomerDashboardComponent implements OnInit, OnChanges, OnDestroy {
  // Dependency Injection
  private readonly router = inject(Router);
  private readonly appService = inject(AppsService);
  public readonly _util = inject(MyUtility);

  // Inputs from parent
  @Input() customerId: string = '';
  @Input() projId: string[] = [];
  @Input() portfolioId: number[] = [];

  // Component State
  progress: boolean = false;
  showFilter: boolean = false;
  
  // Date/Period Selection
  selectedPeriod: string = 'currPeriod';
  currentDate: Date = new Date();
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  financialYearRange: string = '';
  startDate = new Date();
  endDate = new Date();
  fromDate = new Date();
  toDate = new Date();
  lblfromDate: string = '';
  lbltoDate: string = '';

  // Success Goal/KPI Data
  sMonth: string = '';
  iYear: number = new Date().getFullYear();
  performance: string = '0%';
  quality: string = '0%';
  compliance: string = '0%';
  value: string = '0%';
  performanceBar: number = 0;
  qualityBar: number = 0;
  compilanceBar: number = 0;
  valueBar: number = 0;
  projectScores: any[] = [];
  gaugeData: any[] = [['Label', 'Value'], ['Score', 0]];

  // Account Health Data (Premier customers)
  healthData: any[] = [];
  needControl: any[] = [];
  underControl: any[] = [];
  selectedHealthTab: number = 0;

  // Risk Data
  isRisksEmpty: boolean = true;
  totalRisks: number = 0;
  riskHigh: string = '0';
  riskMedium: string = '0';
  riskLow: string = '0';
  isRiskAreaEmpty: boolean = false;

  // Issue Data
  isIssuesEmpty: boolean = true;
  totalIssues: number = 0;
  issueHigh: string = '0';
  issueMedium: string = '0';
  issueLow: string = '0';
  isIssueAreaEmpty: boolean = false;

  // Action Items Data
  isActionItemsEmpty: boolean = true;
  totalActionItems: number = 0;
  actionItemHigh: string = '0';
  actionItemMedium: string = '0';
  actionItemLow: string = '0';
  isActionAreaItemsEmpty: boolean = false;

  // Contract Status Data
  isProjectStatusEmpty: boolean = true;
  projectToStart: number = 0;
  projectToEnd: number = 0;
  pmCount: number = 0;
  memberCount: number = 0;
  qualityCount: number = 0;

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(): void {
    if (this.customerId) {
      this.loadDashboardData();
    }
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  /**
   * Initialize component with default values
   */
  private initializeComponent(): void {
    // Calculate financial year range
    const currentDate = new Date();
    const month = currentDate.getMonth();
    
    if (month >= 3) {
      this.financialYearRange = currentDate.getFullYear().toString().substr(2) + '-' + 
                                 (currentDate.getFullYear() + 1).toString().substr(2);
    } else {
      this.financialYearRange = (currentDate.getFullYear() - 1).toString().substr(2) + '-' + 
                                 currentDate.getFullYear().toString().substr(2);
    }

    // Set current month and year
    this.sMonth = this.monthNames[currentDate.getMonth()];
    this.iYear = currentDate.getFullYear();

    // Initialize date labels
    this.updateDateLabels();
  }

  /**
   * Load dashboard data for the selected customer
   */
  private loadDashboardData(): void {
    if (!this.customerId) {
      console.warn('CSM Dashboard: No customer ID provided');
      return;
    }

    this.progress = true;

    // TODO: Load actual dashboard data from APIs
    // For Phase 1, we're setting up the structure
    // Data loading will be implemented in Phase 2

    // Simulate data loading
    setTimeout(() => {
      this.progress = false;
    }, 500);
  }

  /**
   * Refresh dashboard data
   */
  Refresh_Onclick(): void {
    this.loadDashboardData();
  }

  /**
   * Toggle filter visibility
   */
  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  /**
   * Handle period selection change
   */
  selectedPeriod_OnChange(): void {
    this.updateDateLabels();
  }

  /**
   * Apply period selection
   */
  periodSelectionChange(period: string): void {
    this.selectedPeriod = period;
    this.updateDateLabels();
    this.loadDashboardData();
  }

  /**
   * Handle account health tab change
   */
  OntabChange(index: number): void {
    this.selectedHealthTab = index;
  }

  /**
   * Update date labels based on selected dates
   */
  private updateDateLabels(): void {
    this.lblfromDate = this.formatDate(this.fromDate);
    this.lbltoDate = this.formatDate(this.toDate);
  }

  /**
   * Format date as string
   */
  private formatDate(date: Date): string {
    const month = this.monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  /**
   * Navigate to risk details
   */
  openRiskPopUp(): void {
    // TODO: Implement risk popup
  }

  /**
   * Navigate to issue details
   */
  openIssuePopUp(): void {
    // TODO: Implement issue popup
  }

  /**
   * Navigate to project forecast
   */
  GetProjectForecast(custId: string): void {
    // TODO: Implement project forecast
  }

  /**
   * Navigate back or change path
   */
  changflagPath(): void {
    // TODO: Implement navigation
  }
}

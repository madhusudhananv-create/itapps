import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { AppsService } from '../../../core/services/apps.service';
import { AuthService } from '../../../core/services/auth.service';
import { MyUtility } from '../../../shared/my-utility';
import { CustomerModel } from '../../../models/customer.model';
import { DashboardDetailsModel } from '../../../models/dashboard-details.model';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { DialogInfoComponent, DialogInfoData } from '../../../controls/dialog-info/dialog-info.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard-customer-multiple',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatProgressBarModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    NavbarNewComponent
  ],
  templateUrl: './dashboard-customer-multiple.component.html',
  styleUrls: ['./dashboard-customer-multiple.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'style': 'display: block; margin: 0 !important; padding: 0 !important;'
  }
})
export class DashboardCustomerMultipleComponent implements OnInit, OnDestroy {
  progress: boolean = false;
  dashboardDetails: DashboardDetailsModel[] = [];
  dashboardDetailsCustomerLevel: DashboardDetailsModel[] = [];
  customerList: CustomerModel[] = [];
  filteredCustomerList: CustomerModel[] = []; // For Account Repository display (includes search + BU filter)
  buFilteredCustomerList: CustomerModel[] = []; // For metrics cards (BU filter only, no search)
  searchTerm: string = '';
  
  // Sort properties
  sortField: string = 'name-asc'; // Default sort: Name A-Z
  sortMenuOpen: boolean = false;
  sortOptions = [
    { value: 'name-asc', label: 'Name: A → Z', icon: 'sort_by_alpha' },
    { value: 'name-desc', label: 'Name: Z → A', icon: 'text_rotation_down' },
       { value: 'projects-desc', label: 'Projects: Most → Least', icon: 'folder' },
    { value: 'projects-asc', label: 'Projects: Least → Most', icon: 'folder_open' },
    { value: 'risks-desc', label: 'Risks: High → Low', icon: 'trending_down' },
    { value: 'risks-asc', label: 'Risks: Low → High', icon: 'trending_up' },
    { value: 'issues-desc', label: 'Issues: High → Low', icon: 'warning' },
    { value: 'issues-asc', label: 'Issues: Low → High', icon: 'check_circle' },
    { value: 'actions-desc', label: 'Action Items: High → Low', icon: 'assignment' },
    { value: 'actions-asc', label: 'Action Items: Low → High', icon: 'assignment_turned_in' }

  ];
  
  // BU Dropdown - Using project businesS_UNIT field
  selectedBU: string = 'All';
  previousBU: string = 'All';
  buOptions: string[] = ['All']; // Will be populated from API
  customerBUMapping: Map<string, string[]> = new Map(); // Maps customer ID to array of BU names from projects
  buMappingLoaded: boolean = false;
  
  // Cache for expensive calculations
  private cachedRiskTotal: string | null = null;
  private cachedIdeasTotal: string | null = null;
  
  // Dashboard details loading state
  private dashboardDetailsLoading: boolean = false;
  
  // Selected month/year for viewing
  selectedDate: Date = new Date();
  
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  // CRISP pill definitions for the summary bar
  crispItems = [
    { key: 'CRISP_C', letter: 'C', label: 'ustomer Success Goals', sub: '(C)', hasTrend: true },
    { key: 'CRISP_R', letter: 'R', label: 'isk & Issues',          sub: '(R)', hasTrend: false },
    { key: 'CRISP_I', letter: 'I', label: 'deas & Innovations',    sub: '(I)', hasTrend: false },
    { key: 'CRISP_S', letter: 'S', label: 'ervice Success',        sub: '(S)', hasTrend: true },
    { key: 'CRISP_P', letter: 'P', label: 'rocess Compliance',     sub: '(P)', hasTrend: true },
  ];

  // Timer properties
  timeLeft: number = 600;
  interval: any;

  // Edit state tracking for customers
  EditCustIndex: number = -1;
  EditCustId: string = '';

  // Edit state tracking for projects
  EditProjIndex: number = -1;
  EditProjId: string = '';

  // Domain configuration from environment
  domainConfig = {
    domain: environment.domain_name
  };

  // User info
  empid: string = '';
  displayname: string = '';

  // RAG count properties
  greenCount: number = 0;
  amberCount: number = 0;
  redCount: number = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private appsService: AppsService,
    private authService: AuthService,
    private myUtility: MyUtility,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private dialog: MatDialog
  ) {
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.empid = localStorage.getItem('empid') || '';
    this.displayname = localStorage.getItem('displayname') || '';

    // Check if user explicitly navigated to enterprise dashboard (not auto-redirected)
    // This prevents redirect loop when user clicks back button from single-account view
    const navigationState = this.router.getCurrentNavigation()?.extras?.state;
    const skipAutoRedirect = navigationState?.['skipAutoRedirect'] === true;
    
    // Store the skip flag for this session
    if (skipAutoRedirect) {
      sessionStorage.setItem('skipAutoRedirect', 'true');
    }

    // FIX: Always invalidate BU mapping cache on page load so backend changes
    // (e.g. renamed Business Units) are reflected immediately without manual cache clear.
    this.invalidateBUMappingCache();

    // Restore dashboard stats from cache for INSTANT display of risk count
    this.restoreDashboardStatsCache();

    // Start loading dashboard details IMMEDIATELY using cached customer IDs (parallel with customer list load)
    const cachedCustomers = this.getCachedCustomerIds();
    if (cachedCustomers.length > 0) {
      this.loadDashboardDetailsFromCustomerIds(cachedCustomers);
    }

    // Load customers (this will refresh with latest customer list)
    this.service_LoadCustomerByEmpId();
    this.startTimer();
  }

  // Close sort menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const sortContainer = target.closest('.sort-dropdown-container');
    
    if (!sortContainer && this.sortMenuOpen) {
      this.sortMenuOpen = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.pauseTimer();
  }

  // Timer methods
  startTimer(): void {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.changeDetectorRef.markForCheck(); // Trigger change detection for OnPush strategy
      } else {
        this.timeLeft = 600;
        this.service_refreshDashboardDetails();
      }
    }, 1000);
  }

  pauseTimer(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // Refresh handler
  Refresh_Onclick(): void {
    this.service_refreshDashboardDetails();
  }

  // Helper methods to get dashboard data by category
  getTitleByCustomer(crisp_category: string): string {
    // Use cache for risk and ideas totals
    if (crisp_category === 'RISK_ISSUE_TOTAL' && this.cachedRiskTotal !== null) {
      return this.cachedRiskTotal;
    }
    if (crisp_category === 'IDEAS' && this.cachedIdeasTotal !== null) {
      return this.cachedIdeasTotal;
    }
    
    // First try to find an overall record (no cusT_ID)
    const detail = this.dashboardDetails.find(d => d.title === crisp_category && !d.cusT_ID);
    
    if (detail) {
      return detail.content || '';
    }
    
    // Special handling for RISK_ISSUE_TOTAL - calculate from H+M+L for accuracy
    if (crisp_category === 'RISK_ISSUE_TOTAL') {
      const highRecords = this.dashboardDetailsCustomerLevel.filter(d => d.title === 'RISK_ISSUE_H_TOTAL' && !d.proJ_ID);
      const mediumRecords = this.dashboardDetailsCustomerLevel.filter(d => d.title === 'RISK_ISSUE_M_TOTAL' && !d.proJ_ID);
      const lowRecords = this.dashboardDetailsCustomerLevel.filter(d => d.title === 'RISK_ISSUE_L_TOTAL' && !d.proJ_ID);
      
      const highTotal = highRecords.reduce((sum, record) => {
        const val = parseInt(record.content || '0', 10);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      const mediumTotal = mediumRecords.reduce((sum, record) => {
        const val = parseInt(record.content || '0', 10);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      const lowTotal = lowRecords.reduce((sum, record) => {
        const val = parseInt(record.content || '0', 10);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      
      const total = highTotal + mediumTotal + lowTotal;
      const result = total.toString();
      
      // Cache the result
      this.cachedRiskTotal = result;
      return result;
    }
    
    // If no overall record found, aggregate from customer-level data for IDEAS
    if (crisp_category === 'IDEAS') {
      const customerLevelRecords = this.dashboardDetailsCustomerLevel.filter(
        d => d.title === crisp_category && !d.proJ_ID
      );
      
      const total = customerLevelRecords.reduce((sum, record) => {
        const value = parseInt(record.content || '0', 10);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      
      const result = total.toString();
      
      // Cache the result
      this.cachedIdeasTotal = result;
      return result;
    }
    
    return '0';
  }

  getTitleByCustomerId(crisp_category: string, customer_id: string): string {
    // dashboardDetailsCustomerLevel is pre-filtered to only have proJ_ID == null records
    if (!this.dashboardDetailsCustomerLevel?.length) return '';
    const firstLevel = this.dashboardDetailsCustomerLevel.filter(t => t.cusT_ID === customer_id);
    
    // Special handling for RISK_ISSUE_TOTAL - calculate from H+M+L for accuracy
    if (crisp_category === 'RISK_ISSUE_TOTAL') {
      const high = parseInt(firstLevel.find(t => t.title === 'RISK_ISSUE_H_TOTAL')?.content || '0', 10);
      const medium = parseInt(firstLevel.find(t => t.title === 'RISK_ISSUE_M_TOTAL')?.content || '0', 10);
      const low = parseInt(firstLevel.find(t => t.title === 'RISK_ISSUE_L_TOTAL')?.content || '0', 10);
      
      const calculatedTotal = (isNaN(high) ? 0 : high) + (isNaN(medium) ? 0 : medium) + (isNaN(low) ? 0 : low);
      
      // Return the calculated total instead of stored value to ensure accuracy
      return calculatedTotal.toString();
    }
    
    // Special handling for RISK_TOTAL - calculate from H+M+L, with fallback to status counts
    if (crisp_category === 'RISK_TOTAL') {
      const high = parseInt(firstLevel.find(t => t.title === 'RISKS_HIGH')?.content || '0', 10);
      const medium = parseInt(firstLevel.find(t => t.title === 'RISKS_MEDIUM')?.content || '0', 10);
      const low = parseInt(firstLevel.find(t => t.title === 'RISKS_LOW')?.content || '0', 10);
      
      const severityTotal = (isNaN(high) ? 0 : high) + (isNaN(medium) ? 0 : medium) + (isNaN(low) ? 0 : low);
      
      // If severity counts are available, use them
      if (severityTotal > 0) {
        return severityTotal.toString();
      }
      
      // Fallback: Calculate from status counts if severity data is missing
      const pastDue = parseInt(firstLevel.find(t => t.title === 'RISKS_PAST_DUE_DATE')?.content || '0', 10);
      const dueClosure = parseInt(firstLevel.find(t => t.title === 'RISKS_DUE_FOR_CLOSURE')?.content || '0', 10);
      const statusTotal = (isNaN(pastDue) ? 0 : pastDue) + (isNaN(dueClosure) ? 0 : dueClosure);
      
      return statusTotal.toString();
    }
    
    // Special handling for ISSUE_TOTAL - calculate from H+M+L, with fallback to status counts
    if (crisp_category === 'ISSUE_TOTAL') {
      const high = parseInt(firstLevel.find(t => t.title === 'ISSUES_HIGH')?.content || '0', 10);
      const medium = parseInt(firstLevel.find(t => t.title === 'ISSUES_MEDIUM')?.content || '0', 10);
      const low = parseInt(firstLevel.find(t => t.title === 'ISSUES_LOW')?.content || '0', 10);
      
      const severityTotal = (isNaN(high) ? 0 : high) + (isNaN(medium) ? 0 : medium) + (isNaN(low) ? 0 : low);
      
      // If severity counts are available, use them
      if (severityTotal > 0) {
        return severityTotal.toString();
      }
      
      // Fallback: Calculate from status counts if severity data is missing
      const pastDue = parseInt(firstLevel.find(t => t.title === 'ISSUES_PAST_DUE_DATE')?.content || '0', 10);
      const dueClosure = parseInt(firstLevel.find(t => t.title === 'ISSUES_DUE_FOR_CLOSURE')?.content || '0', 10);
      const statusTotal = (isNaN(pastDue) ? 0 : pastDue) + (isNaN(dueClosure) ? 0 : dueClosure);
      
      return statusTotal.toString();
    }
    
    // Special handling for ACTION_ITEMS - calculate from H+M+L, with fallback to status counts
    if (crisp_category === 'OPEN_ACTION_ITEMS' || crisp_category === 'ACTION_ITEMS_TOTAL') {
      const high = parseInt(firstLevel.find(t => t.title === 'ACTION_ITEM_HIGH')?.content || '0', 10);
      const medium = parseInt(firstLevel.find(t => t.title === 'ACTION_ITEM_MEDIUM')?.content || '0', 10);
      const low = parseInt(firstLevel.find(t => t.title === 'ACTION_ITEM_LOW')?.content || '0', 10);
      
      const severityTotal = (isNaN(high) ? 0 : high) + (isNaN(medium) ? 0 : medium) + (isNaN(low) ? 0 : low);
      
      // If severity counts are available, use them
      if (severityTotal > 0) {
        return severityTotal.toString();
      }
      
      // Fallback: Calculate from status counts if severity data is missing
      const pastDue = parseInt(firstLevel.find(t => t.title === 'PAST_DUE_DATE')?.content || '0', 10);
      const dueClosure = parseInt(firstLevel.find(t => t.title === 'DUE_FOR_CLOSURE')?.content || '0', 10);
      const statusTotal = (isNaN(pastDue) ? 0 : pastDue) + (isNaN(dueClosure) ? 0 : dueClosure);
      
      return statusTotal.toString();
    }
    
    const detail = firstLevel.find(t => t.title === crisp_category);
    return detail?.content || '';
  }

  // Get total for BU-filtered customers only (excludes search filter)
  getFilteredTotal(crisp_category: string): string {
    if (!this.dashboardDetailsCustomerLevel?.length) return '0';
    
    // Use BU-filtered list only (not search-filtered) for metrics cards
    const filteredCustomerIds = this.buFilteredCustomerList.map(c => c.cusT_ID);
    
    // Special handling for RISK_TOTAL - calculate from individual accounts
    if (crisp_category === 'RISK_TOTAL') {
      let total = 0;
      filteredCustomerIds.forEach(custId => {
        const accountRisks = parseInt(this.getTitleByCustomerId('RISK_TOTAL', custId), 10);
        total += isNaN(accountRisks) ? 0 : accountRisks;
      });
      return total.toString();
    }

    // Special handling for ISSUE_TOTAL - calculate from individual accounts
    if (crisp_category === 'ISSUE_TOTAL') {
      let total = 0;
      filteredCustomerIds.forEach(custId => {
        const accountIssues = parseInt(this.getTitleByCustomerId('ISSUE_TOTAL', custId), 10);
        total += isNaN(accountIssues) ? 0 : accountIssues;
      });
      return total.toString();
    }

    // Legacy support for RISK_ISSUE_TOTAL - use direct field or calculate
    if (crisp_category === 'RISK_ISSUE_TOTAL') {
      // Try using RISK_ISSUE_TOTAL field directly first
      const directRecords = this.dashboardDetailsCustomerLevel.filter(
        d => d.title === 'RISK_ISSUE_TOTAL' && !d.proJ_ID && filteredCustomerIds.includes(d.cusT_ID || '')
      );
      
      if (directRecords.length > 0) {
        const total = directRecords.reduce((sum, record) => {
          const val = parseInt(record.content || '0', 10);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
        return total.toString();
      }
      
      // Fallback: calculate from RISK_TOTAL + ISSUE_TOTAL
      const riskTotal = parseInt(this.getFilteredTotal('RISK_TOTAL'), 10) || 0;
      const issueTotal = parseInt(this.getFilteredTotal('ISSUE_TOTAL'), 10) || 0;
      return (riskTotal + issueTotal).toString();
    }
    
    // Filter records to only include BU-filtered customers
    const filteredRecords = this.dashboardDetailsCustomerLevel.filter(
      d => d.title === crisp_category && !d.proJ_ID && filteredCustomerIds.includes(d.cusT_ID || '')
    );
    
    const total = filteredRecords.reduce((sum, record) => {
      const value = parseInt(record.content || '0', 10);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    return total.toString();
  }

  getColorByCustomer(crisp_category: string): string {
    if (!this.dashboardDetailsCustomerLevel?.length) return '';
    const detail = this.dashboardDetailsCustomerLevel.find(
      t => t.title === crisp_category && !t.proJ_ID && !t.portfoliO_ID
    );
    return detail?.color || '';
  }


  getColorByCustomerId(crisp_category: string, customer_id: string): string {
    if (!this.dashboardDetailsCustomerLevel?.length) return '';
    const detail = this.dashboardDetailsCustomerLevel.find(
      t => t.title === crisp_category && t.cusT_ID === customer_id && !t.proJ_ID && !t.portfoliO_ID
    );
    return detail?.color || '';
  }

  // Debug method - call once to see data for first customer
  debugRiskIssueData(): void {
    if (this.customerList.length === 0) return;
    const firstCust = this.customerList[0];
    
    // Find all RISK_ISSUE records for this customer
    const riskIssueRecords = this.dashboardDetailsCustomerLevel.filter(
      d => d.cusT_ID === firstCust.cusT_ID && d.title?.includes('RISK')
    );
  }

  getTitleByPortfolio(crisp_category: string, portfolio_id: number): string {
    const detail = this.dashboardDetails.find(
      d => d.title === crisp_category && d.portfoliO_ID === portfolio_id
    );
    return detail ? detail.content || '' : '';
  }

  getGraphValue_portfolio(crisp_category: string, portfolio_id: number): number {
    const title = this.getTitleByPortfolio(crisp_category, portfolio_id);
    return parseFloat(title) || 0;
  }

  // Check if customer has any risks/issues
  hasRisksOrIssues(customer_id: string): boolean {
    const total = this.getTitleByCustomerId('RISK_ISSUE_TOTAL', customer_id);
    return total !== '' && total !== '0' && total !== '-';
  }

  // Get project count for a customer
  getProjectCount(customer_id: string): number {
    if (!this.dashboardDetails?.length) return 0;
    
    // Get unique project IDs for this customer
    const uniqueProjects = new Set<string>();
    this.dashboardDetails
      .filter(d => d.cusT_ID === customer_id && d.proJ_ID)
      .forEach(d => {
        if (d.proJ_ID) uniqueProjects.add(d.proJ_ID);
      });
    
    return uniqueProjects.size;
  }

  
  // Authentication helper
  Authenticate1(): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.appsService.authenticatewithtoken(token);
  }

  createAuthorizationHeader(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  // UI interaction methods
  getClientBG(index: number, customer_id: string): string {
    return (this.EditCustIndex === index && this.EditCustId === customer_id) ? 'lightgray' : 'white';
  }

  getProjectBG(index: number, project_id: string): string {
    return (this.EditProjIndex === index && this.EditProjId === project_id) ? 'lightgray' : 'white';
  }

  GetLastUpdateDate(projId: string): void {
    this.appsService.getLastUpdatedDate(projId).subscribe({
      error: (error: any) => console.error('Error getting last update date:', error)
    });
  }

  getProjectColor(index: number, project_id: string): string {
    return (this.EditProjIndex === index && this.EditProjId === project_id) ? 'black' : '#524f4f';
  }

  OverallStatus_onClick(customer_id: string): void {
    const overallHealth = this.getTitleByCustomerId('OVERALL_HEALTH', customer_id);
    this.myUtility.showWarningPopup(`Overall Health: ${overallHealth}`, 'Customer Health Status');
  }

  // Customer RAG editing methods
  EditCust_onClick(index: number, customer_id: string): void {
    this.EditCustIndex = index;
    this.EditCustId = customer_id;
  }

  IsReadonlyCust(index: number, customer_id: string): boolean {
    return !(this.EditCustIndex === index && this.EditCustId === customer_id);
  }

  SaveCust_onClick(customer: CustomerModel, newRag: string): void {
    this.service_updateClientRag(customer, newRag);
    this.EditCustIndex = -1;
    this.EditCustId = '';
  }

  CancelCust_onClick(): void {
    this.EditCustIndex = -1;
    this.EditCustId = '';
  }

  // Project RAG editing methods
  EditProj_onClick(index: number, project_id: string): void {
    this.EditProjIndex = index;
    this.EditProjId = project_id;
  }

  IsReadonlyProj(index: number, project_id: string): boolean {
    return !(this.EditProjIndex === index && this.EditProjId === project_id);
  }

  SaveProj_onClick(project: any, category: string, newRag: string): void {
    this.service_updateRags(project, category, newRag);
    this.EditProjIndex = -1;
    this.EditProjId = '';
  }

  CancelProj_onClick(): void {
    this.EditProjIndex = -1;
    this.EditProjId = '';
  }

  today(): Date { return new Date(); }

  // Service methods
  service_updateClientRag(customer: CustomerModel, newRag: string): void {
    const clientData = {
      CUSTOMER_ID: customer.cusT_ID,
      CUSTOMER_NAME: customer.cusT_NM,
      RAG: newRag,
      UPDATED_BY: this.empid,
      UPDATED_DATE: new Date().toISOString()
    };
    this.appsService.updateClient(clientData).subscribe({
      error: (error: any) => { console.error(error); this.myUtility.showWarningPopup('Error updating client status', 'Update Error'); }
    });
  }

  service_updateRags(project: any, category: string, newRag: string): void {
    const ragData = {
      PROJECT_ID: project.proJ_ID,
      CATEGORY: category,
      RAG: newRag,
      PUBLISHED_ON: new Date().toISOString(),
      UPDATED_BY: this.empid,
      UPDATED_DATE: new Date().toISOString()
    };
    this.appsService.updateRags(ragData).subscribe({
      error: (error: any) => { console.error(error); this.myUtility.showWarningPopup('Error updating project status', 'Update Error'); }
    });
  }

  ShowSideNav(): boolean { return window.innerWidth > 600; }

  // Get current/selected month and year for UI display
  getCurrentMonthYear(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return this.selectedDate.toLocaleDateString('en-US', options);
  }

  // Navigate to previous month
  goToPreviousMonth(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.selectedDate = newDate;
    this.changeDetectorRef.markForCheck();
  }

  // Navigate to next month (up to current month)
  goToNextMonth(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const now = new Date();
    
    // Don't allow going beyond current month
    if (newDate <= now) {
      this.selectedDate = newDate;
      this.changeDetectorRef.markForCheck();
    }
  }

  // Check if we can go to next month
  canGoToNextMonth(): boolean {
    const nextMonth = new Date(this.selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const now = new Date();
    return nextMonth <= now;
  }

  enablestatus: boolean = true;
  enablestatus_onClick(): void { this.enablestatus = !this.enablestatus; }

  logout(): void {
    const isGavsUser = this.authService.isGAVSUser();
    
    this.myUtility.showWarningConfirmation(
      'Are you sure you want to logout?',
      'Logout'
    ).subscribe((result: boolean) => {
      if (result === true) {
        this.service_Logout();
        if (isGavsUser) {
          window.location.href = 'https://login.microsoftonline.com/common/oauth2/v2.0/logout';
        } else {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  service_GetDashboardDetails(): void {
    if (this.customerList.length === 0) return;
    if (this.dashboardDetailsLoading) {
      return;
    }
    
    this.dashboardDetailsLoading = true;
    const customerIds = this.customerList.map(c => c.cusT_ID);
    this.appsService.getDashboardDetailsByCustomerIds(customerIds).subscribe({
      next: (response: DashboardDetailsModel[]) => {
        // Match legacy: dashboardDetails = all data, dashboardDetailsCustomerLevel = customer-level only
        this.dashboardDetails = response;
        this.dashboardDetailsCustomerLevel = response.filter(d => !d.proJ_ID);
        
        // Clear cache when new data arrives
        this.cachedRiskTotal = null;
        this.cachedIdeasTotal = null;
        
        // Cache dashboard stats for instant display on next load
        this.saveDashboardStatsCache();
        
        this.CheckProjectAllocationExpiry();
        this.dashboardDetailsLoading = false;
        this.progress = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: any) => { 
        console.error(error);
        this.dashboardDetailsLoading = false; 
        this.progress = false; 
        this.changeDetectorRef.markForCheck();
      }
    });
  }



  CheckProjectAllocationExpiry(): void {
    this.appsService.checkProjectAllocationExpiry().subscribe({
      next: (expiringProjects: string) => {
        if (expiringProjects?.trim()) {
          const dialogData: DialogInfoData = {
            title: 'Project Allocation Expiry Notice',
            message: `The following projects (${expiringProjects}) or allocation to these projects are about to end within the next ten days.\n\nIn case the project/allocation end date is not extended in the PSA system, all those project team members will not be able to access (including view) the projects in the CSM Platform.\n\nPlease review and extend the allocation end date appropriately in the PSA system. In case these projects are about to end then ignore this message.`,
            icon: 'warning',
            iconColor: '#f59e0b',
            buttonText: 'OK'
          };
          
          this.dialog.open(DialogInfoComponent, {
            data: dialogData,
            width: '600px',
            maxWidth: '90vw',
            disableClose: false,
            panelClass: 'modern-dialog-panel'
          });
        }
      },
      error: (error: any) => console.error(error)
    });
  }

  service_LoadCustomerByEmpId(): void {
    this.progress = true;
    this.changeDetectorRef.markForCheck();
    
    this.appsService.getCustomerList(this.empid, true).subscribe({
      next: (response: CustomerModel[]) => {
        this.customerList = response;
        this.filteredCustomerList = [...response]; // Initialize filtered list for Account Repository
        this.buFilteredCustomerList = [...response]; // Initialize BU-filtered list for metrics
        
        // FIX: Always load fresh BU mapping from API on every page load.
        // The cache is intentionally cleared in ngOnInit (invalidateBUMappingCache) so
        // backend changes to Business Unit names are reflected immediately on reload
        // without requiring the user to manually clear their browser cache.
        this.loadProjectBUMapping();
        
        localStorage.setItem('CustomerIds', JSON.stringify(response));
        localStorage.setItem('slaAvailableList', JSON.stringify(
          response.map(x => ({ customerId: x.cusT_ID, customerName: x.cusT_NM, slaAvailable: x.iS_SLA_AVAILABLE }))
        ));
        
        // Show cards immediately - don't wait for dashboard details
        this.progress = false;
        this.changeDetectorRef.markForCheck();
        
        if (response.length === 0) {
          const dialogData: DialogInfoData = {
            title: 'No Customer Accounts Available',
            message: `Customer Accounts are visible here based on your allocation in respective projects in PSA.\n\nLooks like there are no active allocations or all the projects you are allocated to have ended.\n\nPlease take it up with your manager and get allocated in required projects for you to manage them in the CSM Platform.\n\nPlease send an email to WFM@${this.domainConfig.domain} for allocation or extending the allocation.`,
            icon: 'info',
            iconColor: '#3b82f6',
            buttonText: 'OK'
          };
          
          this.dialog.open(DialogInfoComponent, {
            data: dialogData,
            width: '600px',
            maxWidth: '90vw',
            disableClose: false,
            panelClass: 'modern-dialog-panel'
          });
        } else if (response.length === 1) {
          // Check if user explicitly navigated here (e.g., clicked back button)
          // If so, don't auto-redirect - let them see the enterprise dashboard
          const skipAutoRedirect = sessionStorage.getItem('skipAutoRedirect') === 'true';
          
          if (skipAutoRedirect) {
            // User clicked back button - show enterprise dashboard normally
            sessionStorage.removeItem('skipAutoRedirect'); // Clear flag for next time
            this.service_GetDashboardDetails();
          } else {
            // Auto-redirect: Single account detected - skip enterprise dashboard UI
            const singleAccount = response[0];
            
            // Use replaceUrl to avoid adding enterprise dashboard to history
            // This ensures back button returns to previous page, not enterprise dashboard
            if (singleAccount.iS_SLA_AVAILABLE) {
              this.router.navigate(['/serviceleveldashboard/cust', singleAccount.cusT_ID, false], { replaceUrl: true });
            } else {
              this.router.navigate(['/newdashboard/cust', singleAccount.cusT_ID, false], { replaceUrl: true });
            }
          }
        } else {
          // Multiple accounts: Load dashboard details in background - cards will update as data arrives
          this.service_GetDashboardDetails();
        }
      },
      error: (error: any) => { 
        console.error(error); 
        this.myUtility.showWarningPopup('Error loading customer data', 'Loading Error'); 
        this.progress = false; 
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  service_refreshDashboardDetails(): void {
    this.progress = true;
    this.changeDetectorRef.markForCheck();
    
    this.appsService.refreshDashboardDetails().subscribe({
      next: () => { 
        this.service_GetDashboardDetails(); 
        this.timeLeft = 600; 
      },
      error: (error: any) => { 
        console.error(error); 
        this.progress = false; 
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  service_Logout(): void {
    this.appsService.logout().subscribe({
      next: () => {
        ['empid','displayname','token','CustomerIds','slaAvailableList','dashboardStats','dashboardBUMapping'].forEach(k => localStorage.removeItem(k));
      },
      error: () => localStorage.clear()
    });
  }

  ResetFilter(customer_id: string, isSlaAvailable: boolean): void {
    localStorage.setItem('csG_FILTER_MONTH', this.myUtility.Month());
    localStorage.setItem('csG_FILTER_YEAR', this.myUtility.Year().toString());
    // Route to SLA dashboard if SLA is available, otherwise to regular dashboard
    if (isSlaAvailable) {
      this.router.navigate(['/serviceleveldashboard/cust', customer_id, false]);
    } else {
      this.router.navigate(['/newdashboard/cust', customer_id, false]);
    }
  }

  // Update BU dropdown options to only show BUs from active customers
  updateBUOptionsForActiveCustomers(): void {
    if (!this.buMappingLoaded || this.customerBUMapping.size === 0) {
      return;
    }

    const activeBUs = new Set<string>();
    
    // Get BUs only from customers that are currently in the list
    this.customerList.forEach(customer => {
      const customerBUs = this.customerBUMapping.get(customer.cusT_ID) || [];
      customerBUs.forEach(bu => activeBUs.add(bu));
    });

    // Update buOptions with only active customer BUs
    this.buOptions = ['All', ...Array.from(activeBUs).sort()];
    
    // If current selection is no longer valid, reset to 'All'
    if (this.selectedBU !== 'All' && !this.buOptions.includes(this.selectedBU)) {
      this.selectedBU = 'All';
      this.filterAccounts();
    }
    
    this.changeDetectorRef.markForCheck();
  }

  // Filter accounts using project businesS_UNIT field - Works with partial data!
  filterAccounts(): void {
    const filterStartTime = performance.now();
    let filtered = [...this.customerList];

    // Apply BU filter using project mapping (works even while loading!)
    if (this.selectedBU !== 'All') {
      filtered = filtered.filter(customer => {
        const customerBUs = this.customerBUMapping.get(customer.cusT_ID) || [];
        return customerBUs.includes(this.selectedBU);
      });
      
      const filterTime = ((performance.now() - filterStartTime)).toFixed(1);
      const status = this.buMappingLoaded ? 'COMPLETE' : 'LOADING';
    }

    // Save BU-filtered list for metrics cards (Active Accounts, Total Risks)
    this.buFilteredCustomerList = [...filtered];

    // Then apply intelligent search filter for Account Repository display
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(customer =>
        this.intelligentSearch(customer.cusT_NM || '', searchLower)
      );
    }

    // Save final filtered list for Account Repository display only
    this.filteredCustomerList = filtered;
    
    // Apply sorting
    this.sortAccounts();
    
    // Reset cached totals
    this.cachedRiskTotal = null;
    this.cachedIdeasTotal = null;
    
    this.changeDetectorRef.markForCheck();
  }

  // Sort accounts based on selected sort option
  sortAccounts(): void {
    if (!this.filteredCustomerList || this.filteredCustomerList.length === 0) {
      return;
    }

    const [field, direction] = this.sortField.split('-');

    switch (field) {
      case 'name':
        this.filteredCustomerList.sort((a, b) => {
          const nameA = (a.cusT_NM || '').toLowerCase();
          const nameB = (b.cusT_NM || '').toLowerCase();
          const comparison = nameA.localeCompare(nameB);
          return direction === 'asc' ? comparison : -comparison;
        });
        break;

      case 'risks':
        this.filteredCustomerList.sort((a, b) => {
          const risksA = parseInt(this.getTitleByCustomerId('RISK_TOTAL', a.cusT_ID) || '0', 10);
          const risksB = parseInt(this.getTitleByCustomerId('RISK_TOTAL', b.cusT_ID) || '0', 10);
          const comparison = risksA - risksB;
          return direction === 'asc' ? comparison : -comparison;
        });
        break;

      case 'issues':
        this.filteredCustomerList.sort((a, b) => {
          const issuesA = parseInt(this.getTitleByCustomerId('ISSUE_TOTAL', a.cusT_ID) || '0', 10);
          const issuesB = parseInt(this.getTitleByCustomerId('ISSUE_TOTAL', b.cusT_ID) || '0', 10);
          const comparison = issuesA - issuesB;
          return direction === 'asc' ? comparison : -comparison;
        });
        break;

      case 'actions':
        this.filteredCustomerList.sort((a, b) => {
          const actionsA = parseInt(this.getTitleByCustomerId('OPEN_ACTION_ITEMS', a.cusT_ID) || '0', 10);
          const actionsB = parseInt(this.getTitleByCustomerId('OPEN_ACTION_ITEMS', b.cusT_ID) || '0', 10);
          const comparison = actionsA - actionsB;
          return direction === 'asc' ? comparison : -comparison;
        });
        break;

      case 'projects':
        this.filteredCustomerList.sort((a, b) => {
          const projectsA = this.getProjectCount(a.cusT_ID);
          const projectsB = this.getProjectCount(b.cusT_ID);
          const comparison = projectsA - projectsB;
          return direction === 'asc' ? comparison : -comparison;
        });
        break;

      default:
        // Default to name ascending
        this.filteredCustomerList.sort((a, b) => {
          const nameA = (a.cusT_NM || '').toLowerCase();
          const nameB = (b.cusT_NM || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
    }
  }

  // Handle sort selection change
  onSortChange(sortValue: string): void {
    this.sortField = sortValue;
    this.sortMenuOpen = false;
    this.filterAccounts(); // This will re-apply filters and sorting
  }

  // Toggle sort menu
  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
  }

  // Close sort menu when clicking outside
  closeSortMenu(): void {
    this.sortMenuOpen = false;
  }

  // Get currently selected sort label
  getCurrentSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.sortField);
    return option ? option.label : 'Name: A → Z';
  }

  // Get currently selected sort icon
  getCurrentSortIcon(): string {
    const option = this.sortOptions.find(opt => opt.value === this.sortField);
    return option ? option.icon : 'sort_by_alpha';
  }

  // Intelligent search - supports partial words, initials, fuzzy matching
  intelligentSearch(text: string, searchTerm: string): boolean {
    if (!text || !searchTerm) return false;
    
    const textLower = text.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    // Direct substring match
    if (textLower.includes(search)) return true;
    
    // Word boundary match (matches start of any word)
    const words = textLower.split(/\s+/);
    if (words.some(word => word.startsWith(search))) return true;
    
    // Acronym/initials match (e.g., "abc" matches "Aditya Birla Capital")
    const initials = words.map(w => w[0]).join('');
    if (initials.includes(search)) return true;
    
    // Fuzzy match - allows for missing characters
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < search.length; i++) {
      if (textLower[i] === search[searchIndex]) {
        searchIndex++;
      }
    }
    if (searchIndex === search.length) return true;
    
    return false;
  }

  // Highlight search term in text with HTML markup
  highlightSearchTerm(text: string): string {
    if (!text || !this.searchTerm || this.searchTerm.trim() === '') {
      return text;
    }
    
    const search = this.searchTerm.trim();
    const regex = new RegExp(`(${this.escapeRegex(search)})`, 'gi');
    
    // Replace all matches with highlighted version
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // Escape special regex characters
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Load Business Units from API - SIMPLIFIED!
  // Uses the getBusinessUnits() API instead of 273 getAllProjectsForCustomer calls
  loadBusinessUnits(): void {
    this.loadBusinessUnitsFromAPI();
  }

  // FIX: Invalidate BU mapping cache to force fresh data from API on every page load.
  // This ensures that Business Unit name changes made in the backend are reflected
  // immediately when the user reloads the page, without requiring a manual cache clear.
  private invalidateBUMappingCache(): void {
    localStorage.removeItem('dashboardBUMapping');
    this.customerBUMapping = new Map();
    this.buMappingLoaded = false;
  }

  // Restore BU mapping from localStorage - INSTANT on repeat visits!
  // NOTE: This method is intentionally NOT called in ngOnInit anymore.
  // The cache is always invalidated on load to prevent stale BU names from showing.
  // Kept here for reference / potential future use with versioned caching.
  restoreBUMappingCache(): void {
    try {
      const cachedData = localStorage.getItem('dashboardBUMapping');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        this.customerBUMapping = new Map(Object.entries(parsed));
        this.buMappingLoaded = true;
        
        // Update BU options for active customers only
        this.updateBUOptionsForActiveCustomers();
        
      }
    } catch (err) {
      console.warn('Failed to restore BU cache:', err);
    }
  }

  // Save BU mapping to localStorage for instant future loads
  saveBUMappingCache(): void {
    try {
      const obj = Object.fromEntries(this.customerBUMapping);
      localStorage.setItem('dashboardBUMapping', JSON.stringify(obj));
    } catch (err) {
      console.warn('Failed to save BU cache:', err);
    }
  }

  // Restore dashboard stats from localStorage for INSTANT display
  restoreDashboardStatsCache(): void {
    try {
      const cachedStats = localStorage.getItem('dashboardStats');
      if (cachedStats) {
        const parsed = JSON.parse(cachedStats);
        this.dashboardDetails = parsed.dashboardDetails || [];
        this.dashboardDetailsCustomerLevel = parsed.dashboardDetailsCustomerLevel || [];
        this.changeDetectorRef.markForCheck();
      }
    } catch (err) {
      console.warn('Failed to restore dashboard stats cache:', err);
    }
  }

  // Save dashboard stats to localStorage for instant future loads
  saveDashboardStatsCache(): void {
    try {
      const statsCache = {
        dashboardDetails: this.dashboardDetails,
        dashboardDetailsCustomerLevel: this.dashboardDetailsCustomerLevel,
        timestamp: Date.now()
      };
      localStorage.setItem('dashboardStats', JSON.stringify(statsCache));
    } catch (err) {
      console.warn('Failed to save dashboard stats cache:', err);
    }
  }

  // Get cached customer IDs from localStorage for parallel loading
  getCachedCustomerIds(): string[] {
    try {
      const cachedData = localStorage.getItem('CustomerIds');
      if (cachedData) {
        const customers: CustomerModel[] = JSON.parse(cachedData);
        return customers.map(c => c.cusT_ID).filter(id => id);
      }
    } catch (err) {
      console.warn('Failed to get cached customer IDs:', err);
    }
    return [];
  }

  // Load dashboard details using provided customer IDs (for parallel loading)
  loadDashboardDetailsFromCustomerIds(customerIds: string[]): void {
    if (customerIds.length === 0) return;
    if (this.dashboardDetailsLoading) {
      return;
    }
    
    this.dashboardDetailsLoading = true;
    
    this.appsService.getDashboardDetailsByCustomerIds(customerIds).subscribe({
      next: (response: DashboardDetailsModel[]) => {
        this.dashboardDetails = response;
        this.dashboardDetailsCustomerLevel = response.filter(d => !d.proJ_ID);
        
        // Clear cache when new data arrives
        this.cachedRiskTotal = null;
        this.cachedIdeasTotal = null;
        
        // Save to cache
        this.saveDashboardStatsCache();
        
        this.dashboardDetailsLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: any) => {
        this.dashboardDetailsLoading = false;
        console.warn('Parallel dashboard load failed (will retry with fresh customer list):', error);
      }
    });
  }

  // Load project BU mapping from getBusinessUnits() - SINGLE API CALL!
  loadProjectBUMapping(): void {
    const startTime = performance.now();
    
    // Get all projects with BU and customer ID in one call!
    this.appsService.getBusinessUnits().subscribe({
      next: (response: any) => {
        
        const buSet = new Set<string>();
        
        // Handle both array and object responses (API might return {data: [...]} or [...])
        let projects = Array.isArray(response) ? response : (response?.data || response?.projects || []);
        
        
        if (projects.length > 0) {
          projects.forEach((project: any) => {
            const customerId = project.cusT_ID || project.CUST_ID || project.custId || project.customerId;
            const buName = project.BUSINESS_UNIT || project.businesS_UNIT || project.bU_NM || project.businessUnit;
            
            // Only add valid BU names
            if (customerId && 
                buName && 
                typeof buName === 'string' &&
                buName.trim() !== '' && 
                buName !== 'null' && 
                buName !== 'undefined' &&
                buName !== '[object Object]') {
              const buTrimmed = buName.trim();
              buSet.add(buTrimmed);
              
              // Build customer-BU mapping
              const existingBUs = this.customerBUMapping.get(customerId) || [];
              if (!existingBUs.includes(buTrimmed)) {
                existingBUs.push(buTrimmed);
                this.customerBUMapping.set(customerId, existingBUs);
              }
            }
          });
          
          this.buMappingLoaded = true;
          
          // Update BU dropdown options for active customers only
          this.updateBUOptionsForActiveCustomers();
          
          // Save fresh data to cache for use during this session only
          // (cache is cleared on next page load via invalidateBUMappingCache in ngOnInit)
          this.saveBUMappingCache();
          
          // Re-apply filter if BU selected
          if (this.selectedBU !== 'All') {
            this.filterAccounts();
          }
          
          this.changeDetectorRef.markForCheck();
        } else {
          console.warn('⚠️ getBusinessUnits() returned empty or no project details - falling back...');
          this.loadProjectBUMappingFallback();
        }
      },
      error: (err) => {
        console.error('Error loading business units:', err);
        // Fallback to old method if this doesn't work
        this.loadProjectBUMappingFallback();
      }
    });
  }
  
  // Fallback method if getBusinessUnits doesn't return project details
  loadProjectBUMappingFallback(): void {
    const startTime = performance.now();
    
    // Small batches processed sequentially - update UI after each batch!
    const batchSize = 20; // Small batches for faster first results
    const batches: CustomerModel[][] = [];
    
    for (let i = 0; i < this.customerList.length; i += batchSize) {
      batches.push(this.customerList.slice(i, i + batchSize));
    }
    
    
    const buSet = new Set<string>();
    let processedCount = 0;
    
    // Process batches one at a time, updating UI progressively
    const processBatch = (batchIndex: number) => {
      if (batchIndex >= batches.length) {
        // All done!
        this.buMappingLoaded = true;
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        this.saveBUMappingCache();
        
        // Update BU options for active customers only
        this.updateBUOptionsForActiveCustomers();
        
        this.changeDetectorRef.markForCheck();
        return;
      }
      
      const batch = batches[batchIndex];
      const batchRequests = batch.map(customer => 
        this.appsService.getAllProjectsForCustomer(customer.cusT_ID).pipe(
          map(projects => ({ customer, projects })),
          catchError(() => of({ customer, projects: [] }))
        )
      );
      
      forkJoin(batchRequests).subscribe({
        next: (results) => {
          results.forEach(({ customer, projects }) => {
            const customerBUs: string[] = [];
            
            projects.forEach((project: any) => {
              const buName = project.businesS_UNIT;
              // Filter out invalid BU values
              if (buName && 
                  typeof buName === 'string' &&
                  buName.trim() !== '' && 
                  buName !== 'null' && 
                  buName !== 'undefined' &&
                  buName !== '[object Object]') {
                const buTrimmed = buName.trim();
                buSet.add(buTrimmed);
                if (!customerBUs.includes(buTrimmed)) {
                  customerBUs.push(buTrimmed);
                  this.customerBUMapping.set(customer.cusT_ID, customerBUs);
                }
              }
            });
          });
          
          processedCount += batch.length;
          
          // Update UI with partial results every batch!
          if (this.selectedBU !== 'All') {
            this.filterAccounts();
          }
          
          
          // Process next batch
          processBatch(batchIndex + 1);
        },
        error: () => {
          // Skip failed batch and continue
          processedCount += batch.length;
          processBatch(batchIndex + 1);
        }
      });
    };
    
    // Start with first batch
    processBatch(0);
  }

  // Alternative: Load from BusinessUnits API (no customer mapping)
  loadBusinessUnitsFromAPI(): void {
    
    this.appsService.getBusinessUnits().subscribe({
      next: (response: any) => {
        
        // Handle different response formats
        let businessUnits: string[] = [];
        
        if (Array.isArray(response)) {
          // If response is an array of objects
          businessUnits = response.map((bu: any) => {
            // Handle different possible property names
            const buName = bu.businesS_UNIT || bu.bU_NM || bu.BUSINESS_UNIT || bu.business_unit || bu.name || bu.toString();
            return buName;
          })
          .filter(name => {
            // Filter out invalid values
            return name && 
                   typeof name === 'string' && 
                   name.trim() !== '' && 
                   name !== 'null' && 
                   name !== 'undefined' &&
                   name !== '[object Object]';
          })
          .map(name => name.trim());
        } else if (response && typeof response === 'object') {
          // If response is an object with data property
          const data = response.data || response.result || response;
          if (Array.isArray(data)) {
            businessUnits = data.map((bu: any) => {
              if (typeof bu === 'string') {
                return bu;
              }
              const buName = bu.businesS_UNIT || bu.bU_NM || bu.BUSINESS_UNIT || bu.business_unit || bu.name;
              return buName;
            })
            .filter(name => {
              // Filter out invalid values
              return name && 
                     typeof name === 'string' && 
                     name.trim() !== '' && 
                     name !== 'null' && 
                     name !== 'undefined' &&
                     name !== '[object Object]';
            })
            .map(name => name.trim());
          }
        }
        
        // Remove duplicates, filter empty again, and sort
        businessUnits = Array.from(new Set(businessUnits))
          .filter(bu => bu && bu.length > 0)
          .sort();
        
        
        if (businessUnits.length > 0) {
          // Add "All" option at the beginning
          this.buOptions = ['All', ...businessUnits];
          
          // Only reset to 'All' if not already set or if current selection is invalid
          if (!this.selectedBU || !this.buOptions.includes(this.selectedBU)) {
            this.selectedBU = 'All';
          }
          
          this.buMappingLoaded = true;
          
          this.changeDetectorRef.markForCheck();
        } else {
          // Fallback to extracting from customer data (fast, no API calls)
          console.warn('No valid BUs from API, extracting from customer data...');
          this.extractBUFromCustomers();
        }
      },
      error: (err) => {
        console.error('Error loading Business Units from API:', err);
        // Fallback to extracting from customer industry types (fast, no API calls)
        this.extractBUFromCustomers();
      }
    });
  }

  // Fallback: Extract BU/Industry values from customer data
  extractBUFromCustomers(): void {
    const uniqueIndustries = new Set<string>();
    
    this.customerList.forEach(customer => {
      if (customer.industrY_TYPE && customer.industrY_TYPE.trim() !== '') {
        uniqueIndustries.add(customer.industrY_TYPE.trim());
      }
    });

    // Convert to array and sort alphabetically
    const industryArray = Array.from(uniqueIndustries).sort();
    
    // Add "All" option at the beginning
    this.buOptions = ['All', ...industryArray];
    
    // Only reset to 'All' if not already set or if current selection is invalid
    if (!this.selectedBU || !this.buOptions.includes(this.selectedBU)) {
      this.selectedBU = 'All';
    }
    
    this.buMappingLoaded = true;
    
    this.changeDetectorRef.markForCheck();
  }

  // Load BU mapping in background (non-blocking, silent)
  // REMOVED: No more complex BU mapping, caching, or background loading!
  // Filtering now uses customer.industrY_TYPE directly - instant and simple!

  // Handle BU dropdown change
  // Filters customers based on their projects' Business Units
  onBUChange(): void {
    
    // Force change detection to update UI
    this.changeDetectorRef.markForCheck();
    
    // Only filter if BU actually changed (prevent redundant filtering on same selection)
    if (this.selectedBU !== this.previousBU) {
      this.previousBU = this.selectedBU;
      this.filterAccounts();
    }
  }

  // TrackBy function for BU options
  trackByBU = (index: number, bu: string): string => {
    return bu;
  };

  // Handle dropdown open/close
  onDropdownOpenedChange(opened: boolean): void {
    if (opened) {
      
      // Force Angular to re-check the selected state
      setTimeout(() => {
        this.changeDetectorRef.detectChanges();
      }, 0);
    }
  }

  // TrackBy function for ngFor performance optimization
  trackByCustomerId(index: number, customer: CustomerModel): string {
    return customer.cusT_ID;
  }
}
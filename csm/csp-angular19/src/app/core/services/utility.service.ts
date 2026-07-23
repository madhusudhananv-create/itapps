/**
 * Utility Service - Migrated from legacy myUtility.ts
 * Modernized for Angular 19 with Signals and modern RxJS
 * Preserves all business logic and functionality
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

// Import AppsService for API calls
import { AppsService } from './apps.service';

export interface AppSettings {
  empid: string;
  displayname: string;
  token: string;
  role: string;
  access: string;
  logintype: string;
  customerid: string;
}

export interface ColorShaders {
  WeekEndShade: string;
  LeaveShade: string;
  HolidayShade: string;
  BlockedShade: string;
  ApprovedShade: string;
  RejectedShade: string;
  ReviewShade: string;
  ApprovalShade: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  // Modernized with Signals for reactive state management
  public appSettings = signal<AppSettings>({
    empid: localStorage.getItem('empid') || '',
    displayname: localStorage.getItem('displayname') || '',
    token: localStorage.getItem('token') || '',
    role: localStorage.getItem('role') || '',
    access: localStorage.getItem('access') || '',
    logintype: localStorage.getItem('logintype') || '',
    customerid: localStorage.getItem('customerid') || ''
  });

  // Color configuration for UI states
  public readonly colorShaders: ColorShaders = {
    WeekEndShade: "#f3f37e",
    LeaveShade: "#c5fbc5",
    HolidayShade: "#a3ffff",
    BlockedShade: "#dddddd",
    ApprovedShade: "#dcf7e9",
    RejectedShade: "#f7dfe0",
    ReviewShade: "#f8deaf",
    ApprovalShade: "#fcceab"
  };

  // Feature flags and configuration
  public holidayIds: string = "3,5";
  public baseMeasureEnabledCustomers = '';
  public kpiProcessEnabledCustomers = '';
  public companyName = environment.company_name;

  // Reactive subjects for component communication
  public riskSubject = new Subject<any>();

  // UI state flags
  public btnCalledFromNewCSMDashboard = false;
  public linkCalledfromSQA = false;
  public linkCallfromAllCustlistView = false;
  public linkCalledWithIdeaId = false;

  // Lazy-loaded AppsService to avoid circular dependency
  private _appsService?: AppsService;
  private snackBar = inject(MatSnackBar);

  constructor(private router: Router) {
    // Initialize app settings from localStorage
    this.loadAppSettings();
  }

  /**
   * Get AppsService instance (lazy-loaded to avoid circular dependency)
   */
  private getAppsService(): AppsService {
    if (!this._appsService) {
      this._appsService = inject(AppsService);
    }
    return this._appsService;
  }

  /**
   * Load application settings from localStorage
   */
  private loadAppSettings(): void {
    this.appSettings.update(settings => ({
      empid: localStorage.getItem('empid') || '',
      displayname: localStorage.getItem('displayname') || '',
      token: localStorage.getItem('token') || '',
      role: localStorage.getItem('role') || '',
      access: localStorage.getItem('access') || '',
      logintype: localStorage.getItem('logintype') || '',
      customerid: localStorage.getItem('customerid') || ''
    }));
  }

  /**
   * Set employee ID
   */
  public setEmpId(empId: string): void {
    // DEBUG: Log when empId is being cleared
    if (!empId || empId === '') {
      console.error('🚨 setEmpId() called with EMPTY empId!', {
        empId: empId,
        stackTrace: new Error().stack,
        currentEmpId: localStorage.getItem('empid')
      });
    }
    
    localStorage.setItem('empid', empId);
    this.appSettings.update(settings => ({ ...settings, empid: empId }));
  }

  /**
   * Set display name
   */
  public setDisplayName(displayName: string): void {
    localStorage.setItem('displayname', displayName);
    this.appSettings.update(settings => ({ ...settings, displayname: displayName }));
  }

  /**
   * Set authentication token
   */
  public setToken(token: string): void {
    // DEBUG: Log when token is being cleared
    if (!token || token === '') {
      console.error('🚨 setToken() called with EMPTY token!', {
        token: token,
        stackTrace: new Error().stack,
        currentToken: localStorage.getItem('token')
      });
    } else if (!environment.production) {
      // SECURITY: Only log token details in development
      console.debug('setToken() called', {
        tokenLength: token.length,
        stackTrace: new Error().stack
      });
    }
    
    localStorage.setItem('token', token);
    this.appSettings.update(settings => ({ ...settings, token: token }));
  }

  /**
   * Set user role
   */
  public setRole(role: string): void {
    localStorage.setItem('role', role);
    this.appSettings.update(settings => ({ ...settings, role: role }));
  }

  /**
   * Set login type
   */
  public setLoginType(loginType: string): void {
    localStorage.setItem('logintype', loginType);
    this.appSettings.update(settings => ({ ...settings, logintype: loginType }));
  }

  /**
   * Validate if user is logged in
   */
  public validateLogin(): boolean {
    const settings = this.appSettings();
    if (!settings.empid || !settings.token) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  /**
   * Check if current user can edit
   */
  public isEditable(): boolean {
    const canEdit = localStorage.getItem('canedit');
    return canEdit === 'true';
  }

  /**
   * Navigate to previous page with context
   */
  public previousPage(custId: string): void {
    if (this.linkCallfromAllCustlistView) {
      localStorage.setItem('selectedCustomer', custId);
      this.router.navigate(['/newdashboard/allcust/listview']);
    } else if (this.linkCalledWithIdeaId) {
      const ideaId = localStorage.getItem('ideaId');
      this.router.navigate(['/newdashboard/cust', custId, true, 'listview', ideaId]);
    } else {
      this.router.navigate(['/newdashboard/cust', custId, true, 'listview']);
    }
  }

  /**
   * Logout user and clear session
   */
  public logout(): void {
    this.setEmpId('');
    this.setToken('');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /**
   * Get current employee ID
   */
  public getEmpId(): string {
    return this.appSettings().empid;
  }

  /**
   * Get current display name
   */
  public getDisplayName(): string {
    return this.appSettings().displayname;
  }

  /**
   * Get current token
   */
  public getToken(): string {
    return this.appSettings().token;
  }

  /**
   * Check if customer is Premier (has portfolio/product management)
   * Migrated from legacy myUtility.ts -> IsPremier()
   * @param custid Customer ID
   * @returns true if customer is Premier
   */
  public IsPremier(custid: string): boolean {
    return custid === "202100062" || custid === "212100001";
  }

  /**
   * Handle service errors with user-friendly messages
   * Migrated from legacy myUtility.ts -> serviceError()
   * @param error HTTP error object
   */
  public serviceError(error: any): void {
    console.error('Service Error:', error);
    
    if (error.status === 0) {
      this.showError(`CSM server connection is interrupted. Please check your network connection. For urgent queries contact csmplatformsupport@${environment.domain_name}`);
    } else if (error.status === 500) {
      this.showError(`CSM server: Error(500) while handling data, please contact ${this.companyName} team (csmplatformsupport@${environment.domain_name}).`);
    } else if (error.status === 404) {
      this.showError(`CSM server: Error(404) while handling data, please contact ${this.companyName} (csmplatformsupport@${environment.domain_name}).`);
    } else if (error.status === 401) {
      // Check if we actually have a token in localStorage
      const currentToken = localStorage.getItem('token');
      
      if (!currentToken || currentToken === '') {
        // No token exists - already logged out, just navigate to login
        console.warn('401 error but no token found - redirecting to login');
        this.router.navigate(['/login']);
      } else {
        // Token exists but server rejected it - this is a real auth failure
        console.error('401 error with valid token - session expired');
        this.showError('Session expired. Please login again.');
        this.logout();
      }
    } else if (error.message) {
      console.error('Error message:', error.message);
    }
  }

  /**
   * Display error message using snackbar
   */
  public showError(message: string): void {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
    config.panelClass = ['error-snackbar'];
    this.snackBar.open(message, '✕', config);
  }

  /**
   * Display success message using snackbar
   */
  public showSuccess(message: string): void {
    const config = new MatSnackBarConfig();
    config.duration = 4000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
    config.panelClass = ['success-snackbar'];
    this.snackBar.open(message, '✓', config);
  }

  /**
   * Check if current user role should load all projects
   * Migrated from legacy myUtility.ts -> ShouldLoadAllProjects()
   * @returns true if user role can access all projects
   */
  public ShouldLoadAllProjects(): boolean {
    const role = this.appSettings().role;
    return role === 'PMO' ||
           role === 'Customer Success Manager' ||
           role === 'Functional Manager' ||
           role === 'BU Head IMS';
  }

  /**
   * Check if current user is GAVS employee
   * @returns true if user is GAVS employee
   */
  public IsGAVS(): boolean {
    const logintype = this.appSettings().logintype;
    return logintype === 'GAVS' || logintype === 'gavs';
  }

  // ========== Missing Methods for Risk/Issue Pages ==========
  
  /**
   * Probability scale for risk assessment
   * Migrated from legacy myUtility.ts
   */
  public prob: string[] = ['Rare', 'Remote', 'Moderate', 'Likely', 'Frequent'];

  /**
   * Impact scale for risk assessment
   * Migrated from legacy myUtility.ts
   */
  public impact: string[] = ['Insignificant', 'Minor', 'Significant', 'Major', 'Critical'];

  /**
   * Get today's date
   * Migrated from legacy myUtility.ts -> Today()
   * @returns Current date
   */
  public Today(): Date {
    return new Date();
  }

  /**
   * Apply filter criteria to data array
   * Migrated from legacy myUtility.ts -> ApplyCriteriaRange()
   * @param criteria Array of filter criteria objects
   * @param originalData Original data array to filter
   * @returns Filtered data array
   */
  public ApplyCriteriaRange(criteria: any[], originalData: any[]): any[] {
    if (criteria == undefined || criteria == null) return originalData;
    
    let fieldNames = criteria.map(x => x.fielD_NAME);
    let filteredData = originalData;
    let fieldNamesDistinct = fieldNames.filter((n, i) => fieldNames.indexOf(n) === i);

    fieldNamesDistinct.forEach(element => {
      let filteredCriteria = criteria.filter(t => t.fielD_NAME === element);
      filteredData = filteredData.filter(t => filteredCriteria.some(e => this.ApplyCriteriaOnData(e, t)));
    });

    return filteredData;
  }

  /**
   * Apply single criteria on data item
   * Migrated from legacy myUtility.ts -> ApplyCriteriaOnData()
   * @param criteria Single criteria object
   * @param data Data item to check
   * @returns true if criteria matches
   */
  private ApplyCriteriaOnData(criteria: any, data: any): boolean {
    try {
      return data[criteria.fielD_NAME].toLowerCase().search(criteria.searchStringValue.toLowerCase()) > -1;
    }
    catch (e: any) {
      if (e.stack && e.stack.search("TypeError") > -1) {
        return data[criteria.fielD_NAME] == criteria.searchString;
      }
      return false;
    }
  }

  /**
   * Convert date to locale (UTC) date
   * Migrated from legacy myUtility.ts -> setLocaleDate()
   * @param dateValue Date value to convert
   * @returns UTC date
   */
  public setLocaleDate(dateValue: any): Date {
    var dtDateValue = new Date(dateValue);
    let UTCDate = Date.UTC(dtDateValue.getFullYear(), dtDateValue.getMonth(), dtDateValue.getDate());
    return new Date(UTCDate);
  }

  /**
   * Export table to Excel file
   * Migrated from legacy myUtility.ts -> exportToExcel()
   * NOTE: Requires xlsx library installation: npm install xlsx
   * @param element HTML table element or data
   * @param filename Output filename (without extension)
   */
  public exportToExcel(element: any, filename: string): void {
    // TODO: Install xlsx library: npm install xlsx @types/xlsx
    // For now, using a basic implementation with browser download
    console.warn('Excel export: xlsx library not installed. Using basic CSV export.');
    
    try {
      // Basic CSV export as fallback
      let csv = '';
      
      if (element && element.rows) {
        // HTML table element
        for (let row of element.rows) {
          let rowData = [];
          for (let cell of row.cells) {
            rowData.push('"' + (cell.textContent || '').replace(/"/g, '""') + '"');
          }
          csv += rowData.join(',') + '\n';
        }
      } else {
        // Array data
        csv = 'Data export not yet implemented for non-table elements';
      }

      // Create download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export to Excel error:', error);
    }
  }

  /**
   * Get month number from month abbreviation
   * @param month - Month abbreviation (Jan, Feb, etc.)
   * @returns Month number (0-11)
   */
  public getMonthNum(month: string): number {
    if (month == "Jan") return 0;
    if (month == "Feb") return 1;
    if (month == "Mar") return 2;
    if (month == "Apr") return 3;
    if (month == "May") return 4;
    if (month == "Jun") return 5;
    if (month == "Jul") return 6;
    if (month == "Aug") return 7;
    if (month == "Sep") return 8;
    if (month == "Oct") return 9;
    if (month == "Nov") return 10;
    if (month == "Dec") return 11;
    return 0; // Default to January if not found
  }

  /**
   * Get current month abbreviation
   * @returns Month abbreviation (Jan, Feb, etc.)
   */
  public Month(): string {
    return this.getMonthAbr(new Date().getMonth());
  }

  /**
   * Get month abbreviation from month number
   * @param month - Month number (0-11)
   * @returns Month abbreviation
   */
  public getMonthAbr(month: number): string {
    month = month + 1;
    if (month == 1) return "Jan";
    if (month == 2) return "Feb";
    if (month == 3) return "Mar";
    if (month == 4) return "Apr";
    if (month == 5) return "May";
    if (month == 6) return "Jun";
    if (month == 7) return "Jul";
    if (month == 8) return "Aug";
    if (month == 9) return "Sep";
    if (month == 10) return "Oct";
    if (month == 11) return "Nov";
    if (month == 12 || month == 0) return "Dec";
    return "Jan"; // Default
  }

  /**
   * Get current year
   * @returns Current year
   */
  public Year(): number {
    return new Date().getFullYear();
  }

  /**
   * Get array of years (current year and previous n-1 years)
   * @param n - Number of years to return
   * @returns Array of years
   */
  public Years(n: number): number[] {
    const datearray: number[] = [];
    const d = new Date();
    const b = d.getFullYear();
    for (let i = 0; i < n; i++) {
      datearray[i] = b - i;
    }
    return datearray;
  }

  /**
   * Get Risk Chart Data
   * Retrieves risk chart data and publishes it to riskSubject
   * Migrated from legacy myUtility.ts -> GetRiskChart()
   * Used by risk-chart-control component
   * @param riskDashboardInputs Input parameters for risk chart
   */
  public GetRiskChart(riskDashboardInputs: any): void {
    if (riskDashboardInputs != null && riskDashboardInputs != undefined) {
      if (riskDashboardInputs.projecT_IDS == null) {
        riskDashboardInputs.projecT_IDS = "-1";
      }
      
      const appsService = this.getAppsService();
      appsService.getRiskChartData(riskDashboardInputs).subscribe({
        next: (data: any) => {
          this.riskSubject.next(data);
        },
        error: (error: any) => {
          this.serviceError(error);
        }
      });
    }
  }
}

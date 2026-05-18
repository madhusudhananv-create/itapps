/**
 * MyUtility - Core utility service for CSM Application
 * Migrated from Angular 6 to Angular 19
 * 
 * This is a streamlined version of the legacy myUtility service.
 * Contains essential utilities for authentication, navigation, date handling,
 * role checks, and RAG status management.
 * 
 * Migration Changes:
 * - Updated to Angular 19 inject() pattern
 * - Added type safety
 * - Modernized with providedIn: 'root'
 * - Removed chart dependencies (moved to separate service)
 * - Simplified error handling
 */

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { enumRoles } from './enum';
import type { AppAccessControlsModel } from '../models/access-control.model';
import { ChartsService } from '../services/charts.service';
import { AuthService } from '../core/services/auth.service';
import { WarningPopupComponent } from './components/warning-popup/warning-popup.component';

import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class MyUtility {
  private router = inject(Router);
  private matDialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private _chartsService = inject(ChartsService);
  private authService = inject(AuthService);

  // Public properties
  public tempData: any;
  public CustomerIds: string[] = [];
  public btnCalledFromNewCSMDashboard = false;
  public linkCalledfromSQA = false;
  public linkCallfromAllCustlistView = false;
  public linkCalledWithIdeaId = false;
  public BaseMeasureEnabledCustomers = '';
  public kpiProcessEnabledCustomers = '';
  public riskSubject: Subject<any> = new Subject<any>();
  public companyName = environment.company_name;
  public holidayIds = '3,5';
  public ShowSideNav = true;
  public tableYear: number = new Date().getFullYear();
  public tableMonth: string = this.getMonthAbr(new Date().getMonth());
  public chartsMonthly: any; // For GetCharts method

  // App Settings
  public AppSettings = {
    empid: '',
    displayname: '',
    token: '',
    role: '',
    access: '',
    logintype: '',
    customerid: ''
  };

  // Color Shaders for calendar/timesheet
  public ColorShaders = {
    WeekEndShade: '#f3f37e',
    LeaveShade: '#c5fbc5',
    HolidayShade: '#a3ffff',
    BlockedShade: '#dddddd',
    ApprovedShade: '#dcf7e9',
    RejectedShade: '#f7dfe0',
    ReviewShade: '#f8deaf',
    ApprovalShade: '#fcceab'
  };

  private _access: AppAccessControlsModel[] = [];
  private RepeatedError = false;

  constructor() {
    // Load settings from localStorage
    this.AppSettings.empid = localStorage.getItem('empid') || '';
    this.AppSettings.displayname = localStorage.getItem('displayname') || '';
    this.AppSettings.token = localStorage.getItem('token') || '';
    this.AppSettings.logintype = localStorage.getItem('logintype') || '';
    this.AppSettings.role = localStorage.getItem('role') || '';
  }

  // ========================================
  // AUTHENTICATION & STORAGE METHODS
  // ========================================

  public empid(empid: string): void {
    this.AppSettings.empid = empid;
    localStorage.setItem('empid', empid);
  }

  public displayname(displayName: string): void {
    this.AppSettings.displayname = displayName;
    localStorage.setItem('displayname', displayName);
  }

  public token(token: string): void {
    this.AppSettings.token = token;
    localStorage.setItem('token', token);
  }

  public logintype(logintype: string): void {
    this.AppSettings.logintype = logintype;
    localStorage.setItem('logintype', logintype);
  }

  public customerid(customerid: string): void {
    this.AppSettings.customerid = customerid;
    localStorage.setItem('customerid', customerid);
  }

  public role(role: string): void {
    this.AppSettings.role = role;
    localStorage.setItem('role', role);
  }

  public access(access: string): void {
    this.AppSettings.access = access;
    localStorage.setItem('access', access);
  }

  public ClearAuthenticationDetails(): void {
    this.empid('');
    this.displayname('');
    this.token('');
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  public validateLogin(): boolean {
    const empid = localStorage.getItem('empid');
    const token = localStorage.getItem('token');
    
    if (!empid || !token || empid === '' || token === '') {
      this.showLoginRequiredPopup();
      return false;
    }
    return true;
  }

  private showLoginRequiredPopup(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Please login to continue',
      title: 'Login Required',
      icon: 'login',
      confirmText: 'OK'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    
    const dialogRef = this.matDialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }

  private showSessionExpiredPopup(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: 'Session Expired, Please login again',
      title: 'Session Expired',
      icon: 'timer_off',
      confirmText: 'OK'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    
    this.matDialog.open(WarningPopupComponent, dialogConfig);
  }

  // ========================================
  // ROLE CHECK METHODS
  // ========================================

  public IsGAVS(): boolean {
    return (localStorage.getItem('logintype') || this.AppSettings.logintype) === 'gavs';
  }

  public IsCustomer(): boolean {
    return (localStorage.getItem('logintype') || this.AppSettings.logintype) === 'customer';
  }

  public IsCSM(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.CustomerSuccessManager.toString();
  }

  public IsCSMorPM(): boolean {
    return this.IsCSM() || this.IsPM();
  }

  public IsPM(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.ProjectManager.toString();
  }

  public IsPMO(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.PMO.toString();
  }

  public IsQuality(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.Quality.toString();
  }

  public IsHR(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.HR.toString();
  }

  public IsBUHead(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.BUHeadIMS.toString();
  }

  public IsTeamMember(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.TeamMember.toString();
  }

  public IsFunctionalManager(): boolean {
    return (localStorage.getItem('role') || this.AppSettings.role) === enumRoles.FunctionalManager.toString();
  }

  /**
   * Check if all projects should be loaded based on user role
   * Migrated from legacy myUtility.ts -> ShouldLoadAllProjects()
   */
  public ShouldLoadAllProjects(): boolean {
    const role = localStorage.getItem('role') || this.AppSettings.role;
    return role === enumRoles.PMO.toString() ||
      role === enumRoles.CustomerSuccessManager.toString() ||
      role === enumRoles.FunctionalManager.toString() ||
      role === enumRoles.BUHeadIMS.toString();
  }

  /**
   * Check if customer is Premier customer
   * Migrated from legacy myUtility.ts -> IsPremier()
   */
  public IsPremier(custId: string): boolean {
    // Hardcoded list of Premier customer IDs (matching legacy logic)
    if (custId == "202100062" || custId == "212100001")
      return true;
    else
      return false;
  }

  public IsLoggedIn(): boolean {
    return !!this.AppSettings.empid && this.AppSettings.empid !== '';
  }

  /**
   * Check if current user is specific admin user (102802)
   * Used for admin-only functionality and debugging features
   * Migrated from legacy myUtility.ts -> is102802()
   */
  public is102802(): boolean {
    return this.AppSettings.empid === '102802';
  }

  public IsEditable(): boolean {
    if (this.IsCustomer()) return false;
    
    const role = localStorage.getItem('role') || this.AppSettings.role;
    const editableRoles = [
      enumRoles.CustomerSuccessManager.toString(),
      enumRoles.ProjectManager.toString(),
      enumRoles.Quality.toString(),
      enumRoles.PMO.toString(),
      enumRoles.Finance.toString(),
      enumRoles.Marketing.toString(),
      enumRoles.GSLab.toString()
    ];

    return editableRoles.includes(role);
  }

  public IsApprover(): boolean {
    if (this.IsCustomer()) return true;
    
    const role = localStorage.getItem('role') || this.AppSettings.role;
    const approverRoles = [
      enumRoles.CustomerSuccessManager.toString(),
      enumRoles.PMO.toString(),
      enumRoles.ProjectManager.toString()
    ];

    return approverRoles.includes(role);
  }

  // ========================================
  // USER INFO METHODS
  // ========================================

  public GetUserName(): string {
    return this.AppSettings.empid || '';
  }

  public GetDisplayName(): string {
    return this.AppSettings.displayname || '';
  }

  // ========================================
  // NOTIFICATION METHODS
  // ========================================

  public showSuccess(message: string): void {
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
    config.panelClass = ['success-snackbar'];
    const snackBarRef = this.snackBar.open(message, '✓', config);
  }

  public showError(message: string): void {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
    config.panelClass = ['error-snackbar'];
    this.snackBar.open(message, '✕', config);
  }

  public showWarning(message: string): void {
    const config = new MatSnackBarConfig();
    config.duration = 4000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
    config.panelClass = ['warning-snackbar'];
    this.snackBar.open(message, '⚠', config);
  }

  public showInfo(message: string): void {
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
    config.panelClass = ['info-snackbar'];
    this.snackBar.open(message, 'ℹ', config);
  }

  public showDeleteConfirmation(message: string, title: string = 'Confirm Delete'): any {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
      title: title,
      icon: 'warning',
      isConfirmation: true,
      confirmText: 'OK',
      cancelText: 'Cancel',
      actionType: 'delete'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    
    const dialogRef = this.matDialog.open(WarningPopupComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  public showWarningPopup(message: string, title: string = 'Warning'): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
      title: title,
      icon: 'warning',
      isConfirmation: false,
      confirmText: 'OK'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    
    this.matDialog.open(WarningPopupComponent, dialogConfig);
  }

  public showSuccessPopup(message: string, title: string = 'Success'): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
      title: title,
      icon: 'check_circle',
      isConfirmation: false,
      confirmText: 'OK'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    
    this.matDialog.open(WarningPopupComponent, dialogConfig);
  }

  public showWarningConfirmation(message: string, title: string = 'Confirm Action'): any {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
      title: title,
      icon: 'warning',
      isConfirmation: true,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      actionType: 'default'
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    
    const dialogRef = this.matDialog.open(WarningPopupComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  public showInputDialog(message: string, title: string = 'Input Required', defaultValue: string = '', inputLabel: string = '', placeholder: string = ''): any {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
      title: title,
      icon: 'edit',
      isConfirmation: true,
      confirmText: 'OK',
      cancelText: 'Cancel',
      showInput: true,
      inputLabel: inputLabel,
      inputValue: defaultValue,
      inputPlaceholder: placeholder
    };
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = false;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    dialogConfig.panelClass = 'warning-popup-dialog';
    dialogConfig.backdropClass = 'warning-popup-backdrop';
    dialogConfig.width = '500px';

    const dialogRef = this.matDialog.open(WarningPopupComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  // ========================================
  // DATE & MONTH METHODS
  // ========================================

  public Month(): string {
    return this.getMonthAbr(new Date().getMonth());
  }

  public MonthCurrAbr(): string {
    return this.getMonthAbr(new Date().getMonth());
  }

  public prevMonthAbr(): string {
    return this.getMonthAbr(new Date().getMonth() - 1);
  }

  public MonthCurrNum(): number {
    return new Date().getMonth();
  }

  public Year(): number {
    return new Date().getFullYear();
  }

  public Today(): Date {
    return new Date();
  }

  public getMonthAbr(month: number): string {
    const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month + 1] || 'Dec';
  }

  public getMonthNum(month: string): number {
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3,
      'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7,
      'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[month] || 0;
  }

  public getMonthNames() {
    return [
      { value: 0, title: 'Jan' }, { value: 1, title: 'Feb' }, { value: 2, title: 'Mar' },
      { value: 3, title: 'Apr' }, { value: 4, title: 'May' }, { value: 5, title: 'Jun' },
      { value: 6, title: 'Jul' }, { value: 7, title: 'Aug' }, { value: 8, title: 'Sep' },
      { value: 9, title: 'Oct' }, { value: 10, title: 'Nov' }, { value: 11, title: 'Dec' }
    ];
  }

  public getDate(selectedDate: Date): string {
    const day = selectedDate.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[selectedDate.getMonth()];
    return `${day}-${month}-${selectedDate.getFullYear()}`;
  }

  public DaysInMonth(month: number | string, year: number): number {
    if (typeof month === 'number') {
      return new Date(year, month, 0).getDate();
    }
    
    const monthnumber = this.getMonthNum(month as string) + 1;
    return new Date(year, monthnumber, 0).getDate();
  }

  // ========================================
  // ACCESS CONTROL METHODS
  // ========================================

  public getAccessList(): AppAccessControlsModel[] {
    if ((!this._access || this._access.length === 0) && localStorage.getItem('access') !== '') {
      try {
        this._access = JSON.parse(localStorage.getItem('access') || '[]');
      } catch (error) {
        console.error('Error parsing access list:', error);
        this._access = [];
      }
    }
    return this._access;
  }

  // ========================================
  // RAG STATUS METHODS
  // ========================================

  public updateRAG(rags: any[], category: string, rag: string): void {
    const myrag = rags.find(t => t.category === category);
    
    if (myrag) {
      myrag.rag = rag;
    } else {
      rags.push({
        id: 0,
        projecT_ID: '',
        category: category,
        rag: rag,
        createD_BY: '',
        createD_DATE: new Date(),
        updateD_BY: '',
        updateD_DATE: new Date(),
        isactive: true
      });
    }
  }

  public getRAG(rags: any[], category: string): string {
    let result = 'black';
    
    if (rags) {
      const myrag = rags.find(t => t.category === category);
      if (myrag) {
        result = myrag.rag;
      }
    }
    
    return result;
  }

  // ========================================
  // ERROR HANDLING
  // ========================================

  public serviceError(error: any): void {
    console.error('Service Error:', error);

    if (error.status === 0) {
      this.showAlert(`CSM server connection is interrupted. Please check your network connection. For urgent queries contact csmplatformsupport@${environment.domain_name}`);
    } else if (error.status === 500) {
      this.showAlert(`CSM server: Error(500) while handling data. Please contact ${this.companyName} team (csmplatformsupport@${environment.domain_name}).`);
    } else if (error.status === 404) {
      this.showAlert(`CSM server: Error(404) while handling data. Please contact ${this.companyName} (csmplatformsupport@${environment.domain_name}).`);
    } else if (error.status === 501) {
      this.showAlert('Duplicate values in excel not copied');
    } else if (error.status === 400) {
      const errMsg = this.GetErrorMessage(error);
      if (errMsg.trim().toLowerCase() !== 'ok') {
        this.showAlert(errMsg);
      }
      if (errMsg.includes('Authorization Issue')) {
        this.RepeatedError = true;
        this.authService.logout();
      }
    } else if (error.status === 401) {
      
      // Only handle 401 as logout if user was actually logged in
      // If user never logged in, just log the error and don't redirect
      const wasLoggedIn = this.IsLoggedIn();
      
      // Check if this is likely an API endpoint issue vs actual auth failure
      const errorMessage = this.GetErrorMessage(error).toLowerCase();
      const isEndpointNotFound = error.url && (
        error.statusText === 'Not Found' ||
        errorMessage.includes('not found') ||
        errorMessage.includes('no message available')
      );
      
      // Don't logout for common non-auth 401 scenarios
      if (!wasLoggedIn) {
        console.warn('401 but user not logged in. Skipping logout.');
        return;
      }
      
      if (isEndpointNotFound) {
        console.warn('401 error from API endpoint that may not exist:', error.url);
        console.warn('Error message:', errorMessage);
        return; // Don't logout - just log the error
      }
      
      if (error.statusText === 'Invalid Token') {
        // Session expired - token is no longer valid on server
        
        if (!this.RepeatedError) {
          this.showSessionExpiredPopup();
        }
        this.RepeatedError = true;
        this.matDialog.closeAll();
        this.authService.logout();
        
      } else if (error.statusText === 'Unauthorized') {
        // Standard unauthorized - be cautious
        const errorText = this.GetErrorMessage(error);
        
        // Only logout if the error message clearly indicates auth failure
        if (errorText.includes('Invalid Token') || errorText.includes('Token Expired') || errorText.includes('Session Expired')) {
          this.authService.logout();
          if (errorText.trim().toLowerCase() !== 'ok') {
            this.showAlert(errorText);
          }
        } else {
          console.warn('401 Unauthorized but not a clear auth failure. Not logging out.');
          console.warn('Error text:', errorText);
        }
        
      } else {
        // Other 401 errors - be very careful about logout
        console.warn('Other 401 error - checking if it\'s a real auth failure');
        
        let err = error.statusText || '';
        if (error.error != undefined && error.error != null) {
          err = err + ' : ' + (typeof error.error === 'string' ? error.error : JSON.stringify(error.error));
        }
        
        // Only logout if error clearly and explicitly indicates auth failure
        const isAuthFailure = err.toLowerCase().includes('invalid token') || 
                             err.toLowerCase().includes('token expired') || 
                             err.toLowerCase().includes('session expired');
        
        if (isAuthFailure) {
          if (err.trim().toLowerCase() !== 'ok') {
            this.showAlert(err);
          }
          this.authService.logout();
        } else {
          console.warn('401 error but NOT a clear auth failure. Not logging out.');
          console.warn('This might be an API endpoint issue or missing data.');
        }
      }
    } else if (error.status === 409) {
      const errMsg = this.GetErrorMessage(error);
      if (errMsg.trim().toLowerCase() !== 'ok') {
        this.showAlert(errMsg);
      }
    } else {
      const errMsg = this.GetErrorMessage(error);
      if (errMsg.trim().toLowerCase() !== 'ok') {
        this.showAlert(errMsg);
      }
    }
  }

  /** Replaces native browser alert() with a Material snack-bar info panel */
  private showAlert(message: string): void {
    this.snackBar.open(message, '✕', {
      duration: 8000,
      panelClass: ['snack-info'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  public GetErrorMessage(error: any): string {
    // Log full error for debugging
    console.error('GetErrorMessage - Full error object:', error);
    
    // Try to extract meaningful error message from various formats
    if (error.error?.message) {
      return error.error.message;
    } else if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.error && typeof error.error === 'object') {
      // Try to extract message from error object
      const errorObj = error.error;
      if (errorObj.error) {
        return typeof errorObj.error === 'string' ? errorObj.error : JSON.stringify(errorObj.error);
      }
      if (errorObj.Message) {
        return errorObj.Message;
      }
      if (errorObj.title) {
        return errorObj.title;
      }
      // If object has properties, stringify it
      const keys = Object.keys(errorObj);
      if (keys.length > 0) {
        return JSON.stringify(errorObj);
      }
    } else if (error.statusText && error.statusText !== 'Unknown Error') {
      return error.statusText;
    } else if (error.message) {
      return error.message;
    }
    
    // Return informative message with status code if available
    if (error.status) {
      return `An error occurred (Status: ${error.status}). Please try again or contact support if the issue persists.`;
    }
    
    return 'An unexpected error occurred. Please try again or contact support if the issue persists.';
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  public GetProjectName(project: any): string {
    if (this.IsGAVS()) {
      return project.proJ_NM;
    }
    return project.proJ_ALIAS_NM || project.proJ_NM;
  }

  public GetFileExtension(fileName: string): string {
    return fileName.substr(fileName.lastIndexOf('.'));
  }

  public GetFileNameWithoutExtension(fileName: string): string {
    return (fileName.split('\\').pop()?.split('/').pop()?.split('.') || [])[0] || '';
  }

  public CopyObject(inObj: any): any {
    try {
      return JSON.parse(JSON.stringify(inObj));
    } catch (error) {
      console.error('Error copying object:', error);
      return null;
    }
  }

  public GetLocalDate(date: Date): string {
    try {
      return date.toDateString();
    } catch {
      return date.toString();
    }
  }

  /**
   * Export HTML table to Excel file
   * @param element HTML table element to export
   * @param filename Name of the Excel file (without extension)
   * Requires xlsx package: npm install xlsx
   */
  public exportToExcel(element: any, filename: string): void {
    try {
      const ws: any = XLSX.utils.table_to_sheet(element, { raw: true });
      const wb: any = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
      console.error('Excel export error:', error);
      this.showAlert('Failed to export to Excel. Please try again.');
    }
  }

  /**
   * Export a JSON array of objects to an Excel file.
   * @param rows Array of plain objects (each key becomes a column header)
   * @param filename Name of the Excel file (without extension)
   */
  public exportJsonToExcel(rows: any[], filename: string): void {
    try {
      const ws: any = XLSX.utils.json_to_sheet(rows);
      const wb: any = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
      console.error('Excel export error:', error);
      this.showAlert('Failed to export to Excel. Please try again.');
    }
  }

  public ToggleSideNav(): void {
    this.ShowSideNav = !this.ShowSideNav;
  }

  public GetNumberArray(iCount: number): number[] {
    return Array.from({ length: iCount }, (_, i) => i + 1);
  }

  public Years(n: number): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: n }, (_, i) => currentYear - i);
  }

  public setLocaleDate(dateValue: Date): Date {
    if (!dateValue) return dateValue;
    
    const dtDateValue = new Date(dateValue);
    return new Date(dtDateValue.getFullYear(), dtDateValue.getMonth(), dtDateValue.getDate());
  }

  public enumSelector(definition: any) {
    return Object.keys(definition)
      .filter(x => !isNaN(Number(x)))
      .map(key => ({
        title: definition[key],
        value: parseInt(key)
      }));
  }

  // ========================================
  // DATA FILTERING METHODS
  // ========================================

  /**
   * Apply criteria range filtering to data
   * Used by table-filter component
   * @param criteria Array of filter criteria
   * @param originalData Original data array to filter
   * @returns Filtered data array
   */
  public ApplyCriteriaRange(criteria: any[], originalData: any[]) {
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
   * Apply single criteria on data row
   * Helper method for ApplyCriteriaRange
   * @param criteria Filter criteria
   * @param data Data row
   * @returns True if data matches criteria
   */
  ApplyCriteriaOnData(criteria: any, data: any): boolean {
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

  // ========================================
  // BASE MEASURE & KPI PROCESS METHODS
  // ========================================

  /**
   * Load base measure enabled customers from localStorage
   */
  public LoadBaseMeasureEnabledCustomers(): void {
    const storedValue = localStorage.getItem('BaseMeasureEnabledCustomers');
    if (storedValue) {
      this.BaseMeasureEnabledCustomers = storedValue;
    }
  }

  /**
   * Check if base measure is enabled for a specific customer
   * @param custId Customer ID to check
   * @returns True if base measure is enabled for this customer
   */
  public IsBaseMeasureEnabledCustomer(custId: string): boolean {
    this.LoadBaseMeasureEnabledCustomers();
    if (this.BaseMeasureEnabledCustomers != null && this.BaseMeasureEnabledCustomers.indexOf(custId) > -1) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if KPI Process is enabled for a specific customer
   * Used to show/hide KPI process-related features (e.g., external KPI upload)
   * Migrated from legacy myUtility.ts -> IsKPIProcessEnabledCustomer()
   * 
   * @param custId Customer ID to check
   * @returns True if KPI process is enabled for this customer
   */
  public IsKPIProcessEnabledCustomer(custId: string): boolean {
    this.LoadKPIProcessEnabledCustomers();
    if (this.kpiProcessEnabledCustomers != null && this.kpiProcessEnabledCustomers.indexOf(custId) > -1) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Load KPI Process Enabled Customers
   * Fetches the list of customers who have KPI process features enabled
   * Called by IsKPIProcessEnabledCustomer() to lazy-load the customer list
   * Migrated from legacy myUtility.ts -> LoadKPIProcessEnabledCustomers()
   */
  private LoadKPIProcessEnabledCustomers(): void {
    if (this.kpiProcessEnabledCustomers == null || 
        this.kpiProcessEnabledCustomers == undefined || 
        this.kpiProcessEnabledCustomers == '') {
      // TODO: Implement service call when OtherServices is migrated
      // this._otherServices.getKPIProcessEnabledCustomers(this.AppSettings.token).subscribe(data => {
      //   if (data != null)
      //     this.kpiProcessEnabledCustomers = data;
      // });
      
      // Temporary: Return empty string until service is implemented
      this.kpiProcessEnabledCustomers = '';
    }
  }

  // TASK PLANNER UTILITY METHODS
  // ========================================

  /**
   * Get quarter based on month number
   * @param month Month number (1-12)
   * @returns Quarter string (Q1-Q4)
   */
  public getQuarter(month: number): string {
    let quarter: string;
    switch (month) {
      case 4:
      case 5:
      case 6: quarter = "Q1"; break;
      case 7:
      case 8:
      case 9: quarter = "Q2"; break;
      case 10:
      case 11:
      case 12: quarter = "Q3"; break;
      case 1:
      case 2:
      case 3: quarter = "Q4"; break;
      default: quarter = "Q1"; break;
    }
    return quarter;
  }

  /**
   * Get months based on financial year
   * @param year Financial year
   * @returns Array of month objects with value and title
   */
  public getmonthsBasedonYear(year: number): any[] {
    const currentYear = this.Year();
    const currentMonth = this.MonthCurrNum();
    
    if (currentYear == year) {
      // Get months up to current month
      let months = [];
      for (var i = 0; i <= currentMonth; i++) {
        months.push({ value: i, title: this.getMonthAbr(i) });
        if (i == currentMonth) {
          break;
        }
      }
      return months;
    } else {
      return this.getMonthNames();
    }
  }

  /**
   * Get dates based on quarter for task planner
   * @param selectedquarter Selected quarter
   * @param year Year
   * @param trendQuarter Trend quarter number (1=specific period, 2=till chosen period, 3=last 4 quarters)
   * @param periodstartDate Period start date
   * @param periodendDate Period end date
   * @returns Array of date objects with fromDate and toDate
   */
  public getDatesBasedOnQuarter(selectedquarter: string, year: number, trendQuarter: any, periodstartDate: any, periodendDate: any): any[] {
    let startDate: Date, endDate: Date, fromDate!: Date, toDate!: Date;
    let periodstartDate1: Date, periodendDate1: Date;
    let dates: any[] = [];
    const today = new Date();
    const quarter = Math.floor((today.getMonth() / 3));

    // Handle trendQuarter == 3 (Last 4 Quarters)
    if (trendQuarter == 3) {
      switch (selectedquarter) {
        case "Q1":
          fromDate = new Date(year - 1, 6, 1);
          toDate = new Date(year, 6, 0);
          break;
        case "Q2":
          fromDate = new Date(year - 1, 9, 1);
          toDate = new Date(year, 9, 0);
          break;
        case "Q3":
          fromDate = new Date(year - 1, 12, 1);
          toDate = new Date(year, 12, 0);
          break;
        case "Q4":
          fromDate = new Date(year - 1, 3, 1);
          toDate = new Date(year, 3, 0);
          break;
        case "H1":
          fromDate = new Date(year, 0, 1);
          toDate = new Date(year, 6, 0);
          break;
        case "H2":
          fromDate = new Date(year, 6, 1);
          toDate = new Date(year, 12, 0);
          break;
        case "lastQuarter":
          fromDate = new Date(year - 1, 4, 1);
          toDate = new Date(year, 3, 0);
          break;
        case "Annual":
          fromDate = new Date(year, 0, 1);
          toDate = new Date(year, 12, 0);
          break;
        default:
          fromDate = new Date(year, 3, 1);
          toDate = new Date(year, 6, 0);
          break;
      }
      dates.push({ fromDate, toDate });
      return dates;
    }

    switch (selectedquarter) {
      case "lastQuarter":
        // Calculate the last completed half-year period (H1 or H2)
        const currentMonth = today.getMonth();
        if (currentMonth >= 0 && currentMonth <= 5) {
          // We're in H1 (Jan-Jun), so return H2 of previous year (Jul-Dec)
          fromDate = new Date(today.getFullYear() - 1, 6, 1);
          toDate = new Date(today.getFullYear(), 0, 0); // Last day of Dec previous year
        } else {
          // We're in H2 (Jul-Dec), so return H1 of current year (Jan-Jun)
          fromDate = new Date(today.getFullYear(), 0, 1);
          toDate = new Date(today.getFullYear(), 6, 0); // Last day of June current year
        }
        break;
      case "Q1":
        startDate = new Date(year, 3, 1);
        endDate = new Date(year, 6, 0);
        fromDate = startDate;
        toDate = endDate;
        break;
      case "Q2":
        if (trendQuarter == 2) {
          startDate = new Date(year, 3, 1);
          endDate = new Date(year, 9, 0);
        } else {
          startDate = new Date(year, 6, 1);
          endDate = new Date(year, 9, 0);
        }
        fromDate = startDate;
        toDate = endDate;
        break;
      case "Q3":
        if (trendQuarter == 2) {
          startDate = new Date(year, 3, 1);
          endDate = new Date(year, 12, 0);
        } else {
          startDate = new Date(year, 9, 1);
          endDate = new Date(year, 12, 0);
        }
        fromDate = startDate;
        toDate = endDate;
        break;
      case "Q4":
        if (trendQuarter == 2) {
          startDate = new Date(year, 3, 1);
          endDate = new Date(year + 1, 3, 0);
        } else {
          startDate = new Date(year + 1, 0, 1);
          endDate = new Date(year + 1, 3, 0);
        }
        fromDate = startDate;
        toDate = endDate;
        break;
      case "H1":
        fromDate = new Date(year, 0, 1);
        toDate = new Date(year, 6, 0);
        break;
      case "H2":
        fromDate = new Date(year, 6, 1);
        toDate = new Date(year, 12, 0);
        break;
      case "Annual":
        fromDate = new Date(year, 0, 1);
        toDate = new Date(year, 12, 0);
        break;
      case "Select Period":
        const date = new Date();
        if (periodstartDate != null && periodendDate != null) {
          periodstartDate1 = new Date(periodstartDate);
          periodendDate1 = new Date(periodendDate);
          fromDate = periodstartDate1;
          toDate = periodendDate1;
        } else {
          fromDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
          toDate = new Date(date.getFullYear(), date.getMonth(), 0);
        }
        break;
      default:
        startDate = new Date(year, 3, 1);
        endDate = new Date(year, 6, 0);
        fromDate = startDate;
        toDate = endDate;
        break;
    }
    
    dates.push({ fromDate, toDate });
    return dates;
  }

  /**
   * Get Findings Count
   * Calculates count of audit findings by type (total, open, or closed)
   * Used by checklist-assessment-page to display finding statistics
   * 
   * @param openFindings - Array of finding objects
   * @param id - Audit ID to filter by
   * @param type - Type of count: "total", "open", or "closed"
   * @returns number - Count of findings matching criteria
   */
  public getFindingsCount(openFindings: any[], id: number, type: string): number {
    let count = 0;
    
    if (!openFindings || openFindings.length === 0) {
      return count;
    }

    const findings = openFindings.filter((x: any) => x.audiT_ID === id);
    
    if (findings && findings.length > 0) {
      switch (type) {
        case "total":
          count = findings[0].totaL_FINDINGS || 0;
          break;
        case "open":
          count = findings[0].opeN_FINDINGS || 0;
          break;
        case "closed":
          count = findings[0].closeD_FINDINGS || 0;
          break;
        default:
          count = 0;
          break;
      }
    }
    
    return count;
  }

  /**
   * Get default month for Premier SLA
   * If current date is last day of the month, show current month
   * Otherwise show previous month
   */
  public GetDefaultMonthForPremierSLA(): Array<{ Month: string; Year: number }> {
    let month = '';
    let year = this.Year();
    const date = new Date();
    const today = new Date().toDateString();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toDateString();

    if (today === lastDay) {
      month = this.MonthCurrAbr();
    } else {
      if (this.MonthCurrAbr() === 'Jan') {
        month = 'Dec';
        year = this.Year() - 1;
      } else {
        month = this.prevMonthAbr();
      }
    }

    return [{ Month: month, Year: year }];
  }

  /**
   * Get charts data for a customer and project
   * Calls ChartsService to fetch chart data and processes it
   * @param client_ID - Customer/Client ID
   * @param projecT_ID - Project ID
   */
  public GetCharts(client_ID: any, projecT_ID: any): void {
    this._chartsService.getCharts(client_ID, projecT_ID, new Date(), 'LastUpdated', this.AppSettings.token)
      .subscribe({
        next: (data: any) => {
          // Note: Chart() constructor from angular-highcharts needs to be installed
          // TODO: Install angular-highcharts: npm install angular-highcharts highcharts
          
          // Process radar chart if available
          // if (data.radarHighChart) {
          //   data.radarHighChart = new Chart(data.radarHighChart);
          // }
          
          // Process trend chart groups
          if (data.trendHighChartGroup && data.trendHighChartGroup.length > 0) {
            for (let i = 0; i < data.trendHighChartGroup.length; i++) {
              if (data.trendHighChartGroup[i].trendHighChart && data.trendHighChartGroup[i].trendHighChart.length > 0) {
                for (let j = 0; j < data.trendHighChartGroup[i].trendHighChart.length; j++) {
                  // TODO: Uncomment when angular-highcharts is installed
                  // data.trendHighChartGroup[i].trendHighChart[j].trendHighChart = 
                  //   new Chart(data.trendHighChartGroup[i].trendHighChart[j].trendHighChart);
                }
              }
            }
          }
          
          this.chartsMonthly = data;
          this.tableMonth = data.month || this.tableMonth;
        },
        error: (error: any) => {
          this.serviceError(error);
        }
      });
  }

  /**
   * Show thumbs status for product based on achievement and KPI data
   * @param data - Product data with KPI metrics
   * @param includeExclusions - Whether to include exclusions in calculation
   * @param achievementPercent - Achievement percentage threshold
   * @param viewBy - View type: 'By Expected Service Level' or 'By Minimum Service Level'
   * @returns 'Under Control' or 'Need Focus'
   */
  public showThumbsForProduct(data: any, includeExclusions: boolean, achievementPercent: any, viewBy: string): string {
    if (viewBy === 'By Expected Service Level') {
      let achievePercent = (((data.meT_CRITICAL_KPI + data.meT_KEY_KPI) / data.overalL_KPI_COUNT) * 100);
      
      if (includeExclusions) {
        achievePercent = (((data.exclusioN_MET_CRITICAL_KPI + data.exclusioN_MET_KEY_KPI) / data.overalL_KPI_COUNT) * 100);
        if ((data.criticaL_KPI === data.exclusioN_MET_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
          return 'Under Control';
        } else if ((data.criticaL_KPI !== data.exclusioN_MET_CRITICAL_KPI)) {
          return 'Need Focus';
        } else if ((data.criticaL_KPI === data.exclusioN_MET_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
          return 'Need Focus';
        }
      } else {
        if ((data.criticaL_KPI === data.meT_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
          return 'Under Control';
        } else if ((data.criticaL_KPI !== data.meT_CRITICAL_KPI)) {
          return 'Need Focus';
        } else if ((data.criticaL_KPI === data.meT_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
          return 'Need Focus';
        }
      }
    } else if (viewBy === 'By Minimum Service Level') {
      let achievePercent = (((data.secondarY_MET_CRITICAL_KPI + data.secondarY_MET_KEY_KPI) / data.overalL_KPI_COUNT) * 100);
      
      if (includeExclusions) {
        achievePercent = (((data.exclusioN_SECONDARY_MET_CRITICAL_KPI + data.exclusioN_SECONDARY_MET_KEY_KPI) / data.overalL_KPI_COUNT) * 100);
        if ((data.criticaL_KPI === data.exclusioN_SECONDARY_MET_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
          return 'Under Control';
        } else if ((data.criticaL_KPI !== data.exclusioN_SECONDARY_MET_CRITICAL_KPI)) {
          return 'Need Focus';
        } else if ((data.criticaL_KPI === data.exclusioN_SECONDARY_MET_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
          return 'Need Focus';
        }
      } else {
        if ((data.criticaL_KPI === data.secondarY_MET_CRITICAL_KPI) && achievePercent >= Number(achievementPercent)) {
          return 'Under Control';
        } else if ((data.criticaL_KPI !== data.secondarY_MET_CRITICAL_KPI)) {
          return 'Need Focus';
        } else if ((data.criticaL_KPI === data.secondarY_MET_CRITICAL_KPI) && achievePercent < Number(achievementPercent)) {
          return 'Need Focus';
        }
      }
    }
    
    return 'Need Focus'; // Default fallback
  }

  /**
   * Get SLA Status
   * Determines SLA status based on KPI details and exclusion settings
   * Used by successgoal component to determine actual vs expected status
   * Migrated from legacy myUtility.ts -> GetSLAStatus()
   * 
   * @param kpiDetail - KPI detail object with actual and status fields
   * @param includeExclusions - Whether to include exclusion data
   * @returns string - SLA status ('Met', 'Not Met', 'NA', etc.)
   */
  public GetSLAStatus(kpiDetail: any, includeExclusions: boolean): string {
    let actual = '';
    
    if (!includeExclusions) {
      actual = kpiDetail.kpI_ACTUAL;
    } else {
      actual = kpiDetail.exclusioN_kpI_ACTUAL;
      if (actual == undefined || actual == null || actual === '') {
        if (kpiDetail.iS_EX_NO_DATA)
          return 'NA';
        else
          return kpiDetail.exclusioN_SLA_STATUS;
      }
    }
    
    const status = !includeExclusions ? kpiDetail.slA_STATUS : kpiDetail.exclusioN_SLA_STATUS;
    
    if (actual == undefined || actual == null || actual === '') {
      if (kpiDetail.iS_NO_DATA)
        return 'NA';
      else
        return kpiDetail.slA_STATUS;
    } else {
      return status;
    }
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
      
      this._chartsService.getRiskChart(riskDashboardInputs, this.AppSettings.token).subscribe({
        next: (data: any) => {
          this.chartsMonthly = data;
          this.riskSubject.next(this.chartsMonthly);
        },
        error: (error: any) => {
          this.serviceError(error);
        }
      });
    }
  }

  // SECURITY UTILITIES
  // ========================================

  /**
   * Safely open external URL with validation
   * SECURITY: Validates URL before opening to prevent open redirect vulnerabilities
   * 
   * @param url URL to open
   * @param target Target window (default: '_blank')
   * @returns Window object or null if validation fails
   */
  public safeWindowOpen(url: string, target: string = '_blank'): Window | null {
    if (!this.isUrlSafe(url)) {
      console.error('🚨 SECURITY: Blocked unsafe URL redirect:', url);
      this.showError('Invalid URL - navigation blocked for security');
      return null;
    }

    const newWindow = window.open(url, target);
    if (newWindow) {
      newWindow.focus();
    }
    return newWindow;
  }

  /**
   * Validate URL safety for redirects
   * SECURITY: Prevents open redirect vulnerabilities by checking URL patterns
   * 
   * Allowed URL patterns:
   * - Relative paths (starting with / or ./)\n   * - Internal Angular routes
   * - HTTPS URLs from trusted domains (Microsoft, internal domains)
   * - Static assets
   * 
   * @param url URL to validate
   * @returns True if URL is safe to use
   */
  public isUrlSafe(url: string): boolean {
    if (!url || url.trim() === '') {
      return false;
    }

    const trimmedUrl = url.trim();

    // Allow relative paths and Angular routes
    if (trimmedUrl.startsWith('/') || 
        trimmedUrl.startsWith('./') || 
        trimmedUrl.startsWith('../')) {
      return true;
    }

    // Allow static assets
    if (trimmedUrl.startsWith('assets/')) {
      return true;
    }

    try {
      const urlObj = new URL(trimmedUrl, window.location.origin);
      
      // Only allow HTTPS (except localhost for development)
      if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        return false;
      }

      // For HTTP, only allow localhost
      if (urlObj.protocol === 'http:' && urlObj.hostname !== 'localhost' && urlObj.hostname !== '127.0.0.1') {
        return false;
      }

      // Whitelist of allowed domains
      const allowedDomains = [
        'login.microsoftonline.com',  // Microsoft authentication
        'localhost',                   // Development
        '127.0.0.1',                  // Development
        window.location.hostname       // Same origin
      ];

      // Check if domain is in whitelist
      const isAllowedDomain = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );

      return isAllowedDomain;
      
    } catch (e) {
      // Invalid URL format
      console.warn('⚠️ Invalid URL format:', url);
      return false;
    }
  }

  /**
   * Safely navigate using window.location.href with validation
   * SECURITY: Validates URL before redirecting
   * 
   * @param url URL to navigate to
   * @returns True if navigation started, false if blocked
   */
  public safeNavigate(url: string): boolean {
    if (!this.isUrlSafe(url)) {
      console.error('🚨 SECURITY: Blocked unsafe URL navigation:', url);
      this.showError('Invalid URL - navigation blocked for security');
      return false;
    }

    window.location.href = url;
    return true;
  }
}

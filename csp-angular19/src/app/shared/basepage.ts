/**
 * BasePage - Base class for page components requiring authentication
 * Migrated from Angular 6 to Angular 19
 * 
 * Migration Changes:
 * - Removed Router dependency (components should inject their own)
 * - Simplified validation logic
 * - Added return type for validation
 * - Added Directive decorator for Angular 19 compatibility
 * - Added MatDialog for styled popup
 */

import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { WarningPopupComponent } from './components/warning-popup/warning-popup.component';

@Directive()
export abstract class BasePage implements OnInit {
  protected abstract router: Router;
  protected abstract dialog: MatDialog;

  ngOnInit(): void {
    this.validateLogin();
  }

  /**
   * Validate if user is logged in
   * Redirects to login page if not authenticated
   * @returns true if logged in, false otherwise
   */
  protected validateLogin(): boolean {
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
    
    const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }
}

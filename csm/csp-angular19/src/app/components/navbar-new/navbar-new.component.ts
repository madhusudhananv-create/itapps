import { 
  Component, 
  OnInit, 
  output, 
  input, 
  inject, 
  signal, 
  computed,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, filter, take } from 'rxjs';

import { AppsService } from '../../core/services/apps.service';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';
import { AuthService, UserSession } from '../../core/services/auth.service';
import { NavbarMenuComponent } from '../navbar-menu/navbar-menu.component';
import { environment } from '../../../environments/environment';
import { AccessControl } from '../../shared/access-control';
import { enumRoles } from '../../shared/enum';

@Component({
  selector: 'app-navbar-new',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormsModule,
    NavbarMenuComponent,
    DialogYesNoComponent
  ],
  templateUrl: './navbar-new.component.html',
  styleUrls: ['./navbar-new.component.scss']
})
export class NavbarNewComponent implements OnInit {
  // Modern Angular 19 dependency injection using inject()
  private readonly router = inject(Router);
  private readonly appsService = inject(AppsService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // Angular 19 signal-based inputs/outputs
  readonly showmenu = input<boolean>(false, { alias: 'ShowMenu' });
  readonly showDashboardMenu = output<boolean>();

  // Reactive state using signals
  readonly isLoggingOut = signal<boolean>(false);
  readonly logoutError = signal<string | null>(null);
  readonly toggleMenu = signal<boolean>(false);
  readonly isMenuOpen = signal<boolean>(false);
  readonly enviroment = signal<string>('');
  
  // User info signals
  readonly displayname = signal<string>('');
  readonly empid = signal<string>('');
  readonly isLoggedIn = signal<boolean>(false);
  readonly isGAVS = signal<boolean>(false);
  readonly isEditable = signal<boolean>(false);
  readonly isHR = signal<boolean>(false);

  // Computed signals for derived state
  readonly canLogout = computed(() => this.isLoggedIn() && !this.isLoggingOut());
  readonly logoutButtonText = computed(() => this.isLoggingOut() ? 'Logging out...' : 'Logout');

  /** Show Integrated Apps menu if user has access to at least one integrated app */
  readonly hasIntegratedAppsAccess = computed(() =>
    this._access.IsAllowed(827, 1, '', '') ||
    this._access.IsAllowed(829, 1, '', '') || this._access.IsAllowed(832, 1, '', '')
    // Add more app permission checks here with ||
  );

  // Legacy compatibility property
  status: { isopen: boolean } = { isopen: false };
constructor(
    public _access: AccessControl
  ) { }
  ngOnInit(): void {
    this.enviroment.set(environment.environment_Id);
    
    // Initialize user state from current session (if exists)
    this.initializeUserState();
    
    // Subscribe to auth state changes for reactive updates
    // This will trigger immediately if session exists and on any future changes
    this.authService.userSession$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(session => {
        if (session) {
          this.updateUserState(session);
        } else {
          this.resetUserState();
        }
      });
  }

  /**
   * Initialize user state from current session
   * This reads from the BehaviorSubject's current value
   */
  private initializeUserState(): void {
    const currentSession = this.authService.currentUser();
    if (currentSession) {
      this.updateUserState(currentSession);
    }
  }

  /**
   * Update user state signals from session
   */
  private updateUserState(session: UserSession): void {
    this.displayname.set(session.displayname || '');
    this.empid.set(session.empid || '');
    this.isLoggedIn.set(true);
    this.isGAVS.set(session.logintype === 'gavs' || session.logintype === 'gslab');
    this.isEditable.set(this.checkIsEditable(session));
    this.isHR.set(this.checkIsHR(session));
  }

  /**
   * Check if user has edit access based on role
   * Matches legacy IsEditable() logic using enumRoles
   */
  private checkIsEditable(session: UserSession): boolean {
    if (session.logintype === 'customer') {
      return false;
    }
    
    const role = session.role ? parseInt(session.role) : 0;
    
    // Only these roles have edit access (using enumRoles enum)
    return role === enumRoles.CustomerSuccessManager ||
           role === enumRoles.ProjectManager ||
           role === enumRoles.Quality ||
           role === enumRoles.PMO ||
           role === enumRoles.Finance ||
           role === enumRoles.Marketing ||
           role === enumRoles.GSLab;
  }

  /**
   * Check if user has HR role
   * Matches legacy IsHR() logic using enumRoles
   */
  private checkIsHR(session: UserSession): boolean {
    const role = session.role ? parseInt(session.role) : 0;
    return role === enumRoles.HR;
  }

  /**
   * Reset user state on logout
   */
  private resetUserState(): void {
    this.displayname.set('');
    this.empid.set('');
    this.isLoggedIn.set(false);
    this.isGAVS.set(false);
    this.isEditable.set(false);
    this.isHR.set(false);
  }

  dropdownMenu(event: MouseEvent): void {
    event.preventDefault();
    this.isMenuOpen.update(current => !current);
    this.status.isopen = this.isMenuOpen();
  }

  toggleDashboardMenu(): void {
    this.showDashboardMenu.emit(this.toggleMenu());
  }

  toggleDashboardMenuNew(): void {
    this.toggleMenu.update(current => !current);
    this.showDashboardMenu.emit(this.toggleMenu());
  }

  home(): void {
    this.router.navigateByUrl("/dashboard");
  }

  logoutOffice365(): void {
    // Clear user data
    localStorage.removeItem('empid');
    localStorage.removeItem('displayname');
    localStorage.removeItem('token');
    
    // Redirect to Microsoft logout
    const loginurl = `https://login.microsoftonline.com/${environment.tenantid}/oauth2/logout?post_logout_redirect_uri=${environment.loginpage}`;
    window.location.href = loginurl;
  }

  /**
   * Modern Angular 19 logout with async/await pattern
   * Features:
   * - Loading state during logout process
   * - Proper error handling with user feedback
   * - Uses firstValueFrom for cleaner async code
   * - Automatic cleanup with DestroyRef
   */
  async logout(): Promise<void> {
    // Prevent multiple logout attempts
    if (this.isLoggingOut()) {
      return;
    }

    // Show confirmation dialog using Angular Material with modern styling
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      data: {
        title: 'Log Out',
        message: 'Are you sure you want to log out of your account?',
        confirmText: 'Log Out',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'logout',
        iconColor: '#e53935'
      },
      disableClose: true,
      autoFocus: true,
      panelClass: 'modern-dialog',
      backdropClass: 'modern-dialog-backdrop'
    });

    try {
      // Wait for dialog result using firstValueFrom (modern approach)
      const confirmed = await firstValueFrom(
        dialogRef.afterClosed().pipe(
          take(1),
          filter((result): result is boolean => result !== undefined)
        )
      );

      if (!confirmed) {
        return;
      }

      // Set loading state
      this.isLoggingOut.set(true);
      this.logoutError.set(null);

      // Call backend logout API with async/await
      await this.performLogout();

    } catch (error) {
      // Handle any errors during the logout process
      this.handleLogoutError(error);
    }
  }

  /**
   * Perform the actual logout operation
   * Separated for better testability and error handling
   */
  private async performLogout(): Promise<void> {
    try {
      // Call the backend logout API
      await firstValueFrom(this.appsService.logout());
      
      // Success - clear user session
      this.authService.logout();
      
    } catch (apiError) {
      // Log error but still logout locally (graceful degradation)
      console.warn('Logout API error (continuing with local logout):', apiError);
      this.authService.logout();
      
    } finally {
      // Always reset loading state
      this.isLoggingOut.set(false);
    }
  }

  /**
   * Handle logout errors with proper logging and user feedback
   */
  private handleLogoutError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Logout error:', error);
    
    this.logoutError.set(errorMessage);
    this.isLoggingOut.set(false);
    
    // Even on error, attempt local logout for security
    try {
      this.authService.logout();
    } catch (localError) {
      console.error('Local logout also failed:', localError);
    }
  }

  /**
   * Helper method for access control
   * Delegates to AccessControl service for proper permission checking
   */
  isAllowed(moduleId: number, actionId: number): boolean {
    return this._access.IsAllowed(moduleId, actionId, '', '');
  }

  /**
   * Open BCM (Business Continuity Management) in a new tab
   * Opens the BCM module in a separate browser tab
   */
  openBCMInNewTab(): void {
    const bcmUrl = window.location.origin + '/bcm';
    window.open(bcmUrl, '_blank');
  }

  /**
   * Open ERM (Enterprise Risk Management) in a new tab
   * Opens the ERM module in a separate browser tab
   */
  openERMInNewTab(): void {
    const ermUrl = window.location.origin + '/erm';
    window.open(ermUrl, '_blank');
  }

  /**
   * Open CSAT Analysis Dashboard in a new tab
   * Opens the CSAT Analysis Dashboard in a separate browser tab
   */
  openCSATAnalysisInNewTab(): void {
    const csatUrl = window.location.origin + '/csat-analysis-dashboard/index.html';
    window.open(csatUrl, '_blank');
  }
  /**
   * Open AIMI (AI-driven Insights) in a new tab
   * Opens the AIMI module in a separate browser tab
   */
  openAIMIInNewTab(): void {
    // Open the SPA root (not index.html) so AIMI's client-side router resolves
    // the default route instead of 404'ing on the literal "/index.html" path
    const aimiUrl = window.location.origin + '/aimi/';
    window.open(aimiUrl, '_blank');
  }
   /**
   * Navigate back to enterprise dashboard
   * Used by the back button on account dashboard pages and logo clicks
   * Forces a full page reload to ensure proper component initialization
   */
  navigateToEnterpriseDashboard(): void {
    // Set flag to prevent auto-redirect when user explicitly navigates to enterprise dashboard
    sessionStorage.setItem('skipAutoRedirect', 'true');
    // Force full page reload to ensure clean navigation
    window.location.href = '/newdashboard/custm';
  }

  /**
   * Handle logo click to set flag for preventing auto-redirect
   */
  onLogoClick(): void {
    this.navigateToEnterpriseDashboard();
  }
}

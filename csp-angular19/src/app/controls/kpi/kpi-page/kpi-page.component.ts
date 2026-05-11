import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyUtility } from '../../../shared/my-utility';
import { AppsService } from '../../../core/services/apps.service';
import { environment } from '../../../../environments/environment';
import { KpiComponent } from '../kpi.component';
import { NavbarNewComponent } from '../../../components/navbar-new/navbar-new.component';
import { MenuComponent } from '../../../components/menu/menu.component';

/**
 * KpiPageComponent
 * 
 * Page wrapper component for KPI module with navigation and sidebar
 * Migrated from Angular 6 to Angular 19
 * 
 * Features:
 * - Responsive layout with sidebar navigation
 * - Mobile query detection for responsive design
 * - Customer ID routing parameter handling
 * - Menu toggle functionality
 * - Logout functionality with GAVS/standard authentication
 * - Top navigation bar integration
 * - Side navigation menu integration
 * 
 * Usage:
 * Provides a full-page layout for the KPI component with navbar and menu
 * 
 * @author Legacy Migration Team
 * @since Angular 19
 */
@Component({
  selector: 'app-kpi-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    KpiComponent,
    NavbarNewComponent,
    MenuComponent
  ],
  templateUrl: './kpi-page.component.html',
  styleUrls: ['./kpi-page.component.scss']
})
export class KpiPageComponent implements OnInit, OnDestroy {
  /** Customer ID from route parameters */
  custId: string = '';
  
  /** Media query for mobile detection */
  mobileQuery: MediaQueryList;
  
  /** Listener for mobile query changes */
  private _mobileQueryListener: () => void;
  
  /** Menu toggle status from navbar */
  menuToggleStatus: boolean = false;

  // Inject dependencies using Angular 19 inject() function
  private _activatedRoute = inject(ActivatedRoute);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  private _router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private media = inject(MediaMatcher);

  constructor() {
    // Setup mobile query detection
    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  /**
   * Initialize component
   * Gets customer ID from route parameters
   */
  ngOnInit(): void {
    this.custId = this._activatedRoute.snapshot.params["custid"];
  }

  /**
   * Cleanup on component destroy
   * Remove mobile query listener
   */
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  /**
   * Handle menu toggle change from navbar
   * @param value - Toggle status (true/false)
   */
  onMenuToggleChange(value: boolean): void {
    this.menuToggleStatus = value;
  }

  /**
   * Handle user logout
   * Shows confirmation dialog and logs out user
   * Handles both GAVS and standard authentication
   */
  logout(): void {
    const dialogRef = this._util.showWarningConfirmation(
      'Are you sure you want to log out?',
      'Logout'
    );
    
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        if (this._util.IsGAVS()) {
          this.service_Logout();
          const loginurl = 'https://login.microsoftonline.com/' + environment.tenantid + '/oauth2/logout?post_logout_redirect_uri=' + environment.loginpage;
          window.location.href = loginurl;
        } else {
          this.service_Logout();
          this._router.navigateByUrl('/login');
        }
      }
    });
  }

  /**
   * Call logout service
   * Clears user session data
   */
  service_Logout(): void {
    this._appservice.Logout().subscribe({
      next: (data: any) => {
        this._util.empid('');
        this._util.displayname('');
        this._util.token('');
      },
      error: (error: any) => {
        this._util.serviceError(error);
      }
    });
  }
}

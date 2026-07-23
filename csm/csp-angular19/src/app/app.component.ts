/**
 * App Component - Root Component
 * Migrated from legacy Angular 6 to Angular 19
 * 
 * Main responsibilities:
 * - Bootstrap the application
 * - Provide router outlet for navigation
 * - Handle authentication state
 * - Manage global layout and menu visibility
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, Subscription } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';
import { SessionTimeoutService } from './core/services/session-timeout.service';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  // Inject services using modern Angular 19 inject() function
  private router = inject(Router);
  private authService = inject(AuthService);
  private sessionTimeoutService = inject(SessionTimeoutService);
  private breakpointObserver = inject(BreakpointObserver);
  private location = inject(Location);

  // Component state
  title = 'CSM Application';
  companyName = environment.company_name;
  showContentMenu: boolean = false;
  
  // Mobile responsive state
  isMobile = false;
  
  // Subscriptions for cleanup
  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Set up mobile breakpoint observer
    this.subscriptions.add(
      this.breakpointObserver.observe([
        Breakpoints.HandsetPortrait,
        Breakpoints.HandsetLandscape
      ]).subscribe(result => {
        this.isMobile = result.matches;
      })
    );

    // Listen to route changes for analytics or other side effects
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        // Track page views, update menu visibility, etc.
        this.handleRouteChange(event.url);
      })
    );

    // Listen to authentication state changes to manage session timeout
    this.subscriptions.add(
      this.authService.userSession$.subscribe(session => {
        if (session && session.token) {
          // User logged in - start session timeout monitoring
          this.sessionTimeoutService.startMonitoring();
        } else {
          // User logged out - stop session timeout monitoring
          this.sessionTimeoutService.stopMonitoring();
        }
      })
    );

    // Initial authentication check
    this.checkInitialAuth();
  }

  ngOnDestroy(): void {
    // Cleanup all subscriptions
    this.subscriptions.unsubscribe();
    // Stop session timeout monitoring
    this.sessionTimeoutService.stopMonitoring();
  }

  /**
   * Check authentication on app initialization
   * Redirect to login if not authenticated (except for public routes)
   * 
   * LEGACY ENTRY POINT - restored from original Angular 6 app.component.ts ngOnInit()
   */
  private checkInitialAuth(): void {
    // Entry point for application - legacy behavior restored
    const empId = localStorage.getItem('empid');
    const path = this.location.path();
    
    if (empId === undefined || empId === null || empId.trim() === '') {
      // Check if on public routes that don't require auth
      if (
        path.indexOf('CustomerSuccessSurvey') > 0 ||
        path.indexOf('login') > 0 ||
        path.indexOf('setpassword') > 0
      ) {
        // Do nothing - allow access to public routes
      } else if (path.indexOf('landingpage') < 0) {
        // Save intended URL for redirect after login, then logout
        localStorage.setItem('navigateurl', path);
        this.legacyLogout();
      }
    } else if (this.authService.getToken()) {
      // User is authenticated - start session timeout monitoring
      this.sessionTimeoutService.startMonitoring();
    }
  }

  /**
   * Legacy logout method - clears empid and redirects to login
   * Matches original behavior from myUtility.empid('') + router.navigateByUrl('/login')
   */
  private legacyLogout(): void {
    localStorage.setItem('empid', '');
    this.router.navigateByUrl('/login');
  }

  /**
   * Handle route changes
   * Can be used for analytics, menu updates, session timeout management, etc.
   */
  private handleRouteChange(url: string): void {
    // Log navigation for debugging
    if (!environment.production) {
    }
    
    // Public routes where session timeout should not run
    const publicRoutes = [
      'login',
      'landingpage',
      'CustomerSuccessSurvey',
      'setpassword',
      'forgotpassword',
      'activation',
      'customerinvite',
      'resetpassword'
    ];
    
    const isPublicRoute = publicRoutes.some(route => url.includes(route));
    const isAuthenticated = !!this.authService.getToken();
    
    // Manage session timeout monitoring based on route and auth state
    if (isPublicRoute || !isAuthenticated) {
      // Stop monitoring on public routes or when not authenticated
      this.sessionTimeoutService.stopMonitoring();
    } else {
      // Start/reset monitoring on protected routes when authenticated
      this.sessionTimeoutService.startMonitoring();
    }
    
    // Additional route-based logic can be added here
    // For example: updating page titles, tracking analytics, etc.
  }

  /**
   * Check if the current route should display the header
   * Header is hidden on public/authentication routes and routes with their own navbar
   */
  shouldShowHeader(): boolean {
    const path = this.location.path();
    
    // Public routes that don't show header
    const publicRoutes = [
      'login',
      'landingpage',
      'CustomerSuccessSurvey',
      'setpassword',
      'forgotpassword',
      'activation',
      'customerinvite',
      'resetpassword'
    ];
    
    // Protected routes that have their own navbar (don't need app-header)
    const routesWithOwnNavbar = [
      '/kpi/',           // KPI page has its own navbar
      '/productkpi/',    // Product KPI page has its own navbar
      '/newdashboard/'   // Dashboard has its own navigation
    ];
    
    // Hide header if on any public route
    const isPublicRoute = publicRoutes.some(route => path.includes(route));
    
    // Hide header if on routes with their own navbar
    const hasOwnNavbar = routesWithOwnNavbar.some(route => path.includes(route));
    
    return !isPublicRoute && !hasOwnNavbar;
  }
}


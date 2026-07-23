/**
 * Landing Component - OAuth Callback Handler
 * Handles redirects from OAuth providers (Google, Office 365)
 * Migrated from LEGACY-SOURCE/src/app/authentication/landingpage
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppsService } from '../../../core/services/apps.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private appsService = inject(AppsService);

  ngOnInit(): void {
    // Check if this is an Office 365 callback
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.handleOAuth2Callback(fragment);
      } else {
        // Check query params (alternative OAuth flow)
        this.route.queryParams.subscribe(params => {
          if (params['code'] || params['id_token']) {
            this.handleOAuth2Callback(this.buildFragmentFromParams(params));
          } else {
            // No OAuth data - redirect to login
            this.redirectToLogin('No authentication data received');
          }
        });
      }
    });
  }

  /**
   * Handle OAuth2 callback from Office 365 or Google
   */
  private handleOAuth2Callback(fragment: string): void {
    const params = this.parseFragment(fragment);
    
    if (params['id_token']) {
      // Office 365 login
      this.handleOffice365Token(params['id_token']);
    } else if (params['access_token']) {
      // Google login (alternative flow)
      this.handleGoogleToken(params['access_token']);
    } else {
      this.redirectToLogin('Invalid authentication response');
    }
  }

  /**
   * Parse OAuth fragment/hash into key-value pairs
   */
  private parseFragment(fragment: string): any {
    const params: any = {};
    fragment.split('&').forEach(part => {
      const [key, value] = part.split('=');
      params[key] = decodeURIComponent(value);
    });
    return params;
  }

  /**
   * Build fragment string from query params
   */
  private buildFragmentFromParams(params: any): string {
    return Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * Handle Office 365 ID token
   */
  private handleOffice365Token(idToken: string): void {
    // Authenticate with backend using Office 365 token
    this.appsService.authenticatewithtoken(idToken).subscribe({
      next: (response) => {
        // Let AuthService process the authentication response
        // This will update session, emit to subscribers, and handle navigation
        const token = response.headers.get('token');
        const empid = response.headers.get('empid');
        const role = response.headers.get('role');
        const logintype = response.headers.get('logintype');
        const displayname = response.headers.get('displayname');
        const access = response.headers.get('access');

        // Parse access control
        let accessList: any[] = [];
        try {
          if (access) accessList = JSON.parse(access);
        } catch (error) {
          console.error('Error parsing access control:', error);
        }

        // Create session object
        const session = {
          empid: empid || '',
          displayname: displayname || '',
          token: token || '',
          logintype: (logintype as any) || '',
          role: role || '',
          access: accessList,
          customerid: localStorage.getItem('customerid') || ''
        };

        // Update AuthService session - this will emit to all subscribers
        this.authService['setUserSession'](session);
        
        
        // Clear project filters
        localStorage.setItem('projIds', '');
        localStorage.setItem('CustomerIds', '');
        
        // Check for saved navigation URL
        const navigateUrl = localStorage.getItem('navigateurl') || '';
        if (navigateUrl && navigateUrl.trim() !== '' && !navigateUrl.includes('login')) {
          localStorage.setItem('navigateurl', '');
          this.router.navigateByUrl(navigateUrl);
          return;
        }

        // Navigate based on login type
        if (logintype === 'gavs' || logintype === 'gslab') {
          this.router.navigateByUrl('/newdashboard/custm');
        } else {
          const custId = localStorage.getItem('customerid') || '';
          this.router.navigateByUrl('/newdashboard/cust/' + custId);
        }
      },
      error: (error) => {
        console.error('Office 365 authentication failed:', error);
        this.redirectToLogin('Authentication failed. Please try again.');
      }
    });
  }

  /**
   * Handle Google access token
   */
  private handleGoogleToken(accessToken: string): void {
    // Similar to Office 365, but for Google
    this.appsService.authenticatewithtoken(accessToken).subscribe({
      next: (response) => {
        // Let AuthService process the authentication response
        const token = response.headers.get('token');
        const empid = response.headers.get('empid');
        const role = response.headers.get('role');
        const logintype = response.headers.get('logintype');
        const displayname = response.headers.get('displayname');
        const access = response.headers.get('access');

        // Parse access control
        let accessList: any[] = [];
        try {
          if (access) accessList = JSON.parse(access);
        } catch (error) {
          console.error('Error parsing access control:', error);
        }

        // Create session object
        const session = {
          empid: empid || '',
          displayname: displayname || '',
          token: token || '',
          logintype: (logintype as any) || '',
          role: role || '',
          access: accessList,
          customerid: localStorage.getItem('customerid') || ''
        };

        // Update AuthService session - this will emit to all subscribers
        this.authService['setUserSession'](session);
        
        
        // Clear project filters
        localStorage.setItem('projIds', '');
        localStorage.setItem('CustomerIds', '');
        
        // Check for saved navigation URL
        const navigateUrl = localStorage.getItem('navigateurl') || '';
        if (navigateUrl && navigateUrl.trim() !== '' && !navigateUrl.includes('login')) {
          localStorage.setItem('navigateurl', '');
          this.router.navigateByUrl(navigateUrl);
          return;
        }

        // Navigate based on login type
        if (logintype === 'gavs' || logintype === 'gslab') {
          this.router.navigateByUrl('/newdashboard/custm');
        } else {
          const custId = localStorage.getItem('customerid') || '';
          this.router.navigateByUrl('/newdashboard/cust/' + custId);
        }
      },
      error: (error) => {
        console.error('Google authentication failed:', error);
        this.redirectToLogin('Authentication failed. Please try again.');
      }
    });
  }

  /**
   * Redirect to login with error message
   */
  private redirectToLogin(message: string): void {
    console.error('Landing page error:', message);
    alert(message);
    this.router.navigateByUrl('/login');
  }
}

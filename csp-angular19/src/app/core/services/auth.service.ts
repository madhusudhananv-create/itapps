/**
 * AuthService - Authentication and Session Management
 * Migrated from LEGACY-SOURCE/src/app/Shared/myUtility.ts and login.component.ts
 *
 * FIXES IN THIS VERSION:
 * 1. Added authenticateWithGoogleAccessToken() — sends raw access token to backend.
 *    Backend calls Google API server-to-server (no CORS issue from Angular).
 *    Used by login.component.ts popup flow to avoid direct googleapis.com call.
 *
 * 2. Added authenticateWithGoogleUserInfo() — accepts pre-fetched user info object.
 *    Used as fallback if backend prefers structured user data over raw token.
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Observable, BehaviorSubject, throwError, map, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppAccessControlsModel } from '../../models/access-control.model';
import { WarningPopupComponent } from '../../shared/components/warning-popup/warning-popup.component';
import { AccessControl } from '../../shared/access-control';

export interface AuthResponse {
  headers: {
    get(name: string): string | null;
  };
}

export interface UserSession {
  empid: string;
  displayname: string;
  token: string;
  logintype: 'gavs' | 'gslab' | 'customer' | '';
  role: string;
  access: AppAccessControlsModel[];
  customerid?: string;
}

export interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  authToken: string;
  idToken: string;
  authorizationCode: string;
  provider: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http          = inject(HttpClient);
  private router        = inject(Router);
  private dialog        = inject(MatDialog);
  private accessControl = inject(AccessControl);
  private snackBar      = inject(MatSnackBar);

  private apiurl_auth = environment.webapiuri_auth;
  private apiurl      = environment.webapiuri;

  private userSessionSubject = new BehaviorSubject<UserSession | null>(this.loadSessionFromStorage());
  public  userSession$       = this.userSessionSubject.asObservable();

  public isAuthenticated = signal(false);
  public currentUser     = signal<UserSession | null>(null);
  public isLoading       = signal(false);

  public isGAVSUser = computed(() => {
    const user = this.currentUser();
    return user?.logintype === 'gavs' || user?.logintype === 'gslab';
  });

  public isCustomerUser = computed(() => {
    const user = this.currentUser();
    return user?.logintype === 'customer';
  });

  constructor() {
    const session = this.loadSessionFromStorage();
    if (session) {
      this.setUserSession(session);
    }
  }

  // ── Session helpers ───────────────────────────────────────────────

  private loadSessionFromStorage(): UserSession | null {
    try {
      const empid = localStorage.getItem('empid');
      const token = localStorage.getItem('token');
      if (!empid || !token) return null;

      return {
        empid,
        displayname : localStorage.getItem('displayname') || '',
        token,
        logintype   : (localStorage.getItem('logintype') as any) || '',
        role        : localStorage.getItem('role') || '',
        access      : this.getAccessListFromStorage(),
        customerid  : localStorage.getItem('customerid') || ''
      };
    } catch (error) {
      console.error('Error loading session from storage:', error);
      return null;
    }
  }

  private getAccessListFromStorage(): AppAccessControlsModel[] {
    try {
      const accessStr = localStorage.getItem('access');
      return accessStr ? JSON.parse(accessStr) : [];
    } catch {
      return [];
    }
  }

  private setUserSession(session: UserSession): void {

    if (!session.empid)  console.error('🚨 setUserSession: empid is EMPTY!',  session);
    if (!session.token)  console.error('🚨 setUserSession: token is EMPTY!',   session);

    this.userSessionSubject.next(session);
    this.currentUser.set(session);
    this.isAuthenticated.set(true);

    localStorage.setItem('empid',       session.empid);
    localStorage.setItem('displayname', session.displayname);
    localStorage.setItem('token',       session.token);
    localStorage.setItem('logintype',   session.logintype);
    localStorage.setItem('role',        session.role);
    localStorage.setItem('access',      JSON.stringify(session.access));
    if (session.customerid) {
      localStorage.setItem('customerid', session.customerid);
    }

    // SECURITY: Only log localStorage details in development
  }

  private clearUserSession(): void {
    this.userSessionSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.clear();
  }

  // ── Authentication methods ────────────────────────────────────────

  /**
   * Authenticate customer user with email/password
   */
  authenticateCustomer(email: string, password: string): Observable<any> {
    localStorage.clear();
    this.isLoading.set(true);

    const apiuri      = this.apiurl_auth + 'AuthenticateUser';
    const credentials = btoa(email + ':' + password);

    return this.http.post(apiuri, credentials, { observe: 'response' }).pipe(
      tap((response: any) => this.processAuthResponse(email, response)),
      catchError((error) => {
        this.isLoading.set(false);
        return this.handleAuthError(error);
      }),
      map(() => true)
    );
  }

  /**
   * Authenticate with Google — accepts full GoogleUserData (ID token flow / One Tap)
   * Called when credential JWT is decoded directly in the login component.
   */
  authenticateWithGoogle(googleUserData: GoogleUserData): Observable<any> {
    this.isLoading.set(true);
    const apiuri = this.apiurl_auth + 'AuthenticateGoogleToken';

    // SECURITY: Don't log sensitive Google user data in production

    return this.http.post(apiuri, googleUserData, { observe: 'response' }).pipe(
      tap((response: any) => {
        if (!environment.production) {
        }
        this.processAuthResponse('', response);
      }),
      catchError((error) => {
        console.error('Backend authentication error:', error);
        this.isLoading.set(false);
        return this.handleAuthError(error);
      }),
      map(() => true)
    );
  }

  /**
   * FIX — CORS resolution for OAuth2 popup flow.
   *
   * When the popup returns an access_token, Angular CANNOT call
   * googleapis.com/userinfo directly — CORS blocks it from localhost.
   *
   * This method sends the raw access token to YOUR backend.
   * The backend calls Google API server-to-server (no CORS restriction)
   * and returns the authenticated user session.
   *
   * Backend endpoint expected: POST /AuthenticateGoogleAccessToken
   * Payload: { accessToken: string, provider: 'GOOGLE' }
   */
  authenticateWithGoogleAccessToken(accessToken: string): Observable<any> {
    this.isLoading.set(true);
    const apiuri = this.apiurl_auth + 'AuthenticateGoogleAccessToken';

    // SECURITY: Don't log access token details in production
    if (!environment.production) {
    }

    const payload = {
      accessToken,
      provider: 'GOOGLE'
    };

    return this.http.post(apiuri, payload, { observe: 'response' }).pipe(
      tap((response: any) => {
        if (!environment.production) {
        }
        this.processAuthResponse('', response);
      }),
      catchError((error) => {
        console.error('Google access token auth error:', error);
        this.isLoading.set(false);

        // If backend endpoint doesn't exist yet (404), fall back gracefully
        if (error.status === 404) {
          console.warn(
            'AuthenticateGoogleAccessToken endpoint not found on backend. ' +
            'Please add this endpoint to accept { accessToken, provider } ' +
            'and call googleapis.com/userinfo server-side.'
          );
        }

        return this.handleAuthError(error);
      }),
      map(() => true)
    );
  }

  /**
   * Alternative: Authenticate with pre-fetched Google user info.
   * Use this if your backend prefers structured data over raw token.
   * Wraps user info into GoogleUserData and calls authenticateWithGoogle().
   */
  authenticateWithGoogleUserInfo(userInfo: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
  }, accessToken: string): Observable<any> {
    const googleUserData: GoogleUserData = {
      id               : userInfo.sub,
      email            : userInfo.email,
      name             : userInfo.name,
      photoUrl         : userInfo.picture      || '',
      firstName        : userInfo.given_name   || '',
      lastName         : userInfo.family_name  || '',
      authToken        : accessToken,
      idToken          : '',
      authorizationCode: '',
      provider         : 'GOOGLE'
    };

    return this.authenticateWithGoogle(googleUserData);
  }

  // ── Post-auth processing ──────────────────────────────────────────

  /**
   * Process authentication response and set session
   * Migrated from login.component.ts -> SetEnvironmentVariables()
   */
  private processAuthResponse(username: string, response: any): void {
    this.isLoading.set(false);

    localStorage.setItem('CustomerIds', '');

    const logintype   = response.headers.get('logintype')   || '';
    const token       = response.headers.get('token')       || '';
    const empid       = response.headers.get('empid')       || username;
    const displayname = response.headers.get('displayname') || '';
    const role        = response.headers.get('role')        || '';
    const accessStr   = response.headers.get('access')      || '';

    let access: AppAccessControlsModel[] = [];
    try {
      if (accessStr) access = JSON.parse(accessStr);
    } catch (error) {
      console.error('Error parsing access control:', error);
    }

    const session: UserSession = {
      empid,
      displayname,
      token,
      logintype  : logintype as any,
      role,
      access,
      customerid : username
    };

    this.setUserSession(session);
    this.accessControl.accessControlRepository = access;

    const empIdForFetch = (logintype === 'gavs' || logintype === 'gslab') ? empid : username;
    this.fetchCustomerList(empIdForFetch, true);

    this.navigateAfterLogin();
  }

  /**
   * Fetch customer list and store in localStorage
   */
  private fetchCustomerList(empId: string, isToFindSLA: boolean): void {
    const headers = new HttpHeaders({
      'Accept' : 'application/json',
      'token'  : localStorage.getItem('token') || ''
    });

    this.http.get<any[]>(
      `${this.apiurl}/GetCustomerIds?EmpId=${empId}&istoFindSLA=${isToFindSLA}`,
      { headers }
    ).subscribe({
      next: (data) => {
        if (data?.length > 0) {
          localStorage.setItem('CustomerIds', JSON.stringify(data));
          const slaList = data.map((x: any) => ({
            customerId   : x.cusT_ID,
            customerName : x.cusT_NM,
            slaAvailable : x.iS_SLA_AVAILABLE
          }));
          localStorage.setItem('slaAvailableList', JSON.stringify(slaList));
        }
      },
      error: (error) => console.error('Error fetching customer list:', error)
    });
  }

  /**
   * Navigate user to appropriate page after login
   */
  private navigateAfterLogin(): void {
    const session = this.currentUser();
    if (!session) return;

    const navigateUrl = localStorage.getItem('navigateurl') || '';
    localStorage.setItem('navigateurl', '');

    if (navigateUrl?.trim() && !navigateUrl.includes('login')) {
      this.router.navigateByUrl(navigateUrl);
      return;
    }

    if (session.logintype === 'gavs' || session.logintype === 'gslab') {
      this.router.navigateByUrl('/newdashboard/custm');
    } else if (session.logintype === 'customer') {
      this.router.navigateByUrl('/newdashboard/cust/' + (session.customerid || ''));
    } else {
      this.router.navigateByUrl('/');
    }
  }

  // ── Error handling ────────────────────────────────────────────────

  private handleAuthError(error: any): Observable<never> {
    console.error('Authentication error:', error);

    let errorMessage: string;

    if (error.status === 404) {
      // Backend endpoint not found - provide developer guidance
      const endpoint = error.url || 'unknown';
      errorMessage = 
        `Backend API endpoint not found:\n${endpoint}\n\n` +
        `The backend .NET API may not be running or the endpoint is missing.\n\n` +
        `To fix this:\n` +
        `1. Start the backend API server (GAVS.AllocationSystem.WebApi)\n` +
        `2. Verify it's running on http://localhost:53505\n` +
        `3. For Google Sign-In, ensure these endpoints exist:\n` +
        `   - POST /api/Auth/AuthenticateGoogleToken\n` +
        `   - POST /api/Auth/AuthenticateGoogleAccessToken\n\n` +
        `Contact the backend team if these endpoints are missing.`;
      
      console.error('404 Error Details:', {
        url: error.url,
        status: error.status,
        message: error.message
      });
    } else if (error.status === 401) {
      errorMessage = 'Invalid username or password';
    } else if (error.status === 403) {
      errorMessage = 'Access denied';
    } else if (error.status === 0) {
      errorMessage = 
        'Unable to connect to backend server.\n\n' +
        'Please ensure the backend API is running on:\n' +
        'http://localhost:53505\n\n' +
        'Check that GAVS.AllocationSystem.WebApi is started.';
    } else {
      errorMessage = error.error?.message || 'Authentication failed';
    }

    // Show error using MatSnackBar
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
    config.panelClass = ['error-snackbar'];
    this.snackBar.open(errorMessage, '✕', config);
    
    return throwError(() => new Error(errorMessage));
  }

  // ── Public helpers ────────────────────────────────────────────────

  getUserInfo(): any {
    const empId    = localStorage.getItem('empid');
    if (!empId) return null;

    return {
      empId,
      displayName : localStorage.getItem('displayname'),
      email       : localStorage.getItem('emailid'),
      isGAVSUser  : ['gavs', 'gslab'].includes(localStorage.getItem('logintype') || ''),
      customerId  : localStorage.getItem('customerid')
    };
  }

  validateLogin(): boolean {
    const empid = localStorage.getItem('empid');
    const token = localStorage.getItem('token');

    if (!empid || !token) {
      this.showLoginRequiredPopup();
      return false;
    }
    return true;
  }

  private showLoginRequiredPopup(): void {
    const dialogConfig             = new MatDialogConfig();
    dialogConfig.data              = {
      Message     : 'Please login to continue',
      title       : 'Login Required',
      icon        : 'login',
      confirmText : 'OK'
    };
    dialogConfig.hasBackdrop       = true;
    dialogConfig.disableClose      = true;
    dialogConfig.scrollStrategy    = new NoopScrollStrategy();
    dialogConfig.panelClass        = 'warning-popup-dialog';
    dialogConfig.backdropClass     = 'warning-popup-backdrop';

    this.dialog.open(WarningPopupComponent, dialogConfig)
      .afterClosed()
      .subscribe(() => this.router.navigateByUrl('/login'));
  }

  logout(): void {
    this.clearUserSession();
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    // SECURITY: Don't log token length in production
    if (!environment.production) {
    }
    return token;
  }

  getEmpId(): string | null {
    const empid = localStorage.getItem('empid');
    // SECURITY: Don't log empid in production
    if (!environment.production) {
    }
    return empid;
  }

  getDisplayName(): string | null {
    return localStorage.getItem('displayname');
  }

  getRole(): string | null {
    return this.currentUser()?.role || localStorage.getItem('role');
  }

  getAccessList(): AppAccessControlsModel[] {
    return this.currentUser()?.access || this.getAccessListFromStorage();
  }

  hasAccess(resourceId: number, accessType: 'view' | 'create' | 'edit' | 'delete'): boolean {
    const access = this.getAccessList().find(a => a.RESOURCE_ID === resourceId);
    if (!access) return false;

    switch (accessType) {
      case 'view'  : return access.VIEW_ACCESS;
      case 'create': return access.CREATE_ACCESS;
      case 'edit'  : return access.EDIT_ACCESS;
      case 'delete': return access.DELETE_ACCESS;
      default      : return false;
    }
  }

  saveNavigateUrl(url: string): void {
    localStorage.setItem('navigateurl', url);
  }
}
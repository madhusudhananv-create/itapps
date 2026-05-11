/**
 * Login Component — Angular 19
 *
 * FIXES IN THIS VERSION:
 * 1. CORS ERROR FIX — removed direct call to googleapis.com/userinfo
 *    Access token is now sent directly to backend (AuthService).
 *    Backend calls Google API server-to-server — no CORS issue.
 *
 * 2. FedCM COMPLIANCE — removed ALL deprecated notification callback
 *    methods: isNotDisplayed(), isSkippedMoment(), isDismissedMoment()
 *    getNotDisplayedReason(), getSkippedReason(), getDismissedReason()
 *
 * 3. STRATEGY:
 *    - Non-production (localhost): OAuth2 popup directly, no One Tap
 *    - Production: One Tap (FedCM-native) with popup fallback after 8s
 *
 * 4. DASHBOARD LOADING FIX:
 *    authenticationSucceeded flag + keepLoading=true prevents timeout
 *    from resetting loading state during route navigation.
 *
 * 5. NG02952 FIX: width=140 height=30 in HTML (ratio 4.67 ≈ intrinsic 4.65)
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { AuthService, GoogleUserData } from '../../../core/services/auth.service';
import { AppsService } from '../../../core/services/apps.service';
import { Guid } from '../../../shared/guid';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private router         = inject(Router);
  private authService    = inject(AuthService);
  private appsService    = inject(AppsService);
  private activatedRoute = inject(ActivatedRoute);

  isLoading   = this.authService.isLoading;
  email       = '';
  password    = '';
  gslab       = '';
  companyName = environment.company_name;

  private _isVisible = 'Login';

  // ── Sign-In state ─────────────────────────────────────────────────
  private googleSignInInitialized = false;

  /**
   * Set true the moment backend auth succeeds.
   * Prevents timeout from resetting loading state
   * while Angular Router navigates to /dashboard.
   */
  private authenticationSucceeded = false;

  /** Cleared immediately when credential/token arrives */
  private signInTimeoutRef: ReturnType<typeof setTimeout> | null = null;

  // ── Cross-tab duplicate prevention ───────────────────────────────
  private readonly CHANNEL_NAME           = 'google_signin_channel';
  private readonly GOOGLE_SIGNIN_LOCK_KEY = 'google_signin_lock';
  private readonly LOCK_TIMEOUT_MS        = 5000;
  private broadcastChannel!: BroadcastChannel;
  private isLockOwner = false;

  // ── Azure AD Office 365 URL ───────────────────────────────────────
  private officeurl: string = environment.officesite + environment.tenantid + '/oauth2/authorize?' +
    'client_id=' + environment.clientid + '&response_type=id_token' + '&redirect_uri=' + environment.redirect +
    '&response_mode=fragment&scope=openid&state=12345&nonce=' + Guid.newGuid();

  // ── Lifecycle ─────────────────────────────────────────────────────

  ngOnInit(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'GOOGLE_SIGNIN_STARTED' && this.googleSignInInitialized) {
          console.warn('Google Sign-In detected in another tab — cancelling here.');
          this.cancelOneTap();
        }
        if (event.data?.type === 'GOOGLE_SIGNIN_COMPLETE') {
          window.location.reload();
        }
      };
    }

    this.activatedRoute.paramMap.subscribe(params => {
      this.gslab = params.get('gslab') || '';
      if (this.gslab === 'gslab') {
        alert('Please click on GSLab google icon to login.');
      }
    });

    this.cleanupStaleLock();
  }

  ngOnDestroy(): void {
    this.clearSignInTimeout();
    this.cancelOneTap();
    this.releaseLock();
    this.googleSignInInitialized = false;
    this.broadcastChannel?.close();
  }

  // ── Lock helpers ──────────────────────────────────────────────────

  private acquireLock(): boolean {
    try {
      const now      = Date.now();
      const lockData = sessionStorage.getItem(this.GOOGLE_SIGNIN_LOCK_KEY);
      if (lockData && now - parseInt(lockData, 10) < this.LOCK_TIMEOUT_MS) return false;
      sessionStorage.setItem(this.GOOGLE_SIGNIN_LOCK_KEY, now.toString());
      this.isLockOwner = true;
      return true;
    } catch { return true; }
  }

  private releaseLock(): void {
    if (!this.isLockOwner) return;
    try {
      sessionStorage.removeItem(this.GOOGLE_SIGNIN_LOCK_KEY);
      this.isLockOwner = false;
    } catch { /* silent */ }
  }

  private cleanupStaleLock(): void {
    try {
      const lockData = sessionStorage.getItem(this.GOOGLE_SIGNIN_LOCK_KEY);
      if (lockData && Date.now() - parseInt(lockData, 10) >= this.LOCK_TIMEOUT_MS) {
        this.releaseLock();
      }
    } catch { /* silent */ }
  }

  private cancelOneTap(): void {
    try { google?.accounts?.id?.cancel(); } catch { /* silent */ }
  }

  private clearSignInTimeout(): void {
    if (this.signInTimeoutRef !== null) {
      clearTimeout(this.signInTimeoutRef);
      this.signInTimeoutRef = null;
    }
  }

  // ── UI helpers ────────────────────────────────────────────────────

  getUserNameType(loginType: string): string {
    return loginType === 'GAVSLogin' ? 'Username' : 'Email Id';
  }

  isTabVisible(selected: string): boolean { return selected === this._isVisible; }
  toggle(selected: string): void          { this._isVisible = selected; }

  // ── Customer login form ───────────────────────────────────────────

  submitForm(isValid: boolean | null): void {
    if (!isValid) return;
    event?.preventDefault();

    if (!this.email?.trim())       { alert('Please enter the email id');     return; }
    if (!this.email.includes('@')) { alert('Please enter a valid email id'); return; }

    if (environment.production &&
        this.email.toLowerCase().includes('@' + environment.domain_name)) {
      alert(`${this.companyName} users, please sign-in through Google`);
      return;
    }

    if (environment.production && !this.password?.trim()) {
      alert('Please enter the password'); return;
    }

    this.authService.authenticateCustomer(this.email, this.password).subscribe({
      next : () => {},
      error: (err) => console.error('Login failed:', err)
    });
  }

  // ── Google Sign-In entry points — COMMENTED OUT FOR AZURE AD MIGRATION ───────────────────────────────────
  /*
  gavsSocialSignIn(): void {
    this.isLoading.set(true);
    if (this.gslab === 'gslab') {
      window.open(this.router.serializeUrl(this.router.createUrlTree(['/login'])), '_blank');
      this.isLoading.set(false);
    } else {
      this.triggerGoogleSignIn(environment.gavsGoogleClientId);
    }
  }

  gsLabSocialSignIn(): void {
    this.isLoading.set(true);
    if (this.gslab !== 'gslab') {
      window.open(this.router.serializeUrl(this.router.createUrlTree(['/login/gslab'])), '_blank');
      this.isLoading.set(false);
    } else {
      this.triggerGoogleSignIn(environment.googleClientId);
    }
  }
  */

  // ── Core Sign-In orchestrator — COMMENTED OUT FOR AZURE AD ─────────────────────────────────────
  /*
  private triggerGoogleSignIn(clientId: string): void {
    if (typeof google === 'undefined' || !google?.accounts) {
      alert('Google Sign-In is not available. Please refresh the page and try again.');
      this.isLoading.set(false);
      return;
    }

    if (this.googleSignInInitialized) {
      return;
    }

    if (!this.acquireLock()) {
      alert('Google Sign-In is already in progress in another tab. Please close duplicate tabs and try again.');
      this.isLoading.set(false);
      return;
    }

    this.cancelOneTap();
    this.googleSignInInitialized = true;
    this.authenticationSucceeded = false;

    this.broadcastChannel?.postMessage({ type: 'GOOGLE_SIGNIN_STARTED' });


    // STRATEGY:
    // - localhost / dev → OAuth2 popup directly (One Tap unreliable on localhost)
    // - production      → One Tap (FedCM-native) with 8s popup fallback
    if (!environment.production) {
      this.openOAuthPopup(clientId);
    } else {
      this.openOneTap(clientId);
    }
  }

  // ── One Tap — production only, FedCM-native ───────────────────────

  private openOneTap(clientId: string): void {
    try {
      google.accounts.id.initialize({
        client_id            : clientId,
        use_fedcm_for_prompt : true,  // FedCM opt-in — future-proof
        auto_select          : false,
        cancel_on_tap_outside: true,
        callback             : (response: any) => {
          this.clearSignInTimeout();

          if (response.credential) {
            this.handleCredentialResponse(response.credential);
          } else {
            console.warn('One Tap returned no credential — falling back to popup');
            this.googleSignInInitialized = false;
            this.releaseLock();
            this.openOAuthPopup(clientId);
          }
        }
      });

      // NO notification callback — all deprecated FedCM methods removed
      google.accounts.id.prompt();

      // Safety: if One Tap silent for 8s, open popup
      this.signInTimeoutRef = setTimeout(() => {
        if (this.authenticationSucceeded) return;
        this.cancelOneTap();
        this.googleSignInInitialized = false;
        this.releaseLock();
        this.openOAuthPopup(clientId);
      }, 8000);

    } catch (error: any) {
      console.error('One Tap init error:', error);
      this.googleSignInInitialized = false;
      this.releaseLock();
      this.openOAuthPopup(clientId);
    }
  }

  // ── OAuth2 Popup ──────────────────────────────────────────────────

  // OAuth2 Popup using initCodeClient.
  //
  // WHY initCodeClient instead of initTokenClient:
  // - initTokenClient returns an access_token
  //   → requires a call to googleapis.com/userinfo → CORS blocked on localhost
  //
  // - initCodeClient with ux_mode:'popup' returns a credential (ID token JWT)
  //   directly in the popup callback response
  //   → decode JWT locally, zero HTTP calls, zero CORS issues ✅
  //
  // Works on localhost, incognito, and production without any backend changes.
  private openOAuthPopup(clientId: string): void {

    if (!google?.accounts?.oauth2) {
      alert('Google Sign-In is not available. Please refresh and try again.');
      this.resetSignInState();
      return;
    }

    if (!this.isLockOwner) {
      if (!this.acquireLock()) {
        alert('Google Sign-In is already in progress. Please try again.');
        this.isLoading.set(false);
        return;
      }
    }

    this.googleSignInInitialized = true;

    try {
      // Initialize with google.accounts.id for popup mode
      // This gives us an ID token (credential JWT) directly — no HTTP call needed
      google.accounts.id.initialize({
        client_id            : clientId,
        callback             : (response: any) => {
          this.clearSignInTimeout();

          if (response.credential) {
            // Decode JWT directly — no googleapis.com call needed ✅
            this.handleCredentialResponse(response.credential);
          } else {
            console.error('Popup returned no credential');
            alert('Google Sign-In failed. Please try again.');
            this.resetSignInState();
          }
        },
        use_fedcm_for_prompt : false, // disable FedCM for popup mode
        auto_select          : false,
        cancel_on_tap_outside: false,
      });

      // Render and click a hidden button to trigger popup
      // This is the standard way to show account picker via google.accounts.id
      const buttonDiv = document.createElement('div');
      buttonDiv.style.display = 'none';
      document.body.appendChild(buttonDiv);

      google.accounts.id.renderButton(buttonDiv, {
        type : 'standard',
        theme: 'outline',
        size : 'large'
      });

      // Auto-click the rendered button to open popup immediately
      const btn = buttonDiv.querySelector('div[role=button]') as HTMLElement;
      if (btn) {
        btn.click();
      } else {
        // Fallback: show One Tap prompt without deprecated notification callback
        google.accounts.id.prompt();
      }

      // Safety timeout
      this.signInTimeoutRef = setTimeout(() => {
        if (this.authenticationSucceeded) return;
        document.body.removeChild(buttonDiv);
        this.resetSignInState();
      }, 120000); // 2 min — generous for user to complete account selection

    } catch (error: any) {
      console.error('OAuth2 popup init error:', error);
      alert('Failed to open Google Sign-In. Please try again or contact support.');
      this.resetSignInState();
    }
  }

  // ── One Tap credential (ID token) handler ─────────────────────────

  private handleCredentialResponse(credential: string): void {
    try {
      const base64Url   = credential.split('.')[1];
      const base64      = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      const u = JSON.parse(jsonPayload);

      this.authenticateWithBackend({
        id               : u.sub,
        email            : u.email,
        name             : u.name,
        photoUrl         : u.picture     || '',
        firstName        : u.given_name  || '',
        lastName         : u.family_name || '',
        authToken        : credential,
        idToken          : credential,
        authorizationCode: '',
        provider         : 'GOOGLE'
      });
    } catch (error) {
      console.error('Error decoding ID token:', error);
      alert('Failed to process Google Sign-In response. Please try again.');
      this.resetSignInState();
    }
  }

  // ── Single backend auth call ──────────────────────────────────────

  private authenticateWithBackend(googleUserData: GoogleUserData): void {
    this.authService.authenticateWithGoogle(googleUserData).subscribe({
      next: () => {
        // Set flag BEFORE resetSignInState so timeout guard works correctly
        this.authenticationSucceeded = true;
        this.broadcastChannel?.postMessage({ type: 'GOOGLE_SIGNIN_COMPLETE' });
        // keepLoading=true — spinner stays alive during /dashboard navigation
        this.resetSignInState(true);
      },
      error: (err) => {
        console.error('Backend authentication failed:', err);
        alert('Authentication failed. Please contact support.');
        this.resetSignInState();
      }
    });
  }

  // Reset sign-in state.
  // @param keepLoading true = leave spinner running during dashboard navigation
  private resetSignInState(keepLoading = false): void {
    this.clearSignInTimeout();
    if (!keepLoading) this.isLoading.set(false);
    this.googleSignInInitialized = false;
    this.releaseLock();
  }
  */

  // ── Office 365 / Azure AD Login ────────────────────────────────────────────────────

  o365OnClick(): void {
    const promise = new Promise<string>((resolve, reject) => {
      localStorage.setItem('loginRequested', '1');
      resolve('hello');
    });

    promise.then(x => {
      window.location.href = this.officeurl;
    });
  }

  /* @deprecated - Google Sign-In helper
  private initializeGoogleSignIn(clientId: string): void {
    this.triggerGoogleSignIn(clientId);
  }
  */
}
import { Injectable, signal } from '@angular/core';

/**
 * ERM is opened from the CSM shell (same origin, via window.open), which
 * already authenticated the user via CSM's own SSO/login. Rather than show
 * a second, unrelated login screen, treat the presence of the CSM session's
 * shared localStorage keys (set by the shell app on login) as already
 * authenticated - mirroring how the other integrated micro-apps
 * (IT-Ops-Maturity-Dashboard, CSAT-Analysis-Dashboard) skip their own login.
 */
function readCsmSession(): { token: string; empId: string; displayName: string } | null {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem('token') || '';
  const empId = window.localStorage.getItem('empid') || '';
  if (!token || !empId) return null;
  const displayName = window.localStorage.getItem('displayname') || empId;
  return { token, empId, displayName };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly csmSession = readCsmSession();

  /** True immediately if a CSM SSO session is present; otherwise falls back to the demo login flow. */
  readonly authenticated = signal(!!this.csmSession);

  /** User id from the CSM session (or the last successful demo login) - used e.g. as default risk owner on Risk log. */
  readonly currentUserId = signal(this.csmSession?.displayName ?? '');

  login(userId: string, password: string): boolean {
    const ok = userId.trim().length > 0 && password.trim().length > 0;
    this.authenticated.set(ok);
    if (ok) {
      this.currentUserId.set(userId.trim());
    } else {
      this.currentUserId.set('');
    }
    return ok;
  }

  logout(): void {
    this.authenticated.set(false);
    this.currentUserId.set('');
  }
}

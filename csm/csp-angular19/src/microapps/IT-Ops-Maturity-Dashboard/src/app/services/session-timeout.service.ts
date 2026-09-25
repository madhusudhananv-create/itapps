import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Subject, Subscription, fromEvent, merge, debounceTime, takeUntil, filter } from 'rxjs';

/**
 * Matches the CSM shell's own idle-timeout behavior (10 minutes of inactivity, see
 * csp-angular19/src/app/core/services/session-timeout.service.ts and every
 * environment.ts's sessionTimeoutSeconds) - without this, a tab left open on this
 * separate microapp never notices the shell's session has expired until the next API
 * call happens to 401 (see session-expired.interceptor.ts), which could be a long time
 * after the shell itself would already be showing its own "Session Expired" popup.
 */
const IDLE_TIMEOUT_SECONDS = 10 * 60;
const ACTIVITY_EVENTS = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly ngZone = inject(NgZone);

  /** True once the idle timeout has fired - SessionExpiredOverlayComponent shows on this. */
  readonly expired = signal(false);

  private idleTimerId: ReturnType<typeof setTimeout> | null = null;
  private destroy$ = new Subject<void>();
  private activitySubscription?: Subscription;
  private isActive = false;

  /** Starts the idle timer - call once, on app init, only when a session actually exists. */
  startMonitoring(): void {
    if (this.isActive || !localStorage.getItem('token')) return;
    this.isActive = true;
    this.ngZone.runOutsideAngular(() => {
      this.setupActivityListeners();
      this.startIdleTimer();
    });
  }

  stopMonitoring(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.clearIdleTimer();
    this.activitySubscription?.unsubscribe();
  }

  private setupActivityListeners(): void {
    this.activitySubscription?.unsubscribe();
    const activity$ = merge(...ACTIVITY_EVENTS.map((event) => fromEvent(document, event))).pipe(
      debounceTime(300),
      takeUntil(this.destroy$),
      filter(() => this.isActive),
    );
    this.activitySubscription = activity$.subscribe(() => {
      this.ngZone.run(() => this.startIdleTimer());
    });
  }

  private startIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimerId = setTimeout(() => {
      this.ngZone.run(() => this.onIdleTimeout());
    }, IDLE_TIMEOUT_SECONDS * 1000);
  }

  private onIdleTimeout(): void {
    if (!this.isActive) return;
    this.stopMonitoring();
    this.expired.set(true);
  }

  private clearIdleTimer(): void {
    if (this.idleTimerId) {
      clearTimeout(this.idleTimerId);
      this.idleTimerId = null;
    }
  }
}

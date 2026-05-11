/**
 * SessionTimeoutService - User Activity and Session Timeout Management
 * 
 * This service handles client-side session timeout based on user activity.
 * Complements the server-side token expiration handling in my-utility.ts
 * 
 * Features:
 * - Tracks user activity (mouse, keyboard, touch events)
 * - Automatically logs out after idle timeout
 * 
 * Configuration:
 * - IDLE_TIMEOUT_SECONDS: Time of inactivity before logout (default: 1800 = 30 minutes)
 */

import { Injectable, NgZone, inject, signal, OnDestroy } from '@angular/core';
import { Subject, Subscription, fromEvent, merge, debounceTime, takeUntil, filter } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { AuthService } from './auth.service';
import { WarningPopupComponent } from '../../shared/components/warning-popup/warning-popup.component';
import { environment } from '../../../environments/environment';

// Configuration - uses environment values with fallback defaults
export const SESSION_CONFIG = {
  // Time in seconds before logout (default: 30 minutes)
  IDLE_TIMEOUT_SECONDS: environment.sessionTimeoutSeconds || 30 * 60,
  // Events to track as user activity
  ACTIVITY_EVENTS: ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
};

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService implements OnDestroy {
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  // Signals for reactive state
  public isIdle = signal(false);
  public remainingTime = signal(SESSION_CONFIG.IDLE_TIMEOUT_SECONDS);

  // Internal timers and subjects
  private idleTimerId: any = null;
  private destroy$ = new Subject<void>();
  private activitySubscription?: Subscription;

  // Track if service is active (user is logged in)
  private isActive = false;
  // Track last activity timestamp
  private lastActivityTime: number = Date.now();
  // Flag to prevent multiple logout calls
  private isLoggingOut = false;

  constructor() {
  }

  /**
   * Start monitoring user activity for session timeout
   * Should be called when user logs in
   */
  public startMonitoring(): void {
    // Only start if user is authenticated
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.isLoggingOut = false;
    this.lastActivityTime = Date.now();

    // Set up activity listeners outside Angular zone for performance
    this.ngZone.runOutsideAngular(() => {
      this.setupActivityListeners();
      this.startIdleTimer();
    });
  }

  /**
   * Stop monitoring (on logout or navigation to public routes)
   */
  public stopMonitoring(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.clearIdleTimer();
    this.activitySubscription?.unsubscribe();
  }

  /**
   * Reset idle timer on user activity
   */
  public resetIdleTimer(): void {
    if (!this.isActive) return;

    this.lastActivityTime = Date.now();
    this.isIdle.set(false);
    this.remainingTime.set(SESSION_CONFIG.IDLE_TIMEOUT_SECONDS);

    // Restart the idle timer
    this.ngZone.runOutsideAngular(() => {
      this.startIdleTimer();
    });
  }

  /**
   * Force logout (when timeout expires)
   */
  public forceLogout(reason: string = 'Session timeout'): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    
    this.stopMonitoring();

    // Show styled popup and logout
    this.ngZone.run(() => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        Message: 'Session Expired. Please login again.',
        title: 'Session Expired',
        icon: 'timer_off',
        confirmText: 'OK'
      };
      dialogConfig.hasBackdrop = true;
      dialogConfig.disableClose = true;
      dialogConfig.scrollStrategy = new NoopScrollStrategy();
      dialogConfig.panelClass = 'warning-popup-dialog';
      dialogConfig.backdropClass = 'warning-popup-backdrop';
      
      const dialogRef = this.dialog.open(WarningPopupComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(() => {
        this.authService.logout();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopMonitoring();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Setup listeners for user activity events
   */
  private setupActivityListeners(): void {
    this.activitySubscription?.unsubscribe();

    // Create observable from activity events
    const activityEvents$ = merge(
      ...SESSION_CONFIG.ACTIVITY_EVENTS.map(event => 
        fromEvent(document, event)
      )
    ).pipe(
      debounceTime(300), // Debounce to avoid excessive resets
      takeUntil(this.destroy$),
      filter(() => this.isActive && !this.isLoggingOut)
    );

    this.activitySubscription = activityEvents$.subscribe(() => {
      this.ngZone.run(() => {
        this.onUserActivity();
      });
    });
  }

  /**
   * Handle user activity
   */
  private onUserActivity(): void {
    if (this.isLoggingOut) return;
    
    this.lastActivityTime = Date.now();
    this.isIdle.set(false);
    this.remainingTime.set(SESSION_CONFIG.IDLE_TIMEOUT_SECONDS);
    this.startIdleTimer();
  }

  /**
   * Start the idle timer
   */
  private startIdleTimer(): void {
    this.clearIdleTimer();

    // Calculate timeout in milliseconds
    const timeoutMs = SESSION_CONFIG.IDLE_TIMEOUT_SECONDS * 1000;

    this.idleTimerId = setTimeout(() => {
      this.ngZone.run(() => {
        this.onIdleTimeout();
      });
    }, timeoutMs);
  }

  /**
   * Called when idle timeout is reached
   */
  private onIdleTimeout(): void {
    if (!this.isActive || this.isLoggingOut) return;

    this.isIdle.set(true);
    this.forceLogout('Session timeout - idle');
  }

  /**
   * Clear idle timer
   */
  private clearIdleTimer(): void {
    if (this.idleTimerId) {
      clearTimeout(this.idleTimerId);
      this.idleTimerId = null;
    }
  }
}

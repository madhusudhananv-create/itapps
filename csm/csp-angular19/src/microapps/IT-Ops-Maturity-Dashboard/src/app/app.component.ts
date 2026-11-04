import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { SessionExpiredOverlayComponent } from './components/session-expired-overlay/session-expired-overlay.component';
import { SessionTimeoutService } from './services/session-timeout.service';
import { ItOpsMaturityApiService } from './services/itops-maturity-api.service';

const LAST_VISIT_RECORDED_KEY = 'itops_last_visit_recorded_date';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavMenuComponent, ToastComponent, ConfirmDialogComponent, SessionExpiredOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'IT-Ops-Maturity-Dashboard';

  constructor(
    private sessionTimeout: SessionTimeoutService,
    private maturityApi: ItOpsMaturityApiService,
  ) {}

  ngOnInit(): void {
    // Matches the CSM shell's own idle-timeout - see session-timeout.service.ts. A no-op
    // when there's no token in localStorage yet (public/unauthenticated state).
    this.sessionTimeout.startMonitoring();
    this.recordDailyVisitOnce();
  }

  /** Daily-active-user log (see itops-maturity-api.service.ts's recordVisit) - fires at
   * most once per calendar day per browser via a localStorage date-stamp, so navigating
   * around the app all day doesn't spam the backend with redundant (already-idempotent)
   * writes. Skipped entirely with no token/empId yet - nothing to attribute the visit to. */
  private recordDailyVisitOnce(): void {
    if (!localStorage.getItem('token') || !localStorage.getItem('empid')) return;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(LAST_VISIT_RECORDED_KEY) === today) return;
    this.maturityApi.recordVisit().subscribe({
      next: () => localStorage.setItem(LAST_VISIT_RECORDED_KEY, today),
      // Swallow - a failed usage-log call must never affect the app; try again next load.
      error: () => {},
    });
  }
}

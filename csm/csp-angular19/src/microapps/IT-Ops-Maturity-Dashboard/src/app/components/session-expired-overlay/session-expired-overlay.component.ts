import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionTimeoutService } from '../../services/session-timeout.service';

/**
 * Mounted once in AppComponent - shows once SessionTimeoutService's idle timer fires
 * (10 minutes of inactivity, matching the CSM shell's own timeout). Deliberately has no
 * backdrop-dismiss and only one button, mirroring the shell's "Session Expired. Please
 * login again." popup (disableClose: true, OK-only) rather than reusing the app's
 * general-purpose ConfirmDialogComponent, which always offers a Cancel button.
 */
@Component({
  selector: 'app-session-expired-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-expired-overlay.component.html',
  styleUrl: './session-expired-overlay.component.scss',
})
export class SessionExpiredOverlayComponent {
  constructor(private sessionTimeout: SessionTimeoutService) {}

  get expired(): boolean {
    return this.sessionTimeout.expired();
  }

  /** Same clear+redirect the 401 path already uses (session-expired.interceptor.ts), so both paths converge on identical behavior. */
  acknowledge(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}

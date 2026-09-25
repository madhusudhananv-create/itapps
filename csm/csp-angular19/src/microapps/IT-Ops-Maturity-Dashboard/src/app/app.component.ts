import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { SessionExpiredOverlayComponent } from './components/session-expired-overlay/session-expired-overlay.component';
import { SessionTimeoutService } from './services/session-timeout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavMenuComponent, ToastComponent, ConfirmDialogComponent, SessionExpiredOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'IT-Ops-Maturity-Dashboard';

  constructor(private sessionTimeout: SessionTimeoutService) {}

  ngOnInit(): void {
    // Matches the CSM shell's own idle-timeout - see session-timeout.service.ts. A no-op
    // when there's no token in localStorage yet (public/unauthenticated state).
    this.sessionTimeout.startMonitoring();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { CurrentUser } from '../../models/maturity.model';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { ItOpsAdminSetupService } from '../../services/itops-admin-setup.service';
import { ItOpsMaturityApiService } from '../../services/itops-maturity-api.service';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent implements OnInit {
  currentUser?: CurrentUser;

  /**
   * Whether to show the Admin Setup link at all. Someone who is only an
   * assessor/reviewer/assessee holds no ITOPS_ROLE_ASSIGNMENT, so the link is
   * removed from the DOM entirely rather than disabled - and every endpoint
   * behind it now 403s for them regardless (ITOperationMaturityAdminController).
   */
  canSeeAdminSetup = false;

  /**
   * Whether to show the Dashboard link at all. The account/project-wide
   * Dashboard is a DB-granted role (ITOPS_ROLE_DASHBOARD_VIEWER, or ITOps
   * Superuser) - someone without it gets a 403-equivalent "access required"
   * page if they navigate there directly, but the nav item itself is removed
   * from the DOM rather than shown-then-blocked, so who can even SEE the tab
   * is governed by the same DB grant as who can use it.
   */
  canSeeDashboard = false;

  constructor(
    private session: SessionService,
    private adminApi: ItOpsAdminSetupService,
    private maturityApi: ItOpsMaturityApiService,
  ) {}

  ngOnInit(): void {
    this.session.user$.subscribe((user) => (this.currentUser = user));
    this.adminApi.getMyAccess().subscribe((access) => (this.canSeeAdminSetup = access.isAdmin));

    const empId = localStorage.getItem('empid');
    if (empId) {
      this.maturityApi.getHasDashboardAccess(empId).subscribe((granted) => (this.canSeeDashboard = granted));
    }
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }

  /** Two-letter initials for the identity pill's avatar circle (e.g. "Veera Rao" -> "VR"). */
  get identityInitials(): string {
    const name = this.currentUser?.name?.trim();
    if (!name) return '';
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}

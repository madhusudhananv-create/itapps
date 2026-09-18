import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
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

  /**
   * True when this employee is a configured GDH (Business-Unit-level access,
   * see GetITOpsHasDashboardAccess) - they see the Dashboard/Reports for their
   * own BU(s) but have no personal assessor/reviewer/assessee assignments to
   * track, so the "My Assignments" tab is hidden for them.
   */
  isGdh = false;

  /**
   * Whether to show the "My Assignments" link at all - true only once this
   * employee is personally Assessor, Reviewer, or Assessee on at least one
   * assessment (i.e. GetITOpsMyAssignments actually returns something for
   * them). A GDH, a Dashboard/Report Viewer with no personal assignments, or
   * anyone else with no ITOps involvement has nothing to see there, so the
   * nav item is removed entirely rather than landing them on an empty page.
   */
  canSeeMyAssignments = false;

  /**
   * Whether the current URL should light up the "Assessments" nav link.
   * routerLinkActive alone can't do this - opening an assessment/review
   * navigates to a sibling top-level route (/assessment/:id, /review/:id),
   * not a child of /my-assignments, so the plain routerLinkActive prefix
   * match never fires there even though that page IS the Assessments flow.
   */
  assessmentsActive = false;

  constructor(
    private session: SessionService,
    private adminApi: ItOpsAdminSetupService,
    private maturityApi: ItOpsMaturityApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.session.user$.subscribe((user) => (this.currentUser = user));
    this.updateAssessmentsActive(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.updateAssessmentsActive((e as NavigationEnd).urlAfterRedirects);
    });
    this.adminApi.getMyAccess().subscribe((access) => (this.canSeeAdminSetup = access.isAdmin));

    const empId = localStorage.getItem('empid');
    if (empId) {
      // Reachable now for anyone with an assignment too (scoped to their own
      // projects), not just the full Dashboard Viewer/Superuser grant.
      this.maturityApi.getHasDashboardAccess(empId).subscribe((access) => {
        this.canSeeDashboard = access.hasAnyAssignment;
        this.isGdh = access.isGdh;
      });
      this.maturityApi.getMyAssignments(empId).subscribe({
        next: (rows) => (this.canSeeMyAssignments = (rows ?? []).length > 0),
        error: () => (this.canSeeMyAssignments = false),
      });
    }
  }

  private updateAssessmentsActive(url: string): void {
    this.assessmentsActive = url.startsWith('/my-assignments') || url.startsWith('/assessment/') || url.startsWith('/review/');
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

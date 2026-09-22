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
   * Whether to show the Dashboard/Assessments/Reports links at all - the
   * CSM-standard APP_CONTROLS/APP_ACCESS_CONTROLS mechanism, same as every
   * other CSM tab: the shell already fetches the caller's full access-control
   * rows once at login and caches them in localStorage['access'] (matched
   * against localStorage['role'], the CSM_TITLE_ID), and
   * csp-angular19/src/app/shared/access-control.ts's IsAllowed() is how the
   * shell itself checks a RESOURCE_ID client-side from that cache - no
   * backend round trip per check. This microapp can't import that shell
   * class directly (separate Angular project/build), so hasTabViewAccess()
   * below replicates just the role-based VIEW_ACCESS branch of it, matched
   * against RESOURCE_ID 834/Dashboard, 835/Assessments, 836/Reports (see
   * ITOperationMaturity_V2_28_TabAppControls.sql). This only decides whether
   * the tab RENDERS - what data it shows once open is unchanged, still
   * governed by Superuser/Assessor/Assessee/Reviewer/GDH/project-allocation
   * (see getHasDashboardAccess/getHasReportAccess/getMyAssignments below).
   */
  canSeeDashboard = false;
  canSeeReports = false;

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

    this.canSeeDashboard = this.hasTabViewAccess(834);
    this.canSeeMyAssignments = this.hasTabViewAccess(835);
    this.canSeeReports = this.hasTabViewAccess(836);

    const empId = localStorage.getItem('empid');
    if (empId) {
      // isGdh still drives the Assessments-link suppression below (GDHs get
      // BU-level Dashboard/Reports but have no personal assignments to track) -
      // this is data-layer nuance, not tab rendering, so it's kept as-is.
      this.maturityApi.getHasDashboardAccess(empId).subscribe((access) => {
        this.isGdh = access.isGdh;
      });
    }
  }

  /**
   * Local re-implementation of the CSM shell's AccessControl.IsAllowed()
   * "pure role-based access" branch (csp-angular19/src/app/shared/access-control.ts) -
   * this microapp is a separate Angular project and can't import that class
   * directly. Reads the same localStorage['access']/['role'] the shell caches
   * at login, so there's no backend round trip per check.
   */
  private hasTabViewAccess(resourceId: number): boolean {
    try {
      const raw = localStorage.getItem('access');
      if (!raw) return false;
      const rows: any[] = JSON.parse(raw);
      const roleId = parseInt(localStorage.getItem('role') || '0', 10);
      return rows.some(
        (r) =>
          r.RESOURCE_ID === resourceId &&
          r.ACCESS_LEVEL === 1 &&
          r.ROLE_ID === roleId &&
          r.VIEW_ACCESS === true &&
          r.ISACTIVE !== false,
      );
    } catch {
      return false;
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

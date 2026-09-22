import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ItOpsMaturityApiService, ItOpsDomainTrackerRow, ItOpsTopRiskRow, ItOpsMyAssignmentRow } from '../../services/itops-maturity-api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { SearchableSelectComponent, SearchableSelectOption } from '../../components/searchable-select/searchable-select.component';
import { SessionService } from '../../services/session.service';
import { AccountService } from '../../services/account.service';
import { BusinessUnitService } from '../../services/business-unit.service';
import { IdentityService } from '../../services/identity.service';
import { DomainSummary, EnterpriseSummary, TopRisk, CurrentUser, DomainStatus } from '../../models/maturity.model';
import { CustomerModel } from '../../models/account.model';
import { statusPillClass } from '../../utils/status.util';
import { setGdhEmailsByBusinessUnit } from '../../utils/bu-head-map.util';
import { maturityLevelLabel } from '../../utils/rubric.util';

/** Maps the backend's ITOPS_ASSESSMENT.STATUS values onto this app's DomainStatus labels. */
const BACKEND_STATUS_MAP: Record<string, DomainStatus> = {
  NotStarted: 'Not Started',
  Draft: 'Draft',
  PendingReview: 'Pending Review',
  Approved: 'Approved',
  ReturnedForRevision: 'In Progress',
  Suspended: 'Draft',
  Closed: 'Approved',
};

function toDomainSummary(row: ItOpsDomainTrackerRow): DomainSummary {
  return {
    id: row.domainCode,
    name: row.domainName,
    coeSpoc: row.coeSpocName ?? '',
    coeSpocEmpId: row.coeSpocEmpId,
    reviewer: row.reviewerName ?? '',
    reviewerEmpId: row.reviewerEmpId,
    status: BACKEND_STATUS_MAP[row.status] ?? 'Not Started',
    averageScore: row.averageScore,
    maturityPercent: row.maturityPercent,
    maturityLevel: row.maturityLevel,
    paramCount: row.paramCount,
    applicableParamCount: row.applicableParamCount,
    sumScores: row.sumScores,
    maxPossible: row.maxPossible,
    accountId: row.accountId ?? undefined,
    accountName: row.accountName ?? undefined,
    allFindingsResolved: row.allFindingsResolved ?? undefined,
  };
}

/** Maturity band label from a 0-5 score, matching the % scale used elsewhere (score/5*100). */
function maturityBandLabel(score: number): string {
  if (score >= 5) return 'Optimized';
  if (score >= 4) return 'Well Managed';
  if (score >= 3) return 'Foundation Established';
  if (score >= 2) return 'Needs Work';
  return 'Critical Gap';
}

function toTopRisk(row: ItOpsTopRiskRow): TopRisk {
  const score = row.currentScore ?? 0;
  return {
    domain: row.domainName,
    category: row.category,
    parameter: row.parameterName,
    currentScore: score,
    gap: row.gap,
    isNotScored: row.isNotScored,
    accountId: row.accountId ?? undefined,
    accountName: row.accountName ?? undefined,
    recommendation: row.isNotScored ? 'Not Scored' : maturityBandLabel(score),
  };
}

function computeEnterpriseSummaryFromRows(summaries: DomainSummary[]): EnterpriseSummary {
  // The Overall Estate row's parameter/score/max-possible columns are a
  // straight sum across every domain shown in the tracker above it - they're
  // structural counts, not an average, so unscored ("Not Started"/"In
  // Progress") domains must still contribute their param/max counts (their
  // sumScores is simply 0 until scored). Only the average-score/maturity-%
  // figures exclude those domains, since folding in their all-zero scores
  // would wrongly drag the enterprise average down toward 0.
  const totalParamCount = summaries.reduce((sum, s) => sum + s.paramCount, 0);
  const totalApplicableParamCount = summaries.reduce((sum, s) => sum + s.applicableParamCount, 0);
  const totalSumScores = summaries.reduce((sum, s) => sum + s.sumScores, 0);
  const totalMaxPossible = summaries.reduce((sum, s) => sum + s.maxPossible, 0);

  // Avg = Sum of Scores / No. of Applicable Parameters, same formula as every
  // per-domain row (see GetITOpsDomainTracker's avg) - a domain that's still
  // Not Started/In Progress naturally contributes 0 to both totalSumScores
  // and totalApplicableParamCount, so it can't skew this average without
  // needing a separate "scored domains only" filter.
  const overallAverageScore = totalApplicableParamCount ? Math.round((totalSumScores / totalApplicableParamCount) * 100) / 100 : 0;
  // Maturity % = Sum of Scores / Max Score x 100 - off the raw totals, not
  // off the already-rounded Avg, so it doesn't compound Avg's own rounding.
  const overallMaturityPercent = totalMaxPossible ? Math.round((totalSumScores / totalMaxPossible) * 100) : 0;

  return {
    overallAverageScore,
    overallMaturityPercent,
    // Same "N - Label" bucketing used everywhere else (see maturityLevelLabel
    // in rubric.util.ts) - "Not Started" is kept as this KPI's own special
    // case for a genuinely-zero average (nothing scored yet), rather than
    // the formula's own "Not in scope" wording.
    overallMaturityLevel: overallAverageScore > 0 ? maturityLevelLabel(overallAverageScore) : 'Not Started',
    domainsCompleted: summaries.filter((s) => s.status === 'Approved').length,
    domainsInProgress: summaries.filter((s) => s.status === 'Draft' || s.status === 'In Progress' || s.status === 'Pending Review').length,
    domainsNotStarted: summaries.filter((s) => s.status === 'Not Started').length,
    totalParamCount,
    totalApplicableParamCount,
    totalSumScores,
    totalMaxPossible,
  };
}

type StatusLevel = 'good' | 'warning' | 'serious' | 'critical' | 'optimal';

// Each of the 5 maturity levels gets its own distinct color - Managed (4) and
// Optimized (5) used to both map to 'good' (identical green), making the two
// best levels indistinguishable at a glance; 'optimal' gives level 5 its own
// deeper tone while level 4 keeps the standard green.
const MATURITY_LEVEL_STATUS: Record<string, StatusLevel | 'muted'> = {
  '1 - Ad Hoc': 'critical',
  '2 - Developing': 'serious',
  '3 - Defined': 'warning',
  '4 - Managed': 'good',
  '5 - Optimized': 'optimal',
  'Not in scope': 'muted',
  'N/A': 'muted',
};

const PER_DOMAIN_RISK_LIMIT = 10;

interface RiskDomainTab {
  /** Unique match key: domain name alone normally, or domain+account when the same domain name exists on more than one account ("All accounts"). */
  key: string;
  /** What the tab button actually displays - the account name is appended only when needed to disambiguate. */
  label: string;
  count: number;
}

/** domain+account composite key so the SAME domain name on two different accounts never collides. */
function riskDomainKey(domainName: string, accountId?: string | null): string {
  return `${domainName}__${accountId ?? ''}`;
}

type RiskSortColumn = 'category' | 'currentScore' | 'gap';
type SortDirection = 'asc' | 'desc';

type AssignmentSortColumn = 'account' | 'project' | 'domain' | 'role' | 'cycle' | 'status';

/** Remembered across visits so a Reviewer who always lives on one tab/cycle doesn't have to re-pick it every time. */
const MY_ASSIGNMENTS_TAB_KEY = 'itops-my-assignments-tab';
const MY_ASSIGNMENTS_CYCLE_KEY = 'itops-my-assignments-cycle';

@Component({
  selector: 'app-maturity-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent, SearchableSelectComponent],
  templateUrl: './maturity-landing.component.html',
  styleUrl: './maturity-landing.component.scss',
})
export class MaturityLandingComponent implements OnInit, AfterViewInit {
  enterpriseSummary?: EnterpriseSummary;
  domainSummaries: DomainSummary[] = [];
  currentUser!: CurrentUser;

  domainTrackerSortColumn: 'name' | 'status' | 'maturityPercent' | 'averageScore' | null = null;
  domainTrackerSortDirection: 'asc' | 'desc' = 'asc';

  accounts: CustomerModel[] = [];
  selectedAccount: CustomerModel | null = null;
  accountsLoaded = false;

  // ---- Dashboard (Account -> Project drill-down, gated by role) ----
  /** True while GetITOpsHasDashboardAccess is in flight, so the gate/picker/access-denied states don't flash. */
  dashboardAccessLoading = true;
  /** Whether this employee holds the Dashboard Viewer role (or is an ITOps Superuser) - unrestricted, every account/project/domain. */
  dashboardAccessGranted = false;
  /** True when this employee has no full Dashboard grant, but IS assessor/reviewer/assessee on at least one assessment - the Dashboard is still reachable, just scoped down to their own assigned projects (see loadAccountsWithAssessments/loadProjectsForAccount/loadDashboardDomainData). */
  dashboardOwnScopeOnly = false;
  /** Non-empty when this employee is a GDH (not an explicit Dashboard Viewer/Superuser) - restricts the Business Unit picker to just these BU(s), see loadBusinessUnits(). */
  dashboardGdhBusinessUnits: string[] = [];
  /** Whichever of the two above is true - what the template actually gates rendering the Dashboard content on. */
  get dashboardVisible(): boolean {
    return this.dashboardAccessGranted || this.dashboardOwnScopeOnly;
  }
  /** Every assessment cycle, newest first - picking one narrows the account/project dropdowns below it. */
  dashboardCycles: { id: number; cycleLabel: string; status: string }[] = [];
  selectedCycle: { id: number; cycleLabel: string; status: string } | null = null;
  /** Every distinct Business Unit present on an active assessment in the selected cycle - '' means "All business units". Selecting one narrows accountsWithAssessments below it. */
  businessUnits: string[] = [];
  businessUnitFilter = '';
  /** Only accounts that actually have an IT Ops assessment created (in the selected cycle, if one is picked) - not every CSM customer. */
  accountsWithAssessments: { cusT_ID: string; cusT_NM: string }[] = [];
  /** Only the selected account's projects that have an IT Ops assessment created. */
  projectsForAccount: { projectId: string; projectName: string }[] = [];
  selectedProject: { projectId: string; projectName: string } | null = null;
  projectsLoading = false;
  dashboardDataLoading = false;
  /** Becomes true after the very first successful load - once we have data on screen, a
   * scope change (account/project/cycle) should refresh in place rather than hiding
   * everything behind a full-page spinner again, which read as much slower than it was. */
  dashboardHasLoadedOnce = false;
  private cachedMyEmail: string | null = null;

  riskDomainTabs: RiskDomainTab[] = [];
  activeRiskDomain?: string;
  visibleTopRisks: TopRisk[] = [];
  activeDomainRiskTotal = 0;
  riskSortColumn: RiskSortColumn | null = null;
  riskSortDirection: SortDirection = 'desc';
  tabScrollLeft = false;
  tabScrollRight = false;

  @ViewChild('tabScroll') tabScrollRef?: ElementRef<HTMLElement>;

  private allDomainSummaries: DomainSummary[] = [];
  private scopedTopRisks: TopRisk[] = [];

  accountBusinessUnit: string | null = null;

  // ---- "My Assignments" (default view for anyone actually assigned) ----
  /** True until GetITOpsMyAssignments settles, so neither view flashes first. */
  myAssignmentsLoading = true;
  myAssignments: ItOpsMyAssignmentRow[] = [];
  /**
   * 'assignments' is the flat "My Assessments"/"Needs Review" list, scoped to
   * this employee's own assignments. 'accounts' is the account/project-wide
   * Dashboard, gated behind the Dashboard Viewer role (dashboardAccessGranted)
   * and NOT scoped to the viewer's own assignments - it shows whatever
   * account+project is picked, regardless of who's on it.
   */
  viewMode: 'assignments' | 'accounts' = 'accounts';
  /** Which of the two "My Assignments" role tables is showing - someone who is only ever a Reviewer has no reason to land on an empty Assessments tab, so this defaults based on what they actually have (unless a prior visit's choice was remembered). */
  assignmentsTab: 'assessments' | 'reviews' | 'allocated' = (localStorage.getItem(MY_ASSIGNMENTS_TAB_KEY) as any) ?? 'assessments';
  /** Free-text filter over the current tab's rows - account/project/domain name. */
  assignmentSearch = '';
  /** 'all' or one of the raw backend statuses present in myAssignments - lets either tab be narrowed to just Approved, just Pending Review, etc. instead of a separate "Completed" tab. */
  statusFilter = 'all';
  assignmentSortColumn: AssignmentSortColumn | null = null;
  assignmentSortDirection: 'asc' | 'desc' = 'asc';
  assignmentsPage = 1;
  readonly assignmentsPageSize = 10;
  private _cycleFilter = localStorage.getItem(MY_ASSIGNMENTS_CYCLE_KEY) ?? 'all';
  // True the moment this employee (or a prior visit in this browser) has ever
  // explicitly picked a cycle here - once that's happened, the auto-default
  // below must never override it. Someone who's never touched this dropdown
  // yet gets steered onto the current cycle instead of "All cycles" - see
  // maybeApplyDefaultCycle(), applied the same way for every role (Assessor,
  // Reviewer, Assessee alike).
  private cycleFilterExplicit = localStorage.getItem(MY_ASSIGNMENTS_CYCLE_KEY) !== null;
  private cyclesLoadedForDefault = false;
  private assignmentsLoadedForDefault = false;

  /** 'all' or one of the cycle labels present in myAssignments - lets the table be narrowed to one cycle instead of always listing every cycle's rows together. Persisted across visits. */
  get cycleFilter(): string {
    return this._cycleFilter;
  }

  set cycleFilter(value: string) {
    this._cycleFilter = value;
    this.cycleFilterExplicit = true;
    localStorage.setItem(MY_ASSIGNMENTS_CYCLE_KEY, value);
    this.assignmentsPage = 1;
  }

  /**
   * Steers a first-time visitor onto the current (Open) cycle instead of
   * leaving them on "All cycles" - runs once both the cycle list and this
   * employee's assignments have loaded, since the default itself (the Open
   * cycle's label) has to actually appear in this employee's own
   * cycleOptions to be worth switching to. A no-op once the visitor has ever
   * explicitly chosen a cycle (see cycleFilterExplicit).
   */
  private maybeApplyDefaultCycle(): void {
    if (!this.cyclesLoadedForDefault || !this.assignmentsLoadedForDefault) return;
    if (this.cycleFilterExplicit) return;
    const openCycle = this.dashboardCycles.find((c) => c.status === 'Open');
    if (openCycle && this.cycleOptions.includes(openCycle.cycleLabel)) {
      this._cycleFilter = openCycle.cycleLabel;
    }
  }

  constructor(
    private api: ItOpsMaturityApiService,
    private session: SessionService,
    private accountService: AccountService,
    private businessUnitService: BusinessUnitService,
    private identityService: IdentityService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    // Dashboard ('/') and My Assignments ('/my-assignments') are now two
    // separate nav menu items routing to this same component - which view
    // opens is purely the route's doing, not an auto-redirect based on
    // whether this employee happens to have any assignments.
    const initialMode = this.route.snapshot.data['initialMode'];
    if (initialMode === 'assignments' || initialMode === 'accounts') this.viewMode = initialMode;
    this.loadMyAssignments();
    // checkDashboardAccess()'s own cycle load only runs on the Dashboard route
    // (viewMode === 'accounts') - My Assignments/Assessments needs the cycle
    // list too (for maybeApplyDefaultCycle's "current cycle" default), so
    // fetch it here unconditionally rather than only when Dashboard access
    // happens to also be checked.
    this.api
      .getCycleList()
      .pipe(catchError(() => of([])))
      .subscribe((cycles) => {
        if (!this.dashboardCycles.length) this.dashboardCycles = cycles;
        this.cyclesLoadedForDefault = true;
        this.maybeApplyDefaultCycle();
      });
    // DB-backed BU -> GDH email map (CONFIGURATION_EXT), fetched once and cached
    // in-memory for session.service.ts's resolveIdentity() to consult synchronously -
    // see setGdhEmailsByBusinessUnit/getGdhEmailsForBusinessUnit in bu-head-map.util.ts.
    this.api.getGdhEmailsByBusinessUnit().subscribe({
      next: (map) => setGdhEmailsByBusinessUnit(map),
      error: (err) => console.error('IT Ops Maturity Dashboard: failed to load GDH email map', err),
    });
    // session.user$ always has a value synchronously (defaults to NoAccess) -
    // keep currentUser in sync with it from the very first tick, so template
    // bindings like currentUser.role never see undefined while the
    // account-scoped role resolution below is still in flight (or fails).
    this.session.user$.subscribe((user) => (this.currentUser = user));

    // "My Assignments" still needs the full account list to resolve a row's
    // account (openAssignment) - the Dashboard's own account picker below
    // uses accountsWithAssessments instead, deliberately narrower.
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts = accounts;
      this.accountsLoaded = true;
    });

    if (this.viewMode === 'accounts') {
      this.checkDashboardAccess();
    }
  }

  /**
   * The account/project-wide Dashboard is locked behind the Dashboard Viewer
   * role (or ITOps Superuser) - unlike "My Assignments", it shows any
   * account/project's data regardless of the viewer's own assessor/reviewer
   * assignments, so it needs its own explicit access grant rather than
   * inheriting visibility from being personally assigned to something.
   */
  private checkDashboardAccess(): void {
    const empId = localStorage.getItem('empid');
    if (!empId) {
      this.dashboardAccessLoading = false;
      return;
    }
    this.api
      .getHasDashboardAccess(empId)
      .pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to check dashboard access', err);
          return of({ fullAccess: false, hasAnyAssignment: false, isGdh: false, gdhBusinessUnits: [] as string[] });
        }),
      )
      .subscribe((access) => {
        this.dashboardAccessGranted = access.fullAccess;
        this.dashboardOwnScopeOnly = !access.fullAccess && access.hasAnyAssignment;
        this.dashboardGdhBusinessUnits = access.gdhBusinessUnits ?? [];
        this.dashboardAccessLoading = false;
        if (!this.dashboardVisible) {
          // The nav bar already hides the Dashboard tab for anyone without full
          // access or an assignment, but the route itself is still directly
          // reachable (default landing route after login, a bookmark, typing
          // the URL) - land them on My Assignments instead of the blocked
          // "Access Required" card, which nobody in this state should ever see.
          this.router.navigate(['/my-assignments']);
          return;
        }

        const loadCyclesThenDashboard = () => {
          this.api
            .getCycleList()
            .pipe(
              catchError((err) => {
                console.error('IT Ops Maturity Dashboard: failed to load cycle list', err);
                return of([]);
              }),
            )
            .subscribe((cycles) => {
              this.dashboardCycles = cycles;
              // Default to the current cycle, not "All cycles" - a domain with
              // assessments in more than one cycle would otherwise have its scores
              // from every cycle merged into one misleading row (same class of bug
              // "All accounts" had before accounts got their own grouping key; cycles
              // aren't keyed that way, so leaving this on "All" stays broken). Prefer
              // the most recent still-Open cycle; fall back to the newest cycle
              // overall (list is already newest-first) if none are Open.
              this.selectedCycle = cycles.find((c) => c.status === 'Open') ?? cycles[0] ?? null;
              // The Dashboard always opens on one concrete Business Unit / Account /
              // Project - there is no "All ..." option any more (see the picker
              // template), so each level auto-selects its first available value and
              // hands off to the next one, same as the cycle picker just above.
              this.loadBusinessUnits(() =>
                this.loadAccountsWithAssessments(() =>
                  this.loadProjectsForAccount(this.selectedAccount?.cusT_ID ?? '', () => this.loadDashboardDomainData()),
                ),
              );
            });
        };

        if (this.dashboardOwnScopeOnly) {
          // Own-scope account/project options are derived from myAssignments
          // (below), so it needs to be loaded here first, rather than trusting
          // ngOnInit's separately-triggered loadMyAssignments() to have landed
          // by the time this runs.
          this.api
            .getMyAssignments(empId)
            .pipe(catchError(() => of([] as ItOpsMyAssignmentRow[])))
            .subscribe((rows) => {
              this.myAssignments = rows;
              loadCyclesThenDashboard();
            });
        } else {
          loadCyclesThenDashboard();
        }
      });
  }

  /** Distinct (custId, projectId) pairs this employee is personally assessor/reviewer/assessee on - the universe of "their own projects" for own-scope Dashboard access. */
  private get myAssignedProjectPairs(): { custId: string; custName: string; projectId: string; projectName: string }[] {
    const seen = new Map<string, { custId: string; custName: string; projectId: string; projectName: string }>();
    for (const row of this.myAssignments) {
      if (!row.custId || !row.projectId) continue;
      if (this.selectedCycle && row.cycleLabel !== this.selectedCycle.cycleLabel) continue;
      if (this.businessUnitFilter && row.businessUnit !== this.businessUnitFilter) continue;
      const key = `${row.custId}|${row.projectId}`;
      if (!seen.has(key)) {
        seen.set(key, {
          custId: row.custId,
          custName: row.accountName ?? row.custId,
          projectId: row.projectId,
          projectName: row.projectName ?? row.projectId,
        });
      }
    }
    return Array.from(seen.values());
  }

  /** Loads the Business Unit list for the selected cycle, then auto-selects the first one - there is no "All business units" option any more, so this level is never left blank while at least one BU exists. */
  private loadBusinessUnits(onDone?: () => void): void {
    // Own-scope: derived client-side from this employee's own assignments
    // (narrowed to the selected cycle, if any) rather than the org-wide
    // endpoint, which isn't scoped to any one employee.
    if (this.dashboardOwnScopeOnly) {
      const seen = new Set<string>();
      for (const row of this.myAssignments) {
        if (!row.businessUnit) continue;
        if (this.selectedCycle && row.cycleLabel !== this.selectedCycle.cycleLabel) continue;
        seen.add(row.businessUnit);
      }
      this.businessUnits = Array.from(seen).sort();
      this.businessUnitFilter = this.businessUnits[0] ?? '';
      onDone?.();
      return;
    }
    this.api
      .getBusinessUnits(this.selectedCycle?.id)
      .pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load business units', err);
          return of([]);
        }),
      )
      .subscribe((businessUnits) => {
        // A GDH (no explicit Dashboard Viewer/Superuser grant) only ever sees
        // their own configured Business Unit(s) - narrow the org-wide list
        // down to those before picking the first one, so they can never
        // switch into another BU's data via this dropdown.
        this.businessUnits = this.dashboardGdhBusinessUnits.length
          ? businessUnits.filter((bu) => this.dashboardGdhBusinessUnits.some((gdhBu) => gdhBu.toLowerCase() === bu.toLowerCase()))
          : businessUnits;
        this.businessUnitFilter = this.businessUnits[0] ?? '';
        onDone?.();
      });
  }

  private loadAccountsWithAssessments(onDone?: () => void): void {
    // Own-scope: the account picker only ever offers accounts this employee
    // actually has an assignment on - derived client-side from myAssignments,
    // not the org-wide endpoint (which would leak every other account's name
    // into the dropdown even though selecting one would show nothing).
    if (this.dashboardOwnScopeOnly) {
      const seen = new Map<string, string>();
      for (const p of this.myAssignedProjectPairs) seen.set(p.custId, p.custName);
      this.accountsWithAssessments = Array.from(seen, ([cusT_ID, cusT_NM]) => ({ cusT_ID, cusT_NM }));
      this.autoSelectAccount();
      onDone?.();
      return;
    }
    this.api
      .getAccountsWithAssessments(this.selectedCycle?.id, this.businessUnitFilter || undefined)
      .pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load accounts with assessments', err);
          return of([]);
        }),
      )
      .subscribe((accounts) => {
        this.accountsWithAssessments = accounts;
        this.autoSelectAccount();
        onDone?.();
      });
  }

  /** Sets selectedAccount (and AccountService's selection) to the first available account - there is no "All accounts" option any more. */
  private autoSelectAccount(): void {
    const first = this.accountsWithAssessments[0] ?? null;
    this.selectedAccount = first ? { cusT_ID: first.cusT_ID, cusT_NM: first.cusT_NM, industrY_TYPE: '', url: '' } : null;
    if (this.selectedAccount) this.accountService.selectAccount(this.selectedAccount);
  }

  get dashboardBusinessUnitOptions(): SearchableSelectOption[] {
    return this.businessUnits.map((bu) => ({ value: bu, label: bu }));
  }

  /** Business Unit dropdown changed. Re-narrows the account dropdown to this BU (within the selected cycle), then auto-selects an account/project within it, and reloads. */
  onDashboardBusinessUnitChange(businessUnit: string): void {
    this.businessUnitFilter = businessUnit;
    this.loadAccountsWithAssessments(() =>
      this.loadProjectsForAccount(this.selectedAccount?.cusT_ID ?? '', () => this.loadDashboardDomainData()),
    );
  }

  get selectedCycleValue(): string {
    return this.selectedCycle ? String(this.selectedCycle.id) : '';
  }

  get dashboardCycleOptions(): SearchableSelectOption[] {
    return this.dashboardCycles.map((c) => ({ value: String(c.id), label: c.cycleLabel }));
  }

  get dashboardAccountOptions(): SearchableSelectOption[] {
    return this.accountsWithAssessments.map((a) => ({ value: a.cusT_ID, label: a.cusT_NM }));
  }

  get dashboardProjectOptions(): SearchableSelectOption[] {
    return this.projectsForAccount.map((p) => ({ value: p.projectId, label: p.projectName }));
  }

  /** Cycle dropdown changed - re-narrows Business Unit/Account/Project to this cycle, auto-selecting the first at each level, and reloads the aggregate for the new cycle. */
  onDashboardCycleChange(cycleId: string): void {
    this.selectedCycle = this.dashboardCycles.find((c) => String(c.id) === cycleId) ?? null;
    this.loadBusinessUnits(() =>
      this.loadAccountsWithAssessments(() =>
        this.loadProjectsForAccount(this.selectedAccount?.cusT_ID ?? '', () => this.loadDashboardDomainData()),
      ),
    );
  }

  /** Account dropdown changed. Loads that account's assessed projects, auto-selects the first, and reloads. */
  onDashboardAccountChange(custId: string): void {
    const account = this.accountsWithAssessments.find((a) => a.cusT_ID === custId) ?? null;
    this.selectedAccount = account ? { cusT_ID: account.cusT_ID, cusT_NM: account.cusT_NM, industrY_TYPE: '', url: '' } : null;

    if (this.selectedAccount) {
      // Keeps AccountService.selectedAccount$ in sync so a domain-tracker row
      // click resolves GetOrCreateITOpsAssessment(domainCode, custId) against
      // the same account this picker has selected.
      this.accountService.selectAccount(this.selectedAccount);
    }

    this.loadProjectsForAccount(custId, () => this.loadDashboardDomainData());
  }

  /** Loads the given account's assessed projects and auto-selects the first one - there is no "All projects" option any more. */
  private loadProjectsForAccount(custId: string, onDone?: () => void): void {
    if (this.dashboardOwnScopeOnly) {
      this.projectsLoading = false;
      const seen = new Map<string, string>();
      for (const p of this.myAssignedProjectPairs) {
        if (custId && p.custId !== custId) continue;
        seen.set(p.projectId, p.projectName);
      }
      this.projectsForAccount = Array.from(seen, ([projectId, projectName]) => ({ projectId, projectName }));
      this.selectedProject = this.projectsForAccount[0] ?? null;
      onDone?.();
      return;
    }
    this.projectsLoading = true;
    this.api
      .getProjectsWithAssessments(custId, this.selectedCycle?.id)
      .pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load projects', err);
          return of([]);
        }),
      )
      .subscribe((projects) => {
        this.projectsForAccount = projects;
        this.selectedProject = projects[0] ?? null;
        this.projectsLoading = false;
        onDone?.();
      });
  }

  /** Project dropdown changed - there is no "All projects" option any more, so projectId is always one of projectsForAccount. */
  onDashboardProjectChange(projectId: string): void {
    this.selectedProject = this.projectsForAccount.find((p) => p.projectId === projectId) ?? null;
    this.loadDashboardDomainData();
  }

  /**
   * Loads the domain tracker (scoped to the selected account+project+cycle)
   * and top risks for the currently selected account/project, then resolves
   * the viewer's role for display purposes only - Dashboard Viewer/Superuser
   * access already bypasses the per-domain spoc/reviewer allow-list that
   * would otherwise hide domains this viewer isn't personally on (see
   * applyRoleScope).
   */
  private loadDashboardDomainData(): void {
    // '' (not undefined) for either means "All accounts"/"All projects" -
    // both GetITOpsDomainTracker and GetITOpsTopRisks aggregate across
    // everything when their scope param is blank.
    const custId = this.selectedAccount ? String(this.selectedAccount.cusT_ID) : '';
    const projectId = this.selectedProject?.projectId ?? '';

    // Business Unit only matters here when custId is blank ("All accounts") -
    // once a specific account is picked, custId already narrows scope.
    const businessUnit = custId ? undefined : this.businessUnitFilter || undefined;

    // Own-scope: neither endpoint accepts "just these project ids", so once no
    // single project is picked, fan out one call per project this employee is
    // actually assigned to (optionally narrowed to one of their own accounts)
    // and merge the results client-side - the only way to aggregate "my
    // projects" without a backend change. Picking one specific project of
    // theirs still goes through the plain single-call path below, since a
    // project offered in their own picker is inherently already theirs.
    const useOwnScopeAggregate = this.dashboardOwnScopeOnly && !this.selectedProject;
    const ownScopePairs = useOwnScopeAggregate
      ? this.myAssignedProjectPairs.filter((p) => !custId || p.custId === custId)
      : [];
    // Own-scope always narrows to just THIS employee's own assessor/reviewer/assessee
    // assignments, not every domain mapped to a project they merely have one assignment
    // on - needed even on the single-call path below (a project picked from their own
    // picker can still have sibling domains that belong to someone else entirely).
    // Also sent for a GDH (dashboardGdhBusinessUnits non-empty): FullAccess is true for
    // them so they aren't "own-scope", but the backend still needs their empId to
    // enforce the Business-Unit restriction itself server-side rather than trusting
    // whichever BU this screen's own dropdown happens to be set to.
    const myEmpId = (this.dashboardOwnScopeOnly || this.dashboardGdhBusinessUnits.length)
      ? localStorage.getItem('empid') || undefined
      : undefined;

    const domainRows$: Observable<ItOpsDomainTrackerRow[]> = useOwnScopeAggregate
      ? ownScopePairs.length
        ? forkJoin(
            ownScopePairs.map((p) =>
              this.api
                .getDomainTracker(p.custId, p.projectId, this.selectedCycle?.id, undefined, myEmpId)
                .pipe(catchError(() => of([] as ItOpsDomainTrackerRow[]))),
            ),
          ).pipe(map((lists) => lists.flat()))
        : of([] as ItOpsDomainTrackerRow[])
      : this.api.getDomainTracker(custId, projectId, this.selectedCycle?.id, businessUnit, myEmpId).pipe(
          catchError((err) => {
            console.error('IT Ops Maturity Dashboard: failed to load domain tracker', err);
            return of([] as ItOpsDomainTrackerRow[]);
          }),
        );

    const topRiskRows$: Observable<ItOpsTopRiskRow[]> = useOwnScopeAggregate
      ? ownScopePairs.length
        ? forkJoin(
            ownScopePairs.map((p) =>
              this.api
                .getTopRisks(p.custId, 100, p.projectId, this.selectedCycle?.id, undefined, myEmpId)
                .pipe(catchError(() => of([] as ItOpsTopRiskRow[]))),
            ),
          ).pipe(map((lists) => lists.flat()))
        : of([] as ItOpsTopRiskRow[])
      : this.api.getTopRisks(custId, 100, projectId, this.selectedCycle?.id, businessUnit, myEmpId).pipe(
          catchError((err) => {
            console.error('IT Ops Maturity Dashboard: failed to load top risks', err);
            return of([] as ItOpsTopRiskRow[]);
          }),
        );

    this.dashboardDataLoading = true;
    forkJoin({
      domainRows: domainRows$,
      topRiskRows: topRiskRows$,
      businessUnit: custId ? this.businessUnitService.getBusinessUnitForAccount(custId) : of(null),
      // The signed-in user's own email never changes between one scope-picker change and
      // the next - fetching it fresh on every single account/project/cycle switch was one
      // of two unnecessary network round trips making each selection feel sluggish.
      email: this.cachedMyEmail ? of(this.cachedMyEmail) : this.identityService.getMyEmail(),
    }).subscribe(({ domainRows, topRiskRows, businessUnit, email }) => {
      this.cachedMyEmail = email;
      this.accountBusinessUnit = businessUnit;
      const summaries = domainRows.map(toDomainSummary);
      this.allDomainSummaries = summaries;
      const myDomainNames = new Set(summaries.map((s) => s.name));
      const risks = topRiskRows.filter((r) => myDomainNames.has(r.domainName)).map(toTopRisk);
      const myEmpId = localStorage.getItem('empid');
      this.session.resolveIdentity(summaries, businessUnit, email, myEmpId);
      this.currentUser = this.session.currentUser;
      this.applyRoleScope(risks);
      this.dashboardDataLoading = false;
      this.dashboardHasLoadedOnce = true;
    });
  }

  /**
   * Anyone actually assigned to work (assessor / reviewer / assessee on a
   * domain x project assessment) should land straight on that work, not on the
   * generic account search. Zero assignments (e.g. a real admin/superuser who
   * only configures cycles) falls through to the untouched account picker.
   */
  private loadMyAssignments(): void {
    const empId = localStorage.getItem('empid');
    if (!empId) {
      this.myAssignmentsLoading = false;
      this.assignmentsLoadedForDefault = true;
      return;
    }
    this.api
      .getMyAssignments(empId)
      .pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load my assignments', err);
          this.toast.error('Could not load your assignments', 'Falling back to account selection. Please try again later.');
          return of([] as ItOpsMyAssignmentRow[]);
        }),
      )
      .subscribe((rows) => {
        this.myAssignments = rows ?? [];
        this.myAssignmentsLoading = false;
        // Default to whichever role tab actually has something in it - a
        // pure Reviewer (no Assessor rows at all) should land on "Needs
        // Review", not an empty "My Assessments" tab. Also steer off of
        // whichever tab this employee's role doesn't even show (that tab is
        // hidden entirely for them - see hasAssessorAssignments/
        // hasReviewerAssignments/hasAllocatedOnlyAssignments).
        if (this.assignmentsTab === 'assessments' && !this.hasAssessorAssignments) {
          this.assignmentsTab = this.hasReviewerAssignments ? 'reviews' : this.hasAllocatedOnlyAssignments ? 'allocated' : 'assessments';
        } else if (this.assignmentsTab === 'reviews' && !this.hasReviewerAssignments) {
          this.assignmentsTab = this.hasAssessorAssignments ? 'assessments' : this.hasAllocatedOnlyAssignments ? 'allocated' : 'reviews';
        } else if (this.assignmentsTab === 'allocated' && !this.hasAllocatedOnlyAssignments) {
          this.assignmentsTab = this.hasAssessorAssignments ? 'assessments' : this.hasReviewerAssignments ? 'reviews' : 'allocated';
        } else if (this.assignmentsTab === 'assessments' && !this.myOpenAssessments.length && this.myPendingReviews.length) {
          this.assignmentsTab = 'reviews';
        }
        this.assignmentsLoadedForDefault = true;
        this.maybeApplyDefaultCycle();
      });
  }

  backToMyAssignments(): void {
    this.router.navigate(['/my-assignments']);
  }

  /** An assessor edits the assessment; reviewers and assessees both work on the review screen. */
  isAssessorOn(row: ItOpsMyAssignmentRow): boolean {
    return (row.roles ?? []).includes('Assessor');
  }

  isReviewerOn(row: ItOpsMyAssignmentRow): boolean {
    return (row.roles ?? []).includes('Reviewer');
  }

  isAssesseeOn(row: ItOpsMyAssignmentRow): boolean {
    return (row.roles ?? []).includes('Assessee');
  }

  /** An assessee's work on this assessment isn't done just because the assessment itself was Approved - it's done once every finding raised against them has been accepted/rejected. */
  hasActionableFindings(row: ItOpsMyAssignmentRow): boolean {
    return (row.openFindingsForMe ?? 0) > 0;
  }

  /** Distinct cycle labels present in myAssignments, newest-first (as returned by the API) - what the Cycle dropdown offers besides "All cycles". */
  get cycleOptions(): string[] {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const row of this.myAssignments) {
      const label = row.cycleLabel;
      if (label && !seen.has(label)) {
        seen.add(label);
        options.push(label);
      }
    }
    return options;
  }

  /** Distinct DISPLAY statuses present in myAssignments (i.e. after the Approved->Completed
   * override), in a fixed workflow order - what the Status filter offers besides "All
   * statuses". Filtering by the raw backend status alone (the previous approach) had no way
   * to single out "Completed" rows, since those are still raw-Approved underneath. */
  get statusFilterOptions(): string[] {
    const order = ['Not Started', 'Draft', 'In Progress', 'Pending Review', 'Returned for Revision', 'Approved', 'Completed'];
    const present = new Set(this.myAssignments.map((row) => this.displayAssignmentStatus(row)));
    return order.filter((s) => present.has(s));
  }

  /** Options for the "My Assignments" Status combobox - "All statuses" plus every distinct display status actually present. */
  get assignmentsStatusOptions(): SearchableSelectOption[] {
    return [{ value: 'all', label: 'All statuses' }, ...this.statusFilterOptions.map((s) => ({ value: s, label: s }))];
  }

  get filteredAssignments(): ItOpsMyAssignmentRow[] {
    let rows = this.myAssignments;
    if (this.cycleFilter !== 'all') rows = rows.filter((row) => row.cycleLabel === this.cycleFilter);
    if (this.statusFilter !== 'all') rows = rows.filter((row) => this.displayAssignmentStatus(row) === this.statusFilter);
    return rows;
  }

  /**
   * "My Assessments" tab: every assessment this employee is the Assessor on,
   * in any status - an Approved one doesn't disappear, it's just one more row
   * the Status filter can narrow to. An Assessee row only appears once the
   * assessment is Approved - there's nothing for an assessee to look at
   * before then (no findings exist until scoring is done and reviewed);
   * whether THEY still have findings of their own left Open is then flagged
   * (needsAction) rather than gating visibility, so an assessee can still see
   * - and re-check - an Approved assessment even after clearing everything.
   */
  /**
   * Whether this employee is Assessor (or Approved-assessee) on at least one
   * assignment ANYWHERE, independent of the current cycle/status filter -
   * gates whether the "My Assessments" tab even shows at all, so a pure
   * Reviewer (no Assessor role on anything) doesn't see an empty tab that
   * isn't theirs to use.
   */
  get hasAssessorAssignments(): boolean {
    return this.myAssignments.some((row) => this.isAssessorOn(row) || this.isAssesseeOn(row));
  }

  /** Same idea as hasAssessorAssignments, for the "Needs Review" tab - only shown once this employee is actually a Reviewer on something. */
  get hasReviewerAssignments(): boolean {
    return this.myAssignments.some((row) => this.isReviewerOn(row));
  }

  /**
   * Same idea, for the "Assessments" tab - rows GetITOpsMyAssignments returns
   * purely because this employee is allocated to (or "owns" - BU Head/DM/PM/
   * AM/Quality SPOC/Delivery Partner) the project, with no personal
   * Assessor/Reviewer/Assessee role on the assessment itself (an empty
   * row.roles is exactly how the backend marks these). "My Assessments" stays
   * strictly Assessor/Assessee-only per that tab's own name - these
   * allocation-only assessments get their own separate tab instead of being
   * folded in.
   */
  get hasAllocatedOnlyAssignments(): boolean {
    return this.myAssignments.some((row) => !row.roles?.length);
  }

  get myOpenAssessments(): ItOpsMyAssignmentRow[] {
    return this.filteredAssignments.filter(
      (row) => this.isAssessorOn(row) || (this.isAssesseeOn(row) && row.status === 'Approved'),
    );
  }

  /**
   * "Needs Review" tab: every assessment this employee is a Reviewer on that
   * the assessor has actually done something with - Pending Review, Approved,
   * Returned for Revision, etc. all stay visible (and the Status filter can
   * still narrow down to just one of them), but a domain the assessor hasn't
   * even started yet has nothing for a reviewer to look at, so it's excluded
   * by default rather than cluttering the list with rows that aren't really
   * "needs review" in any sense yet.
   */
  get myPendingReviews(): ItOpsMyAssignmentRow[] {
    // Default order: oldest-submitted-first, so the queue reads in the order
    // things actually became this reviewer's responsibility - rows with no
    // submission date (shouldn't normally happen once past NotStarted) sort last.
    return this.filteredAssignments
      .filter((row) => this.isReviewerOn(row) && row.status !== 'NotStarted')
      .slice()
      .sort((a, b) => {
        if (!a.submittedDate && !b.submittedDate) return 0;
        if (!a.submittedDate) return 1;
        if (!b.submittedDate) return -1;
        return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
      });
  }

  /**
   * How many of myPendingReviews are actually still awaiting THIS reviewer's
   * decision - myPendingReviews itself deliberately keeps Approved/Returned
   * rows visible too (a reviewer can still open something they already
   * decided on), but the "Needs Review" tab's count badge should reflect only
   * what genuinely still needs action, not the whole list.
   */
  get pendingReviewActionCount(): number {
    return this.myPendingReviews.filter((row) => row.status === 'PendingReview').length;
  }

  /**
   * "Assessments" tab: every allocation/ownership-only assessment (see
   * hasAllocatedOnlyAssignments) - deliberately unfiltered by status, since
   * these aren't "my work to act on", just projects this employee can see
   * into.
   */
  get myAllocatedAssessments(): ItOpsMyAssignmentRow[] {
    return this.filteredAssignments.filter((row) => !row.roles?.length);
  }

  /** Rows for whichever of the three tabs is currently showing, before search/sort. */
  private get currentTabAssignmentsRaw(): ItOpsMyAssignmentRow[] {
    if (this.assignmentsTab === 'reviews') return this.myPendingReviews;
    if (this.assignmentsTab === 'allocated') return this.myAllocatedAssessments;
    return this.myOpenAssessments;
  }

  /** Matches the same account/project/domain fields the search box narrows the tables by - shared with assignmentsSummary so the KPI tiles agree with what's actually visible. */
  private matchesAssignmentSearch(row: ItOpsMyAssignmentRow): boolean {
    const needle = this.assignmentSearch.trim().toLowerCase();
    if (!needle) return true;
    return (
      (row.accountName ?? '').toLowerCase().includes(needle) ||
      (row.projectName ?? row.projectId ?? '').toLowerCase().includes(needle) ||
      (row.domainName ?? row.domainCode ?? '').toLowerCase().includes(needle)
    );
  }

  /** Rows for the current tab, narrowed by the free-text search box. */
  get currentTabAssignments(): ItOpsMyAssignmentRow[] {
    let rows = this.currentTabAssignmentsRaw.filter((row) => this.matchesAssignmentSearch(row));
    if (this.assignmentSortColumn) {
      rows = this.sortAssignments(rows, this.assignmentSortColumn, this.assignmentSortDirection);
    }
    return rows;
  }

  get assignmentsTotalPages(): number {
    return Math.max(1, Math.ceil(this.currentTabAssignments.length / this.assignmentsPageSize));
  }

  /** Current page's slice - clamps a stale page number locally (e.g. a search/tab switch shrank the list) rather than assigning back to assignmentsPage, which would trip ExpressionChangedAfterItHasBeenCheckedError in dev mode. */
  get pagedAssignments(): ItOpsMyAssignmentRow[] {
    const rows = this.currentTabAssignments;
    const clampedPage = Math.min(this.assignmentsPage, this.assignmentsTotalPages);
    const start = (clampedPage - 1) * this.assignmentsPageSize;
    return rows.slice(start, start + this.assignmentsPageSize);
  }

  get assignmentsCurrentPage(): number {
    return Math.min(this.assignmentsPage, this.assignmentsTotalPages);
  }

  get assignmentsRangeLabel(): string {
    const total = this.currentTabAssignments.length;
    if (!total) return '0 of 0';
    const clampedPage = Math.min(this.assignmentsPage, this.assignmentsTotalPages);
    const start = (clampedPage - 1) * this.assignmentsPageSize + 1;
    const end = Math.min(total, start + this.assignmentsPageSize - 1);
    return `${start}-${end} of ${total}`;
  }

  goToAssignmentsPage(page: number): void {
    this.assignmentsPage = Math.min(Math.max(1, page), this.assignmentsTotalPages);
  }

  onAssignmentSearchChange(): void {
    this.assignmentsPage = 1;
  }

  /** Which glyph a status pill gets - a checkmark once nothing's left to do, a plain dot otherwise (color alone shouldn't be the only signal). Pairs with the `status-pill-iconed` CSS modifier, which suppresses the shared `.status-pill::before` dot so the two indicators don't double up. */
  assignmentStatusIcon(status: string): 'check' | 'dot' {
    return status === 'Approved' || status === 'Completed' ? 'check' : 'dot';
  }

  /** Solid dot color for the grouped view's domain-name marker - a small circle, not a reused status pill (which is sized/padded for pill+text, not a bare dot). */
  domainDotColor(status: string): string {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'var(--status-good)';
      case 'Draft':
        return 'var(--status-warning)';
      case 'In Progress':
        return 'var(--status-serious)';
      case 'Pending Review':
        return 'var(--accent)';
      default:
        return 'var(--text-muted)';
    }
  }

  /** Whether "My Assignments" rows are shown grouped by account/project (default) or as the old flat one-row-per-assessment table. */
  groupedView = true;

  private collapsedGroupKeys = new Set<string>();

  setGroupedView(grouped: boolean): void {
    this.groupedView = grouped;
  }

  private groupKey(row: ItOpsMyAssignmentRow): string {
    return `${row.custId ?? row.accountName ?? ''}|${row.projectId ?? row.projectName ?? ''}`;
  }

  toggleGroup(key: string): void {
    if (this.collapsedGroupKeys.has(key)) {
      this.collapsedGroupKeys.delete(key);
    } else {
      this.collapsedGroupKeys.add(key);
    }
  }

  isGroupCollapsed(key: string): boolean {
    return this.collapsedGroupKeys.has(key);
  }

  /**
   * Groups for the CURRENT PAGE's rows only, keyed by account+project - a
   * group's progress bar/count still reflects every one of that project's
   * rows across the whole filtered list (not just this page), so a project
   * split across two pages still shows accurate totals on each.
   */
  get pagedAssignmentGroups(): { key: string; accountName: string; projectName: string; rows: ItOpsMyAssignmentRow[]; totalCount: number; doneCount: number }[] {
    const groups: { key: string; accountName: string; projectName: string; rows: ItOpsMyAssignmentRow[]; totalCount: number; doneCount: number }[] = [];
    const index = new Map<string, (typeof groups)[number]>();
    for (const row of this.pagedAssignments) {
      const key = this.groupKey(row);
      let g = index.get(key);
      if (!g) {
        g = { key, accountName: row.accountName || '-', projectName: row.projectName || row.projectId || '-', rows: [], totalCount: 0, doneCount: 0 };
        index.set(key, g);
        groups.push(g);
      }
      g.rows.push(row);
    }
    for (const g of groups) {
      const allForGroup = this.currentTabAssignments.filter((r) => this.groupKey(r) === g.key);
      g.totalCount = allForGroup.length;
      g.doneCount = allForGroup.filter((r) => ['Approved', 'Completed'].includes(this.displayAssignmentStatus(r))).length;
    }
    return groups;
  }

  groupProgressPct(g: { totalCount: number; doneCount: number }): number {
    return g.totalCount ? Math.round((g.doneCount / g.totalCount) * 100) : 0;
  }

  /**
   * pagedAssignmentGroups is a getter that builds fresh group objects on
   * every change-detection run (which fires on mousedown/mouseup, not just
   * click) - without this, *ngFor's default identity-based diffing sees an
   * entirely new array each time and tears down/rebuilds every group's DOM,
   * including whatever element a click was mid-gesture on, silently
   * swallowing the click. Keying by g.key instead lets Angular reuse the
   * same DOM nodes across recomputations.
   */
  trackGroupByKey(_index: number, g: { key: string }): string {
    return g.key;
  }

  sortAssignmentsBy(column: AssignmentSortColumn): void {
    if (this.assignmentSortColumn === column) {
      this.assignmentSortDirection = this.assignmentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.assignmentSortColumn = column;
      this.assignmentSortDirection = 'asc';
    }
    this.assignmentsPage = 1;
  }

  assignmentSortIndicator(column: AssignmentSortColumn): string {
    if (this.assignmentSortColumn !== column) return '';
    return this.assignmentSortDirection === 'asc' ? '▲' : '▼';
  }

  private sortAssignments(rows: ItOpsMyAssignmentRow[], column: AssignmentSortColumn, direction: SortDirection): ItOpsMyAssignmentRow[] {
    const factor = direction === 'asc' ? 1 : -1;
    const valueOf = (row: ItOpsMyAssignmentRow): string => {
      switch (column) {
        case 'account': return row.accountName ?? '';
        case 'project': return row.projectName ?? row.projectId ?? '';
        case 'domain': return row.domainName ?? row.domainCode ?? '';
        case 'role': return (row.roles ?? []).join(', ');
        case 'cycle': return row.cycleLabel ?? '';
        case 'status': return this.displayAssignmentStatus(row);
      }
    };
    return [...rows].sort((a, b) => valueOf(a).localeCompare(valueOf(b)) * factor);
  }

  /**
   * Small "at a glance" counts shown above the tabs - scoped by the Cycle/
   * Status filter pills and the free-text search box, same as the tables
   * below (see filteredAssignments/matchesAssignmentSearch), just not by
   * which tab is currently active.
   *
   * Deliberately status-based, not role-based: every row is counted once
   * off its own displayAssignmentStatus, regardless of whether the current
   * user holds it as Assessor/Reviewer/Assessee. This is scorecard-only -
   * the "Action needed"/"My Assessments"/"Pending Your Review" tab logic
   * elsewhere on this page stays role-scoped (see needsAction, myOpenAssessments,
   * myPendingReviews).
   *
   * Scoped to the currently active tab's own rows (currentTabAssignmentsRaw),
   * not every row across all three tabs - otherwise the tiles would count
   * assessments this employee can only see via "Needs Review"/allocation
   * while the table underneath, on the active tab, shows a much smaller set.
   */
  get assignmentsSummary(): { openCount: number; returnedCount: number; reviewCount: number; completedCount: number } {
    const rows = this.currentTabAssignmentsRaw.filter((row) => this.matchesAssignmentSearch(row));
    // isReturnedForRevision/'PendingReview' check the raw backend status directly -
    // displayAssignmentStatus's own ReturnedForRevision->"In Progress" mapping
    // (BACKEND_STATUS_MAP, used for the Status filter/table column) would
    // otherwise never match a literal "Returned for Revision" comparison here.
    const isReturned = (row: ItOpsMyAssignmentRow) => this.isReturnedForRevision(row);
    const isPendingReview = (row: ItOpsMyAssignmentRow) => row.status === 'PendingReview';
    const isCompleted = (row: ItOpsMyAssignmentRow) => this.displayAssignmentStatus(row) === 'Completed';
    return {
      openCount: rows.filter((row) => !isReturned(row) && !isPendingReview(row) && !isCompleted(row)).length,
      returnedCount: rows.filter((row) => isReturned(row)).length,
      reviewCount: rows.filter((row) => isPendingReview(row)).length,
      completedCount: rows.filter((row) => isCompleted(row)).length,
    };
  }

  /** Whether this row deserves the "Action needed" urgent highlight - the assessor's own work sent back for revision, an assessee row with findings of theirs still Open, or a reviewer row still genuinely awaiting this reviewer's decision (not one already Approved/Returned). Gated on actually holding that role - an allocation-only viewer (no personal Assessor/Reviewer/Assessee role) has nothing of their own to act on here, however the assessment's status happens to read. */
  needsAction(row: ItOpsMyAssignmentRow): boolean {
    return (
      (this.isAssessorOn(row) && this.isReturnedForRevision(row)) ||
      (this.isAssesseeOn(row) && this.hasActionableFindings(row)) ||
      (this.isReviewerOn(row) && row.status === 'PendingReview')
    );
  }

  /** A returned assessment is the most urgent row on "My Assessments" - it's the assessor's own work sent back with a required fix, not just an untouched Not Started item. */
  isReturnedForRevision(row: ItOpsMyAssignmentRow): boolean {
    return row.status === 'ReturnedForRevision';
  }

  selectAssignmentsTab(tab: 'assessments' | 'reviews' | 'allocated'): void {
    this.assignmentsTab = tab;
    this.assignmentsPage = 1;
    localStorage.setItem(MY_ASSIGNMENTS_TAB_KEY, tab);
  }

  onStatusFilterChange(): void {
    this.assignmentsPage = 1;
  }

  /** Clears both the Cycle and Status filter pills back to "all" in one click. */
  resetAssignmentFilters(): void {
    this.cycleFilter = 'all';
    this.statusFilter = 'all';
    this.assignmentsPage = 1;
  }

  /** Options for the "My Assignments" Cycle combobox - "All cycles" plus every distinct cycle label, same shape the Dashboard's own Cycle picker uses. */
  get assignmentsCycleOptions(): SearchableSelectOption[] {
    return [{ value: 'all', label: 'All cycles' }, ...this.cycleOptions.map((c) => ({ value: c, label: c }))];
  }

  assignmentStatusLabel(status: string): string {
    return BACKEND_STATUS_MAP[status] ?? status ?? 'Not Started';
  }

  /** An Approved assessment reads as "Completed" once nothing is left for anyone to act on (see ITOPS_MyAssignmentRow.AllFindingsResolved). */
  displayAssignmentStatus(row: ItOpsMyAssignmentRow): string {
    if (row.status === 'Approved' && row.allFindingsResolved) return 'Completed';
    return this.assignmentStatusLabel(row.status);
  }

  rolePillClass(role: string): string {
    return 'role-pill role-' + role.toLowerCase();
  }

  /**
   * The assessment/review pages scope themselves off
   * AccountService.selectedAccount (-> GetOrCreateITOpsAssessment(domainCode, custId))
   * plus the :domainId route param, which carries the domain CODE. Opening a
   * My-Assignments row therefore has to set exactly that same context rather
   * than invent a new one: select the row's account, then route on domainCode.
   *
   * assessmentId travels as a query param for two reasons: (1) the same
   * domain can have several assessments live at once - one per project it's
   * mapped to, one per cycle - and only the row's own AssessmentId identifies
   * which one was actually clicked (GetOrCreateITOpsAssessment falls back to
   * "whatever this domain+account resolves to in the current open cycle"
   * without it, which can silently open a DIFFERENT assessment than the row
   * clicked); (2) two rows for the same domain differ only in this query
   * param, so the URL actually changes between them and the assessment page's
   * queryParamMap subscription re-fires - without it, clicking a second row
   * for the same domain is a no-op navigation (identical URL) and the first
   * row's already-loaded data (however locked/submitted it was) just sits
   * there.
   */
  /** The action button's own click handler - stops the row's click (which also opens the assignment) from firing a second time on top of this one. */
  openAssignmentAction(event: Event, row: ItOpsMyAssignmentRow): void {
    event.stopPropagation();
    this.openAssignment(row);
  }

  openAssignment(row: ItOpsMyAssignmentRow): void {
    if (!row.custId || !row.domainCode) {
      this.toast.error('Cannot open this assessment', 'This assignment is missing its account or domain reference. Contact your administrator.');
      return;
    }
    const known = this.accounts.find((a) => String(a.cusT_ID) === String(row.custId));
    const account: CustomerModel = known ?? {
      cusT_ID: row.custId,
      cusT_NM: row.accountName ?? row.custId,
      industrY_TYPE: '',
      url: '',
    };
    this.accountService.selectAccount(account);
    // "from: assignments" lets the assessment/review page's Back link return
    // here (My Assignments) instead of always landing on the Dashboard -
    // this is the only entry point that should do that; the Dashboard's own
    // "Pending Your Review" link doesn't set it, so its Back link still goes
    // to the Dashboard as before.
    this.router.navigate([this.isAssessorOn(row) ? '/assessment' : '/review', row.domainCode], {
      queryParams: { assessmentId: row.assessmentId, from: 'assignments' },
    });
  }

  private applyRoleScope(allTopRisks: TopRisk[]): void {
    if (this.currentUser.role === 'GDH' || this.dashboardAccessGranted || this.dashboardOwnScopeOnly) {
      // Business-level view: all domains within this account/project. GDH
      // eligibility is already scoped to the account's own Business Unit;
      // Dashboard Viewer/Superuser access is a deliberately broad grant that
      // should show every domain in the selected project regardless of
      // whether this particular viewer happens to be its SPOC or Reviewer.
      // Own-scope access is different again but lands in the same branch: the
      // upstream domainRows/topRiskRows were ALREADY restricted to just this
      // employee's own assigned projects (loadDashboardDomainData), so every
      // domain that came back is rightfully theirs to see in full - no further
      // per-domain SPOC/Reviewer allow-listing on top of that is needed.
      this.domainSummaries = this.allDomainSummaries;
      this.scopedTopRisks = allTopRisks;
    } else {
      const allowed = new Set(this.currentUser.allowedDomainIds);
      this.domainSummaries = this.allDomainSummaries.filter((d) => allowed.has(d.id));
      const myDomainNames = new Set(this.domainSummaries.map((d) => d.name));
      this.scopedTopRisks = allTopRisks.filter((r) => myDomainNames.has(r.domain));
    }

    // "All accounts" can have the SAME domain name on two different accounts - key
    // counts/tabs by domain+account so they never collide into one shared tab.
    const nameOccursOnMultipleAccounts = new Set<string>();
    {
      const seenAccountsByName = new Map<string, Set<string>>();
      for (const d of this.domainSummaries) {
        const accounts = seenAccountsByName.get(d.name) ?? new Set<string>();
        accounts.add(d.accountId ?? '');
        seenAccountsByName.set(d.name, accounts);
      }
      for (const [name, accounts] of seenAccountsByName) {
        if (accounts.size > 1) nameOccursOnMultipleAccounts.add(name);
      }
    }

    const counts = new Map<string, number>();
    for (const risk of this.scopedTopRisks) {
      const key = riskDomainKey(risk.domain, risk.accountId);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    this.riskDomainTabs = this.domainSummaries
      .map((d) => {
        const key = riskDomainKey(d.name, d.accountId);
        const label = nameOccursOnMultipleAccounts.has(d.name) && d.accountName ? `${d.name} (${d.accountName})` : d.name;
        return { key, label, count: counts.get(key) ?? 0 };
      })
      .filter((t) => t.count > 0);

    if (!this.activeRiskDomain || !this.riskDomainTabs.some((t) => t.key === this.activeRiskDomain)) {
      this.activeRiskDomain = this.riskDomainTabs[0]?.key;
    }
    this.enterpriseSummary = computeEnterpriseSummaryFromRows(this.domainSummaries);
    this.updateVisibleRisks();
    setTimeout(() => this.updateTabScrollState());
  }

  /** What the "showing X of Y parameters..." line names - the tab's display label, not the raw match key. */
  get activeRiskDomainLabel(): string {
    return this.riskDomainTabs.find((t) => t.key === this.activeRiskDomain)?.label ?? '';
  }

  selectRiskDomain(key: string): void {
    this.activeRiskDomain = key;
    this.riskSortColumn = null;
    this.updateVisibleRisks();
    setTimeout(() => this.scrollActiveTabIntoView());
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateTabScrollState());
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateTabScrollState();
  }

  scrollTabs(direction: 1 | -1): void {
    const el = this.tabScrollRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * 240, behavior: 'smooth' });
  }

  onTabScroll(): void {
    this.updateTabScrollState();
  }

  private updateTabScrollState(): void {
    const el = this.tabScrollRef?.nativeElement;
    if (!el) {
      this.tabScrollLeft = false;
      this.tabScrollRight = false;
      return;
    }
    this.tabScrollLeft = el.scrollLeft > 4;
    this.tabScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
  }

  private scrollActiveTabIntoView(): void {
    const el = this.tabScrollRef?.nativeElement;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('.domain-tab.active');
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    this.updateTabScrollState();
  }

  private updateVisibleRisks(): void {
    let forDomain = this.scopedTopRisks.filter((r) => riskDomainKey(r.domain, r.accountId) === this.activeRiskDomain);
    if (this.riskSortColumn) {
      forDomain = this.sortRisks(forDomain, this.riskSortColumn, this.riskSortDirection);
    }
    this.activeDomainRiskTotal = forDomain.length;
    this.visibleTopRisks = forDomain.slice(0, PER_DOMAIN_RISK_LIMIT);
  }

  private sortRisks(risks: TopRisk[], column: RiskSortColumn, direction: SortDirection): TopRisk[] {
    const factor = direction === 'asc' ? 1 : -1;
    return [...risks].sort((a, b) => {
      if (column === 'category') return a.category.localeCompare(b.category) * factor;
      if (column === 'currentScore') return (a.currentScore - b.currentScore) * factor;
      return (a.gap - b.gap) * factor;
    });
  }

  sortByColumn(column: RiskSortColumn): void {
    if (this.riskSortColumn === column) {
      this.riskSortDirection = this.riskSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.riskSortColumn = column;
      this.riskSortDirection = 'desc';
    }
    this.updateVisibleRisks();
  }

  sortIndicator(column: RiskSortColumn): string {
    if (this.riskSortColumn !== column) return '';
    return this.riskSortDirection === 'asc' ? '▲' : '▼';
  }

  isPendingMyReview(domain: DomainSummary): boolean {
    const isReviewer = domain.reviewable ?? this.currentUser.reviewDomainIds.includes(domain.id);
    return domain.status === 'Pending Review' && isReviewer;
  }

  get pendingReviewDomains(): DomainSummary[] {
    return this.domainSummaries.filter((d) => this.isPendingMyReview(d));
  }

  statusClass(status: string): string {
    return statusPillClass(status);
  }

  /** Buckets an average score into "N - Label" (Ad Hoc/Developing/Defined/Managed/Optimized), same rule everywhere this appears - see maturityLevelLabel in rubric.util.ts. applicableParamCount drives the "Not in scope" case (E7=0 in the reference formula) when known. */
  levelLabel(score: number | null | undefined, applicableParamCount?: number): string {
    return maturityLevelLabel(score, applicableParamCount);
  }

  progressSegments(summary: EnterpriseSummary) {
    const total = summary.domainsCompleted + summary.domainsInProgress + summary.domainsNotStarted;
    if (total === 0) return [];
    return [
      { key: 'good', label: 'Completed', count: summary.domainsCompleted, pct: (summary.domainsCompleted / total) * 100 },
      { key: 'warning', label: 'In Progress', count: summary.domainsInProgress, pct: (summary.domainsInProgress / total) * 100 },
      { key: 'muted', label: 'Not Started', count: summary.domainsNotStarted, pct: (summary.domainsNotStarted / total) * 100 },
    ].filter((s) => s.count > 0);
  }

  maturityStatus(level: string | null): StatusLevel | 'muted' {
    if (!level) return 'muted';
    return MATURITY_LEVEL_STATUS[level] ?? 'muted';
  }

  gapSeverity(gap: number, isNotScored?: boolean): StatusLevel | 'good' | 'muted' {
    if (isNotScored) return 'muted';
    if (gap >= 3) return 'critical';
    if (gap === 2) return 'serious';
    if (gap === 0) return 'good';
    return 'warning';
  }

  scorePct(score: number | null): number {
    return score !== null ? (score / 5) * 100 : 0;
  }

  pctSeverity(pct: number): StatusLevel {
    if (pct < 50) return 'critical';
    if (pct <= 65) return 'warning';
    return 'good';
  }

  maturityLevelPillClass(level: string | null): string {
    const status = this.maturityStatus(level);
    return `level-pill level-${status}`;
  }

  /** An Approved domain reads as "Completed" once nothing is left for anyone to act on (every finding Closed). */
  displayDomainStatus(domain: DomainSummary): string {
    if (domain.status === 'Approved' && domain.allFindingsResolved) return 'Completed';
    return domain.status;
  }

  sortDomainTrackerBy(column: 'name' | 'status' | 'maturityPercent' | 'averageScore'): void {
    if (this.domainTrackerSortColumn === column) {
      this.domainTrackerSortDirection = this.domainTrackerSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.domainTrackerSortColumn = column;
      this.domainTrackerSortDirection = 'asc';
    }
  }

  domainTrackerSortIndicator(column: 'name' | 'status' | 'maturityPercent' | 'averageScore'): string {
    if (this.domainTrackerSortColumn !== column) return '';
    return this.domainTrackerSortDirection === 'asc' ? '▲' : '▼';
  }

  get sortedDomainSummaries(): DomainSummary[] {
    if (!this.domainTrackerSortColumn) return this.domainSummaries;
    const column = this.domainTrackerSortColumn;
    const factor = this.domainTrackerSortDirection === 'asc' ? 1 : -1;
    return [...this.domainSummaries].sort((a, b) => {
      const av = column === 'name' || column === 'status' ? (a[column] ?? '') : (a[column] ?? -1);
      const bv = column === 'name' || column === 'status' ? (b[column] ?? '') : (b[column] ?? -1);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }

  maturityRingStyle(pct: number): Record<string, string> {
    return {
      background: `conic-gradient(var(--ring-fill) ${pct}%, var(--ring-track) 0)`,
    };
  }

  readonly maturityScaleLabels = ['Ad Hoc', 'Developing', 'Defined', 'Managed', 'Optimized'];

  /** Which of the 5 maturity-scale segments are "on", given the enterprise average score (0-5). */
  maturityScaleSegments(avgScore: number): boolean[] {
    const level = Math.min(5, Math.max(0, Math.round(avgScore)));
    return Array.from({ length: 5 }, (_, i) => i < level);
  }

  /** Excel sheet names can't exceed 31 chars or contain \ / ? * [ ] : - and can't be blank. */
  private sheetSafeName(name: string, fallback: string): string {
    const cleaned = (name || fallback).replace(/[\\/?*[\]:]/g, ' ').trim();
    return (cleaned || fallback).slice(0, 31);
  }

  /** One row of the Domain Tracker table, shaped for an Excel sheet (mirrors the visible columns). */
  private domainTrackerExportRow(domain: DomainSummary): Record<string, unknown> {
    return {
      Account: domain.accountName || '-',
      'Technology Domain': domain.name,
      'COE SPOC': domain.coeSpoc || 'Unassigned',
      Reviewer: domain.reviewer || 'Unassigned',
      Status: this.displayDomainStatus(domain),
      Parameters: domain.paramCount,
      'Applicable Parameters': domain.applicableParamCount,
      Score: domain.sumScores,
      Max: domain.maxPossible,
      Avg: domain.averageScore !== null ? domain.averageScore : '-',
      Maturity: domain.maturityPercent !== null ? `${domain.maturityPercent}%` : '-',
      Level: this.levelLabel(domain.averageScore, domain.applicableParamCount),
    };
  }

  /**
   * Exports the Domain Tracker as a multi-sheet workbook: a "Domain Tracker" overview
   * sheet with every row currently shown, then one sheet per distinct technology domain
   * (e.g. every account's "NOC" row together) so a reader can jump straight to one
   * domain's data across every account/project. Every sheet leads with the filters
   * (Cycle/Business Unit/Account/Project) that were in effect, so the export is
   * self-describing even once it's been saved and reopened later.
   */
  async exportDomainTracker(): Promise<void> {
    const XLSX = await import('xlsx');

    const filterInfo: [string, string][] = [
      ['Cycle', this.selectedCycle?.cycleLabel || 'All cycles'],
      ['Business Unit', this.businessUnitFilter || 'All business units'],
      ['Account', this.selectedAccount?.cusT_NM || 'All accounts'],
      ['Project', this.selectedProject?.projectName || 'All projects'],
    ];

    const buildSheet = (rows: DomainSummary[], includeFilterInfo: boolean) => {
      const aoa: unknown[][] = includeFilterInfo ? filterInfo.map(([label, value]) => [`${label}:`, value]) : [];
      if (includeFilterInfo) aoa.push([]);
      const dataRows = rows.map((d) => this.domainTrackerExportRow(d));
      const headers = Object.keys(dataRows[0] ?? this.domainTrackerExportRow(rows[0]));
      aoa.push(headers);
      dataRows.forEach((row) => aoa.push(headers.map((h) => row[h])));
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      worksheet['!cols'] = headers.map((h) => ({ wch: Math.max(14, h.length + 2) }));
      return worksheet;
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, buildSheet(this.sortedDomainSummaries, true), 'Domain Tracker');

    // Group by domain name so the SAME domain across different accounts ("All
    // accounts" view) lands on one sheet together, instead of one sheet per row.
    const byDomain = new Map<string, DomainSummary[]>();
    for (const d of this.sortedDomainSummaries) {
      const rows = byDomain.get(d.name) ?? [];
      rows.push(d);
      byDomain.set(d.name, rows);
    }
    const usedSheetNames = new Set<string>(['Domain Tracker']);
    let unnamedCount = 0;
    for (const [domainName, rows] of byDomain) {
      let sheetName = this.sheetSafeName(domainName, `Domain ${++unnamedCount}`);
      let suffix = 2;
      while (usedSheetNames.has(sheetName)) {
        sheetName = `${this.sheetSafeName(domainName, `Domain ${unnamedCount}`).slice(0, 28)} (${suffix++})`;
      }
      usedSheetNames.add(sheetName);
      XLSX.utils.book_append_sheet(workbook, buildSheet(rows, false), sheetName);
    }

    XLSX.writeFile(workbook, `IT-Ops-Domain-Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}

import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    accountId: row.accountId ?? undefined,
    accountName: row.accountName ?? undefined,
    recommendation: maturityBandLabel(score),
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
  const totalSumScores = summaries.reduce((sum, s) => sum + s.sumScores, 0);
  const totalMaxPossible = summaries.reduce((sum, s) => sum + s.maxPossible, 0);

  const scoredDomains = summaries.filter((s) => s.status !== 'Not Started' && s.status !== 'In Progress');
  const scoredParamCount = scoredDomains.reduce((sum, s) => sum + s.paramCount, 0);
  const scoredSumScores = scoredDomains.reduce((sum, s) => sum + s.sumScores, 0);
  const overallAverageScore = scoredParamCount ? Math.round((scoredSumScores / scoredParamCount) * 100) / 100 : 0;
  const overallMaturityPercent = Math.round((overallAverageScore / 5) * 100);
  const levelFromAvg = (avg: number): string => {
    if (avg <= 1) return 'Ad Hoc';
    if (avg <= 2) return 'Developing';
    if (avg <= 3) return 'Defined';
    if (avg <= 4) return 'Managed';
    return 'Optimized';
  };

  return {
    overallAverageScore,
    overallMaturityPercent,
    overallMaturityLevel: overallAverageScore > 0 ? levelFromAvg(overallAverageScore) : 'Not Started',
    domainsCompleted: summaries.filter((s) => s.status === 'Approved').length,
    domainsInProgress: summaries.filter((s) => s.status === 'Draft' || s.status === 'In Progress' || s.status === 'Pending Review').length,
    domainsNotStarted: summaries.filter((s) => s.status === 'Not Started').length,
    totalParamCount,
    totalSumScores,
    totalMaxPossible,
  };
}

type StatusLevel = 'good' | 'warning' | 'serious' | 'critical';

const MATURITY_LEVEL_STATUS: Record<string, StatusLevel> = {
  'Ad Hoc': 'critical',
  Developing: 'serious',
  Defined: 'warning',
  Managed: 'good',
  Optimized: 'good',
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
  /** Whether this employee holds the Dashboard Viewer role (or is an ITOps Superuser) - the account/project-wide Dashboard is locked behind this. */
  dashboardAccessGranted = false;
  /** Every assessment cycle, newest first - picking one narrows the account/project dropdowns below it. */
  dashboardCycles: { id: number; cycleLabel: string; status: string }[] = [];
  selectedCycle: { id: number; cycleLabel: string; status: string } | null = null;
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
  assignmentsTab: 'assessments' | 'reviews' = (localStorage.getItem(MY_ASSIGNMENTS_TAB_KEY) as any) ?? 'assessments';
  /** Free-text filter over the current tab's rows - account/project/domain name. */
  assignmentSearch = '';
  /** 'all' or one of the raw backend statuses present in myAssignments - lets either tab be narrowed to just Approved, just Pending Review, etc. instead of a separate "Completed" tab. */
  statusFilter = 'all';
  assignmentSortColumn: AssignmentSortColumn | null = null;
  assignmentSortDirection: 'asc' | 'desc' = 'asc';
  assignmentsPage = 1;
  readonly assignmentsPageSize = 10;
  private _cycleFilter = localStorage.getItem(MY_ASSIGNMENTS_CYCLE_KEY) ?? 'all';

  /** 'all' or one of the cycle labels present in myAssignments - lets the table be narrowed to one cycle instead of always listing every cycle's rows together. Persisted across visits. */
  get cycleFilter(): string {
    return this._cycleFilter;
  }

  set cycleFilter(value: string) {
    this._cycleFilter = value;
    localStorage.setItem(MY_ASSIGNMENTS_CYCLE_KEY, value);
    this.assignmentsPage = 1;
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
          return of(false);
        }),
      )
      .subscribe((granted) => {
        this.dashboardAccessGranted = granted;
        this.dashboardAccessLoading = false;
        if (!granted) {
          // The nav bar already hides the Dashboard tab for anyone without this
          // role, but the route itself is still directly reachable (default
          // landing route after login, a bookmark, typing the URL) - land them
          // on My Assignments instead of the blocked "Access Required" card,
          // which nobody without the role should ever actually see.
          this.router.navigate(['/my-assignments']);
          return;
        }
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
            // Default view otherwise: All accounts / All projects within that one
            // cycle, loading the aggregate straight away instead of making the
            // viewer pick a scope first - narrowing down further is optional.
            this.loadAccountsWithAssessments();
            this.loadProjectsForAccount('');
            this.loadDashboardDomainData();
          });
      });
  }

  private loadAccountsWithAssessments(): void {
    this.api
      .getAccountsWithAssessments(this.selectedCycle?.id)
      .pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load accounts with assessments', err);
          return of([]);
        }),
      )
      .subscribe((accounts) => {
        this.accountsWithAssessments = accounts;
      });
  }

  get selectedCycleValue(): string {
    return this.selectedCycle ? String(this.selectedCycle.id) : '';
  }

  get dashboardCycleOptions(): SearchableSelectOption[] {
    return this.dashboardCycles.map((c) => ({ value: String(c.id), label: c.cycleLabel }));
  }

  // The "All accounts"/"All projects" entry itself comes from emptyLabel on the
  // <app-searchable-select> below, not from this options list - adding it here
  // too just duplicates that same entry.
  get dashboardAccountOptions(): SearchableSelectOption[] {
    return this.accountsWithAssessments.map((a) => ({ value: a.cusT_ID, label: a.cusT_NM }));
  }

  get dashboardProjectOptions(): SearchableSelectOption[] {
    return this.projectsForAccount.map((p) => ({ value: p.projectId, label: p.projectName }));
  }

  /** Cycle dropdown changed - re-narrows the account dropdown to this cycle, resets account/project back to "All", and reloads the aggregate for the new cycle. */
  onDashboardCycleChange(cycleId: string): void {
    this.selectedCycle = this.dashboardCycles.find((c) => String(c.id) === cycleId) ?? null;
    this.selectedAccount = null;
    this.selectedProject = null;
    this.loadAccountsWithAssessments();
    this.loadProjectsForAccount('');
    this.loadDashboardDomainData();
  }

  /** Account dropdown changed - '' means "All accounts". Loads that scope's assessed projects (every account's when '', just the one account's otherwise), resets the project back to "All projects" for the new scope, and reloads. */
  onDashboardAccountChange(custId: string): void {
    const account = custId ? this.accountsWithAssessments.find((a) => a.cusT_ID === custId) ?? null : null;
    this.selectedAccount = account ? { cusT_ID: account.cusT_ID, cusT_NM: account.cusT_NM, industrY_TYPE: '', url: '' } : null;
    this.selectedProject = null;

    if (account) {
      // Keeps AccountService.selectedAccount$ in sync so a domain-tracker row
      // click resolves GetOrCreateITOpsAssessment(domainCode, custId) against
      // the same account this picker has selected.
      this.accountService.selectAccount(this.selectedAccount!);
    }

    this.loadProjectsForAccount(custId);
    this.loadDashboardDomainData();
  }

  /** '' fetches every assessed project across every account ("All accounts"); a real custId scopes it to that one account's projects. */
  private loadProjectsForAccount(custId: string): void {
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
        this.projectsLoading = false;
      });
  }

  /** Project dropdown changed - '' means "All projects" (for whichever account scope is currently selected). */
  onDashboardProjectChange(projectId: string): void {
    this.selectedProject = projectId ? this.projectsForAccount.find((p) => p.projectId === projectId) ?? null : null;
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

    this.dashboardDataLoading = true;
    forkJoin({
      domainRows: this.api.getDomainTracker(custId, projectId, this.selectedCycle?.id).pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load domain tracker', err);
          return of([] as ItOpsDomainTrackerRow[]);
        }),
      ),
      topRiskRows: this.api.getTopRisks(custId, 100, projectId, this.selectedCycle?.id).pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load top risks', err);
          return of([] as ItOpsTopRiskRow[]);
        }),
      ),
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
        // Review", not an empty "My Assessments" tab.
        if (!this.myOpenAssessments.length && this.myPendingReviews.length) {
          this.assignmentsTab = 'reviews';
        }
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

  /** Distinct raw statuses present in myAssignments, in the fixed workflow order below - what the Status filter offers besides "All statuses". */
  get statusFilterOptions(): string[] {
    const order = ['NotStarted', 'Draft', 'ReturnedForRevision', 'PendingReview', 'Approved', 'Suspended', 'Closed'];
    const present = new Set(this.myAssignments.map((row) => row.status));
    return order.filter((s) => present.has(s));
  }

  /** Options for the "My Assignments" Status combobox - "All statuses" plus every distinct raw status actually present, labeled the same way the Status column itself displays them. */
  get assignmentsStatusOptions(): SearchableSelectOption[] {
    return [{ value: 'all', label: 'All statuses' }, ...this.statusFilterOptions.map((s) => ({ value: s, label: this.assignmentStatusLabel(s) }))];
  }

  get filteredAssignments(): ItOpsMyAssignmentRow[] {
    let rows = this.myAssignments;
    if (this.cycleFilter !== 'all') rows = rows.filter((row) => row.cycleLabel === this.cycleFilter);
    if (this.statusFilter !== 'all') rows = rows.filter((row) => row.status === this.statusFilter);
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

  /** Rows for whichever of the two tabs is currently showing, before search/sort. */
  private get currentTabAssignmentsRaw(): ItOpsMyAssignmentRow[] {
    return this.assignmentsTab === 'reviews' ? this.myPendingReviews : this.myOpenAssessments;
  }

  /** Rows for the current tab, narrowed by the free-text search box. */
  get currentTabAssignments(): ItOpsMyAssignmentRow[] {
    const needle = this.assignmentSearch.trim().toLowerCase();
    let rows = this.currentTabAssignmentsRaw;
    if (needle) {
      rows = rows.filter(
        (row) =>
          (row.accountName ?? '').toLowerCase().includes(needle) ||
          (row.projectName ?? row.projectId ?? '').toLowerCase().includes(needle) ||
          (row.domainName ?? row.domainCode ?? '').toLowerCase().includes(needle),
      );
    }
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

  /** Small "at a glance" counts shown above the tabs - deliberately unaffected by the cycle/status filter/search/tab so it always reads as "everything you have", not "everything currently visible". */
  get assignmentsSummary(): { openCount: number; returnedCount: number; reviewCount: number; completedCount: number } {
    const openRows = this.myAssignments.filter((row) => this.isAssessorOn(row) && row.status !== 'Approved');
    return {
      openCount: openRows.length,
      returnedCount: openRows.filter((row) => this.isReturnedForRevision(row)).length,
      reviewCount: this.myAssignments.filter((row) => this.isReviewerOn(row) && row.status === 'PendingReview').length,
      // "Completed" here means genuinely nothing left to do - an Assessor/Reviewer
      // row just needs the assessment Approved, but an Assessee row also needs
      // every finding raised against them to already be resolved.
      completedCount: this.myAssignments.filter(
        (row) =>
          row.status === 'Approved' &&
          (this.isAssessorOn(row) || this.isReviewerOn(row) || (this.isAssesseeOn(row) && !this.hasActionableFindings(row))),
      ).length,
    };
  }

  /** Whether this row deserves the "Action needed" urgent highlight - either it's the assessor's own work sent back for revision, or it's an assessee row with findings of theirs still Open. */
  needsAction(row: ItOpsMyAssignmentRow): boolean {
    return this.isReturnedForRevision(row) || (this.isAssesseeOn(row) && this.hasActionableFindings(row));
  }

  /** A returned assessment is the most urgent row on "My Assessments" - it's the assessor's own work sent back with a required fix, not just an untouched Not Started item. */
  isReturnedForRevision(row: ItOpsMyAssignmentRow): boolean {
    return row.status === 'ReturnedForRevision';
  }

  selectAssignmentsTab(tab: 'assessments' | 'reviews'): void {
    this.assignmentsTab = tab;
    this.assignmentsPage = 1;
    localStorage.setItem(MY_ASSIGNMENTS_TAB_KEY, tab);
  }

  onStatusFilterChange(): void {
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
    if (this.currentUser.role === 'GDH' || this.dashboardAccessGranted) {
      // Business-level view: all domains within this account/project. GDH
      // eligibility is already scoped to the account's own Business Unit;
      // Dashboard Viewer/Superuser access is a deliberately broad grant that
      // should show every domain in the selected project regardless of
      // whether this particular viewer happens to be its SPOC or Reviewer.
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

  gapSeverity(gap: number): StatusLevel | 'good' {
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
}

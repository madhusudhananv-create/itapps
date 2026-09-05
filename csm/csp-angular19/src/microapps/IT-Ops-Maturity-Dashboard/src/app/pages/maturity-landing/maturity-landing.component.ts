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
  };
}

function toTopRisk(row: ItOpsTopRiskRow): TopRisk {
  const score = row.currentScore ?? 0;
  return {
    domain: row.domainName,
    category: row.category,
    parameter: row.parameterName,
    currentScore: score,
    gap: row.gap,
    recommendation:
      row.recommendedAction ||
      (row.gap > 0
        ? `Advance "${row.parameterName}" from level ${score} toward level ${score + 1} practices.`
        : `"${row.parameterName}" is already at level 5 - maintain current practices.`),
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
  name: string;
  count: number;
}

type RiskSortColumn = 'category' | 'currentScore' | 'gap';
type SortDirection = 'asc' | 'desc';

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
  /** 'all' or one of the cycle labels present in myAssignments - lets the table be narrowed to one cycle instead of always listing every cycle's rows together. */
  cycleFilter = 'all';
  /** Which of the two "My Assignments" role tables is showing - someone who is only ever a Reviewer has no reason to land on an empty Assessments tab, so this defaults based on what they actually have. */
  assignmentsTab: 'assessments' | 'reviews' = 'assessments';

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
        if (granted) {
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
            });
          this.loadAccountsWithAssessments();
        }
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

  get dashboardAccountOptions(): SearchableSelectOption[] {
    return this.accountsWithAssessments.map((a) => ({ value: a.cusT_ID, label: a.cusT_NM }));
  }

  get dashboardProjectOptions(): SearchableSelectOption[] {
    return this.projectsForAccount.map((p) => ({ value: p.projectId, label: p.projectName }));
  }

  /** Cycle dropdown changed - re-narrows the account dropdown to this cycle and clears any downstream selection. */
  onDashboardCycleChange(cycleId: string): void {
    this.selectedCycle = this.dashboardCycles.find((c) => String(c.id) === cycleId) ?? null;
    this.selectedAccount = null;
    this.selectedProject = null;
    this.projectsForAccount = [];
    this.domainSummaries = [];
    this.enterpriseSummary = undefined;
    this.loadAccountsWithAssessments();
  }

  /** Account dropdown changed - loads that account's assessed projects and clears any previously selected project/data. */
  onDashboardAccountChange(custId: string): void {
    const account = this.accountsWithAssessments.find((a) => a.cusT_ID === custId) ?? null;
    this.selectedAccount = account ? { cusT_ID: account.cusT_ID, cusT_NM: account.cusT_NM, industrY_TYPE: '', url: '' } : null;
    this.selectedProject = null;
    this.projectsForAccount = [];
    this.domainSummaries = [];
    this.enterpriseSummary = undefined;
    if (!account) return;

    // Keeps AccountService.selectedAccount$ in sync so a domain-tracker row
    // click resolves GetOrCreateITOpsAssessment(domainCode, custId) against
    // the same account this picker has selected.
    this.accountService.selectAccount(this.selectedAccount!);

    this.projectsLoading = true;
    this.api
      .getProjectsWithAssessments(custId, this.selectedCycle?.id)
      .pipe(
        catchError((err) => {
          console.error('IT Ops Maturity Dashboard: failed to load projects for account', err);
          return of([]);
        }),
      )
      .subscribe((projects) => {
        this.projectsForAccount = projects;
        this.projectsLoading = false;
      });
  }

  /** Project dropdown changed - loads that project's domains/parameters. */
  onDashboardProjectChange(projectId: string): void {
    const project = this.projectsForAccount.find((p) => p.projectId === projectId) ?? null;
    this.selectedProject = project;
    if (!project) {
      this.domainSummaries = [];
      this.enterpriseSummary = undefined;
      return;
    }
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
    if (!this.selectedAccount || !this.selectedProject) return;
    const custId = String(this.selectedAccount.cusT_ID);
    const projectId = this.selectedProject.projectId;

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
      businessUnit: this.businessUnitService.getBusinessUnitForAccount(custId),
      email: this.identityService.getMyEmail(),
    }).subscribe(({ domainRows, topRiskRows, businessUnit, email }) => {
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

  /** Dashboard and My Assignments are separate nav menu items/routes now - this navigates there rather than just flipping local state. */
  browseAllAccounts(): void {
    this.router.navigate(['/']);
  }

  backToMyAssignments(): void {
    this.router.navigate(['/my-assignments']);
  }

  /** An assessor edits the assessment; reviewers and assessees both work on the review screen. */
  isAssessorOn(row: ItOpsMyAssignmentRow): boolean {
    return (row.roles ?? []).includes('Assessor');
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

  get filteredAssignments(): ItOpsMyAssignmentRow[] {
    if (this.cycleFilter === 'all') return this.myAssignments;
    return this.myAssignments.filter((row) => row.cycleLabel === this.cycleFilter);
  }

  /** "My Assessments" tab: every OPEN (not yet Approved) assessment this employee is the Assessor on. */
  get myOpenAssessments(): ItOpsMyAssignmentRow[] {
    return this.filteredAssignments.filter((row) => this.isAssessorOn(row) && row.status !== 'Approved');
  }

  /** "Needs Review" tab: every assessment sitting in Pending Review that this employee is a Reviewer on. */
  get myPendingReviews(): ItOpsMyAssignmentRow[] {
    return this.filteredAssignments.filter((row) => (row.roles ?? []).includes('Reviewer') && row.status === 'PendingReview');
  }

  selectAssignmentsTab(tab: 'assessments' | 'reviews'): void {
    this.assignmentsTab = tab;
  }

  assignmentStatusLabel(status: string): string {
    return BACKEND_STATUS_MAP[status] ?? status ?? 'Not Started';
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
    this.router.navigate([this.isAssessorOn(row) ? '/assessment' : '/review', row.domainCode], {
      queryParams: { assessmentId: row.assessmentId },
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

    const counts = new Map<string, number>();
    for (const risk of this.scopedTopRisks) {
      counts.set(risk.domain, (counts.get(risk.domain) ?? 0) + 1);
    }
    this.riskDomainTabs = this.domainSummaries
      .map((d) => ({ name: d.name, count: counts.get(d.name) ?? 0 }))
      .filter((t) => t.count > 0);

    if (!this.activeRiskDomain || !this.riskDomainTabs.some((t) => t.name === this.activeRiskDomain)) {
      this.activeRiskDomain = this.riskDomainTabs[0]?.name;
    }
    this.enterpriseSummary = computeEnterpriseSummaryFromRows(this.domainSummaries);
    this.updateVisibleRisks();
    setTimeout(() => this.updateTabScrollState());
  }

  selectRiskDomain(name: string): void {
    this.activeRiskDomain = name;
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
    let forDomain = this.scopedTopRisks.filter((r) => r.domain === this.activeRiskDomain);
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

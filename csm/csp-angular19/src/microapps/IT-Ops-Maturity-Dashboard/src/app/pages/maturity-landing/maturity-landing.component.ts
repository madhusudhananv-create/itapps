import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ItOpsMaturityApiService, ItOpsDomainTrackerRow, ItOpsTopRiskRow, ItOpsMyAssignmentRow } from '../../services/itops-maturity-api.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { SessionService } from '../../services/session.service';
import { AccountService } from '../../services/account.service';
import { AssesseeService } from '../../services/assessee.service';
import { BusinessUnitService } from '../../services/business-unit.service';
import { IdentityService } from '../../services/identity.service';
import { DomainSummary, EnterpriseSummary, TopRisk, CurrentUser, DomainStatus } from '../../models/maturity.model';
import { CustomerModel } from '../../models/account.model';
import { Assessee } from '../../models/assessee.model';
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
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './maturity-landing.component.html',
  styleUrl: './maturity-landing.component.scss',
})
export class MaturityLandingComponent implements OnInit, AfterViewInit {
  enterpriseSummary?: EnterpriseSummary;
  domainSummaries: DomainSummary[] = [];
  currentUser!: CurrentUser;

  accounts: CustomerModel[] = [];
  filteredAccounts: CustomerModel[] = [];
  selectedAccount: CustomerModel | null = null;
  accountsLoaded = false;
  accountSearch = '';
  accountDropdownOpen = false;

  @ViewChild('accountCombobox') accountCombobox?: ElementRef<HTMLElement>;

  assessees: Assessee[] = [];
  filteredAssessees: Assessee[] = [];
  selectedAssessees: Assessee[] = [];
  /** Working selection in the picker before "Continue" confirms it. */
  pendingAssesseeIds = new Set<string>();
  assesseeSearch = '';
  assesseesLoading = false;

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
   * 'assignments' is the default whenever this employee has at least one real
   * assessor/reviewer/assessee row; 'accounts' is the pre-existing
   * "Select an account to begin" flow, unchanged, and is the ONLY view for
   * anyone with zero assignments (admins/superusers browsing all accounts).
   */
  viewMode: 'assignments' | 'accounts' = 'accounts';

  constructor(
    private api: ItOpsMaturityApiService,
    private session: SessionService,
    private accountService: AccountService,
    private assesseeService: AssesseeService,
    private businessUnitService: BusinessUnitService,
    private identityService: IdentityService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMyAssignments();
    // session.user$ always has a value synchronously (defaults to NoAccess) -
    // keep currentUser in sync with it from the very first tick, so template
    // bindings like currentUser.role never see undefined while the
    // account-scoped role resolution below is still in flight (or fails).
    this.session.user$.subscribe((user) => (this.currentUser = user));

    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts = accounts;
      this.filteredAccounts = accounts;
      this.accountsLoaded = true;
    });

    this.accountService.selectedAccount$.subscribe((account) => {
      this.selectedAccount = account;
    });

    this.accountService.selectedAccount$
      .pipe(
        switchMap((account) => {
          if (!account) return of(null);
          this.assesseesLoading = true;
          return this.assesseeService.getAssessees(String(account.cusT_ID));
        }),
      )
      .subscribe((assessees) => {
        this.assessees = assessees ?? [];
        this.filteredAssessees = this.assessees;
        this.assesseesLoading = false;
      });

    this.assesseeService.selectedAssessees$.subscribe((assessees) => {
      this.selectedAssessees = assessees;
      this.pendingAssesseeIds = new Set(assessees.map((a) => a.id));
    });

    // Role/domain-access is only resolvable once an account is selected,
    // since GDH eligibility depends on that account's real Business Unit,
    // and the Domain Tracker/Top Risks/Executive summary are all scoped to
    // that same account's real CUST_ID against the DB-backed API.
    this.accountService.selectedAccount$
      .pipe(
        filter((account): account is CustomerModel => !!account),
        switchMap((account) => {
          const custId = String(account.cusT_ID);
          return forkJoin({
            domainRows: this.api.getDomainTracker(custId).pipe(catchError((err) => {
              console.error('IT Ops Maturity Dashboard: failed to load domain tracker', err);
              return of([] as ItOpsDomainTrackerRow[]);
            })),
            topRiskRows: this.api.getTopRisks(custId).pipe(catchError((err) => {
              console.error('IT Ops Maturity Dashboard: failed to load top risks', err);
              return of([] as ItOpsTopRiskRow[]);
            })),
            businessUnit: this.businessUnitService.getBusinessUnitForAccount(custId),
            email: this.identityService.getMyEmail(),
          });
        }),
      )
      .subscribe(({ domainRows, topRiskRows, businessUnit, email }) => {
        this.accountBusinessUnit = businessUnit;
        const summaries = domainRows.map(toDomainSummary);
        const risks = topRiskRows.map(toTopRisk);
        this.allDomainSummaries = summaries;
        const myEmpId = localStorage.getItem('empid');
        this.session.resolveIdentity(summaries, businessUnit, email, myEmpId);
        this.currentUser = this.session.currentUser;
        this.applyRoleScope(risks);
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
        if (this.myAssignments.length) this.viewMode = 'assignments';
      });
  }

  browseAllAccounts(): void {
    this.viewMode = 'accounts';
  }

  backToMyAssignments(): void {
    this.viewMode = 'assignments';
  }

  /** An assessor edits the assessment; reviewers and assessees both work on the review screen. */
  isAssessorOn(row: ItOpsMyAssignmentRow): boolean {
    return (row.roles ?? []).includes('Assessor');
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
    this.router.navigate([this.isAssessorOn(row) ? '/assessment' : '/review', row.domainCode]);
  }

  private applyRoleScope(allTopRisks: TopRisk[]): void {
    if (this.currentUser.role === 'GDH') {
      // Business-level view: all domains within this account, since GDH
      // eligibility is already scoped to the account's own Business Unit.
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

  openAccountDropdown(): void {
    this.accountDropdownOpen = true;
    this.filterAccounts();
  }

  closeAccountDropdown(): void {
    this.accountDropdownOpen = false;
  }

  private filterAccounts(): void {
    const term = this.accountSearch.trim().toLowerCase();
    this.filteredAccounts = !term
      ? this.accounts
      : this.accounts.filter(
          (a) =>
            a.cusT_NM?.toLowerCase().includes(term) ||
            a.industrY_TYPE?.toLowerCase().includes(term),
        );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const comboboxEl = this.accountCombobox?.nativeElement;
    if (this.accountDropdownOpen && comboboxEl && !comboboxEl.contains(event.target as Node)) {
      this.closeAccountDropdown();
    }
  }

  filterAssesseesFromInput(): void {
    this.filterAssessees();
  }

  private filterAssessees(): void {
    const term = this.assesseeSearch.trim().toLowerCase();
    this.filteredAssessees = !term
      ? this.assessees
      : this.assessees.filter(
          (a) =>
            a.name.toLowerCase().includes(term) ||
            a.title.toLowerCase().includes(term),
        );
  }

  assesseeNames(): string {
    return this.selectedAssessees.map((a) => a.name).join(', ');
  }

  selectAccount(account: CustomerModel): void {
    this.accountService.selectAccount(account);
    this.accountSearch = '';
    this.closeAccountDropdown();
  }

  changeAccount(): void {
    this.accountService.clearSelectedAccount();
    this.accountSearch = '';
  }

  toggleAssesseeSelection(assessee: Assessee): void {
    if (this.pendingAssesseeIds.has(assessee.id)) {
      this.pendingAssesseeIds.delete(assessee.id);
    } else {
      this.pendingAssesseeIds.add(assessee.id);
    }
  }

  isAssesseePending(assessee: Assessee): boolean {
    return this.pendingAssesseeIds.has(assessee.id);
  }

  confirmAssesseeSelection(): void {
    const chosen = this.assessees.filter((a) => this.pendingAssesseeIds.has(a.id));
    this.assesseeService.selectAssessees(chosen);
    this.assesseeSearch = '';
  }

  changeAssessee(): void {
    const previousIds = this.selectedAssessees.map((a) => a.id);
    this.assesseeService.changeAssessee();
    // Re-open the picker with whatever was previously chosen still checked
    // (the selectedAssessees$ subscription above just cleared this to empty).
    this.pendingAssesseeIds = new Set(previousIds);
    this.assesseeSearch = '';
  }

  canEditDomain(domain: DomainSummary): boolean {
    return this.currentUser.spocDomainIds.includes(domain.id);
  }

  isPendingMyReview(domain: DomainSummary): boolean {
    return domain.status === 'Pending Review' && this.currentUser.reviewDomainIds.includes(domain.id);
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
}

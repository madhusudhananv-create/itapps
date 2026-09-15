import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ItOpsReportApiService, ReportOption } from '../../services/itops-report-api.service';
import { IdentityService } from '../../services/identity.service';
import { SessionService } from '../../services/session.service';
import { ItOpsMaturityApiService, ItOpsMyAssignmentRow } from '../../services/itops-maturity-api.service';
import { SearchableSelectComponent, SearchableSelectOption } from '../../components/searchable-select/searchable-select.component';
import { ReportRow, AssessmentStatus, ParameterDetailReportRow } from '../../models/maturity.model';

type FilterKey =
  | 'Open'
  | 'Closed'
  | 'Suspended'
  | 'Past Due'
  | 'On Target'
  | 'Draft > 15 days'
  | 'Draft > 30 days'
  | 'No Management Update'
  | 'Long Dated'
  | 'Findings Accepted'
  | 'Findings Rejected'
  | 'Findings Pending';

type SortColumn =
  | 'accountName'
  | 'projectName'
  | 'businessUnit'
  | 'period'
  | 'domainName'
  | 'assessmentStatus'
  | 'dueStatus'
  | 'lastUpdated'
  | 'averageScore'
  | 'maturityPercent';
type ParamSortColumn = 'accountName' | 'businessUnit' | 'period' | 'projectName' | 'domainName' | 'category' | 'parameter' | 'score' | 'findingStatus';

const FILTER_KEYS: FilterKey[] = [
  'Open',
  'Closed',
  'Suspended',
  'Past Due',
  'On Target',
  'Draft > 15 days',
  'Draft > 30 days',
  'No Management Update',
  'Long Dated',
  'Findings Accepted',
  'Findings Rejected',
  'Findings Pending',
];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchableSelectComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  loading = true;
  rowsLoading = false;
  accountCount = 0;

  /** Report Viewer role / ITOps Superuser (Dashboard Viewer no longer implies this - the
   * two grants are independent) - a broad grant that shows every account regardless of the viewer's own
   * SPOC/Reviewer/GDH assignments. The Parameter Detail report (no per-row SPOC/Reviewer
   * email columns to check against) is only offered to viewers who already have this
   * broad grant; everyone else still sees the Domain Assessment Report, row-filtered to
   * just their own involvement (see SessionService.canSeeRow). */
  hasFullAccess = false;
  /** Assessor/reviewer/assessee on at least one assessment anywhere - unlocks Reports (both, now that they're scoped via the filter dropdowns) even without the broad grant above. */
  hasAnyAssignment = false;

  // ---- Report picker ----
  reportOptions: ReportOption[] = [];
  selectedReport = '';

  get reportSelectOptions(): SearchableSelectOption[] {
    return this.reportOptions.map((r) => ({ value: r.displayName, label: r.displayName }));
  }

  get isParameterReport(): boolean {
    return this.selectedReport === ItOpsReportApiService.PARAMETER_REPORT_NAME;
  }

  // ---- Cycle/Business Unit/Account/Project/Domain filters (server-side, drive the SP params) ----
  dashboardCycles: { id: number; cycleLabel: string; status: string }[] = [];
  businessUnits: string[] = [];
  accountsWithAssessments: { cusT_ID: string; cusT_NM: string }[] = [];
  projectsForAccount: { projectId: string; projectName: string }[] = [];
  domainList: { domainId: number; name: string }[] = [];
  projectsLoading = false;

  cycleFilter = '';
  businessUnitFilter = '';
  accountFilter = '';
  projectFilter = '';
  domainFilter = '';

  /** Own-scope (no full Report Viewer/Superuser grant) - every filter dropdown above is restricted to just this employee's own assessor/reviewer/assessee assignments instead of the org-wide lists. */
  private myAssignments: ItOpsMyAssignmentRow[] = [];

  /** Distinct (custId, projectId) pairs this employee is personally assigned to - same derivation the Dashboard's own-scope mode uses. */
  private get myAssignedProjectPairs(): { custId: string; custName: string; projectId: string; projectName: string }[] {
    const seen = new Map<string, { custId: string; custName: string; projectId: string; projectName: string }>();
    for (const row of this.myAssignments) {
      if (!row.custId || !row.projectId) continue;
      if (this.cycleFilter && String(row.assessmentMasterId) !== this.cycleFilter) continue;
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

  get cycleOptions(): SearchableSelectOption[] {
    return this.dashboardCycles.map((c) => ({ value: String(c.id), label: c.cycleLabel }));
  }

  get businessUnitOptions(): SearchableSelectOption[] {
    return this.businessUnits.map((bu) => ({ value: bu, label: bu }));
  }

  get accountOptions2(): SearchableSelectOption[] {
    return this.accountsWithAssessments.map((a) => ({ value: a.cusT_ID, label: a.cusT_NM }));
  }

  get projectOptions(): SearchableSelectOption[] {
    return this.projectsForAccount.map((p) => ({ value: p.projectId, label: p.projectName }));
  }

  get domainOptions(): SearchableSelectOption[] {
    return this.domainList.map((d) => ({ value: String(d.domainId), label: d.name }));
  }

  // ---- Domain Assessment report state ----
  allRows: ReportRow[] = [];
  filteredRows: ReportRow[] = [];
  filterKeys = FILTER_KEYS;
  activeFilters = new Set<FilterKey>();
  sortColumn: SortColumn | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  page = 1;
  readonly pageSize = 25;

  // ---- Parameter Detail report state ----
  paramRows: ParameterDetailReportRow[] = [];
  paramSortColumn: ParamSortColumn | null = null;
  paramSortDirection: 'asc' | 'desc' = 'asc';
  paramPage = 1;

  constructor(
    private reportApi: ItOpsReportApiService,
    private identityService: IdentityService,
    private session: SessionService,
    private maturityApi: ItOpsMaturityApiService,
  ) {}

  ngOnInit(): void {
    const empId = localStorage.getItem('empid');

    this.identityService
      .getMyEmail()
      .pipe(
        switchMap((email) => {
          this.session.setEmail(email);
          return forkJoin({
            reports: this.reportApi.getAvailableReports(),
            access: empId
              ? this.maturityApi.getHasReportAccess(empId)
              : of({ fullAccess: false, hasAnyAssignment: false }),
            cycles: this.maturityApi.getCycleList().pipe(catchError(() => of([]))),
            domains: this.maturityApi.getDomainList().pipe(catchError(() => of([]))),
            businessUnits: this.maturityApi.getBusinessUnits().pipe(catchError(() => of([]))),
            accounts: this.maturityApi.getAccountsWithAssessments().pipe(catchError(() => of([]))),
            myAssignments: empId ? this.maturityApi.getMyAssignments(empId).pipe(catchError(() => of([] as ItOpsMyAssignmentRow[]))) : of([] as ItOpsMyAssignmentRow[]),
          });
        }),
      )
      .subscribe(({ reports, access, cycles, domains, businessUnits, accounts, myAssignments }) => {
        const hasFullAccess = access.fullAccess;
        this.hasFullAccess = hasFullAccess;
        this.hasAnyAssignment = access.hasAnyAssignment;
        this.myAssignments = myAssignments;
        // Both reports are now scoped the same way for an own-scope viewer (their
        // own assigned accounts/projects, via the restricted filter dropdowns and
        // the multi-call aggregate in loadReportData) - Parameter Detail no longer
        // needs the broad Report Viewer/Superuser grant to be
        // offered, just SOME assignment (assessor, reviewer, or assessee).
        // Someone with neither sees no reports at all.
        this.reportOptions = hasFullAccess || this.hasAnyAssignment ? reports : [];
        this.selectedReport =
          this.reportOptions.find((r) => r.displayName === ItOpsReportApiService.DOMAIN_REPORT_NAME)?.displayName ??
          this.reportOptions[0]?.displayName ??
          '';
        this.dashboardCycles = cycles;
        if (hasFullAccess) {
          // Unrestricted - every account/project/domain org-wide, as before.
          this.domainList = domains.map((d) => ({ domainId: d.domainId, name: d.name }));
          this.businessUnits = businessUnits;
          this.accountsWithAssessments = accounts;
        } else {
          // Own-scope: every filter dropdown is restricted to this employee's own
          // assessor/reviewer/assessee assignments instead of the org-wide lists -
          // this is now what actually restricts the data too (see loadReportData's
          // own-scope aggregate), not a row-level post-filter.
          this.refreshOwnScopeFilterOptions();
        }
        this.loading = false;
        this.loadReportData();
      });
  }

  onReportChange(): void {
    this.page = 1;
    this.paramPage = 1;
    this.loadReportData();
  }

  /**
   * Own-scope: rebuilds Business Unit/Account/Project/Domain purely from this
   * employee's own assignments, respecting whichever Cycle/Business Unit/Account
   * is currently selected - the own-scope counterpart of the org-wide
   * getBusinessUnits/getAccountsWithAssessments/getProjectsWithAssessments calls
   * below, which would otherwise leak every other account's name into these
   * dropdowns even though the results themselves are already row-filtered.
   */
  private refreshOwnScopeFilterOptions(): void {
    const buSeen = new Set<string>();
    for (const row of this.myAssignments) {
      if (!row.businessUnit) continue;
      if (this.cycleFilter && String(row.assessmentMasterId) !== this.cycleFilter) continue;
      buSeen.add(row.businessUnit);
    }
    this.businessUnits = Array.from(buSeen).sort();

    const acctSeen = new Map<string, string>();
    for (const p of this.myAssignedProjectPairs) acctSeen.set(p.custId, p.custName);
    this.accountsWithAssessments = Array.from(acctSeen, ([cusT_ID, cusT_NM]) => ({ cusT_ID, cusT_NM }));

    const projSeen = new Map<string, string>();
    for (const p of this.myAssignedProjectPairs) {
      if (this.accountFilter && p.custId !== this.accountFilter) continue;
      projSeen.set(p.projectId, p.projectName);
    }
    this.projectsForAccount = Array.from(projSeen, ([projectId, projectName]) => ({ projectId, projectName }));

    const domSeen = new Map<number, string>();
    for (const row of this.myAssignments) {
      if (this.cycleFilter && String(row.assessmentMasterId) !== this.cycleFilter) continue;
      if (this.businessUnitFilter && row.businessUnit !== this.businessUnitFilter) continue;
      if (this.accountFilter && row.custId !== this.accountFilter) continue;
      if (this.projectFilter && row.projectId !== this.projectFilter) continue;
      if (row.domainId != null && row.domainName) domSeen.set(row.domainId, row.domainName);
    }
    this.domainList = Array.from(domSeen, ([domainId, name]) => ({ domainId, name }));
  }

  /** Business Unit changed - narrows the Account dropdown to only that BU's accounts (cascading Cycle -> Business Unit -> Account -> Project -> Domain), and resets Account/Project since the previous selection may no longer be valid for this BU. */
  onBusinessUnitFilterChange(): void {
    this.accountFilter = '';
    this.projectFilter = '';
    this.projectsForAccount = [];
    if (!this.hasFullAccess) {
      this.refreshOwnScopeFilterOptions();
    } else {
      this.maturityApi
        .getAccountsWithAssessments(this.cycleFilter ? Number(this.cycleFilter) : undefined, this.businessUnitFilter || undefined)
        .pipe(catchError(() => of([])))
        .subscribe((accounts) => (this.accountsWithAssessments = accounts));
    }
    this.loadReportData();
  }

  /** Cycle changed - re-narrows Business Unit's own Account cascade to this cycle, and resets Business Unit/Account/Project since the previous selections may no longer be valid for this cycle. */
  onCycleFilterChange(): void {
    this.businessUnitFilter = '';
    this.accountFilter = '';
    this.projectFilter = '';
    this.projectsForAccount = [];
    if (!this.hasFullAccess) {
      this.refreshOwnScopeFilterOptions();
      this.loadReportData();
      return;
    }
    const cycleId = this.cycleFilter ? Number(this.cycleFilter) : undefined;
    this.maturityApi
      .getBusinessUnits(cycleId)
      .pipe(catchError(() => of([])))
      .subscribe((businessUnits) => (this.businessUnits = businessUnits));
    this.maturityApi
      .getAccountsWithAssessments(cycleId)
      .pipe(catchError(() => of([])))
      .subscribe((accounts) => (this.accountsWithAssessments = accounts));
    this.loadReportData();
  }

  onDomainFilterChange(): void {
    this.loadReportData();
  }

  /** Account changed - loads that account's projects (empty selection means "All projects"). */
  onAccountFilterChange(): void {
    this.projectFilter = '';
    this.projectsForAccount = [];
    if (!this.hasFullAccess) {
      this.refreshOwnScopeFilterOptions();
      this.loadReportData();
      return;
    }
    if (this.accountFilter) {
      this.projectsLoading = true;
      this.maturityApi
        .getProjectsWithAssessments(this.accountFilter)
        .pipe(catchError(() => of([])))
        .subscribe((projects) => {
          this.projectsForAccount = projects;
          this.projectsLoading = false;
        });
    }
    this.loadReportData();
  }

  onProjectFilterChange(): void {
    this.loadReportData();
  }

  private loadReportData(): void {
    if (!this.selectedReport) return;
    // Own-scope: MyEmpId narrows every row to assessments this employee is personally
    // an assessor/reviewer/assessee on - without it, CustomerId/ProjectId alone let a
    // project they have ONE assignment on leak every OTHER domain on that same project
    // into their report (same class of bug the Dashboard's myEmpId param fixes).
    const myEmpId = this.hasFullAccess ? '-1' : localStorage.getItem('empid') || '-1';
    const filterValues: Record<string, string> = {
      CustomerId: this.accountFilter || '-1',
      ProjectId: this.projectFilter || '-1',
      DomainId: this.domainFilter || '-1',
      AssessmentMasterId: this.cycleFilter || '-1',
      BusinessUnit: this.businessUnitFilter || '-1',
      MyEmpId: myEmpId,
    };

    // Own-scope, no specific project chosen: neither report SP accepts a list
    // of projects, so - same fix as the Dashboard's own-scope aggregation -
    // fan out one call per project this employee is actually assigned to
    // (assessor, reviewer, OR assessee; narrowed to the chosen account, if
    // any) and merge the rows client-side. This is what actually restricts the
    // data now - a "just filter the rows afterward" check would have to know
    // every possible ownership shape (it previously missed Assessee entirely,
    // which is why an assessee-only viewer saw nothing even for their own
    // assessment). Once a specific project IS chosen, it's inherently theirs
    // (the dropdown only ever offers their own), so a single plain call is enough.
    const useOwnScopeAggregate = !this.hasFullAccess && !this.projectFilter;
    const ownScopePairs = useOwnScopeAggregate
      ? this.myAssignedProjectPairs.filter((p) => !this.accountFilter || p.custId === this.accountFilter)
      : [];

    this.rowsLoading = true;
    if (this.isParameterReport) {
      if (useOwnScopeAggregate) {
        if (!ownScopePairs.length) {
          this.paramRows = [];
          this.rowsLoading = false;
          this.paramPage = 1;
          return;
        }
        forkJoin(
          ownScopePairs.map((p) =>
            this.reportApi.getParameterDetailReportRows({ ...filterValues, CustomerId: p.custId, ProjectId: p.projectId }),
          ),
        ).subscribe((lists) => {
          this.paramRows = lists.flat();
          this.rowsLoading = false;
          this.paramPage = 1;
        });
        return;
      }
      this.reportApi.getParameterDetailReportRows(filterValues).subscribe((rows) => {
        this.paramRows = rows;
        this.rowsLoading = false;
        this.paramPage = 1;
      });
      return;
    }

    const domainRows$ = useOwnScopeAggregate
      ? ownScopePairs.length
        ? forkJoin(
            ownScopePairs.map((p) => this.reportApi.getDomainReportRows({ ...filterValues, CustomerId: p.custId, ProjectId: p.projectId })),
          ).pipe(map((lists) => lists.flat()))
        : of([] as ReportRow[])
      : this.reportApi.getDomainReportRows(filterValues);

    domainRows$.subscribe((rows) => {
      this.allRows = rows;
      this.accountCount = new Set(this.allRows.map((r) => r.accountName)).size;
      this.rowsLoading = false;
      this.applyFilters();
    });
  }

  toggleFilter(key: FilterKey): void {
    if (this.activeFilters.has(key)) {
      this.activeFilters.delete(key);
    } else {
      this.activeFilters.add(key);
    }
    this.applyFilters();
  }

  isFilterActive(key: FilterKey): boolean {
    return this.activeFilters.has(key);
  }

  clearFilters(): void {
    this.activeFilters.clear();
    this.applyFilters();
  }

  private matchesFilter(row: ReportRow, key: FilterKey): boolean {
    switch (key) {
      case 'Open':
        return row.assessmentStatus === 'Open';
      case 'Closed':
        return row.assessmentStatus === 'Closed';
      case 'Suspended':
        return row.assessmentStatus === 'Suspended';
      case 'Past Due':
        return row.dueStatus === 'Past Due';
      case 'On Target':
        return row.dueStatus === 'On Target';
      case 'Draft > 15 days':
        return row.draftOver15Days;
      case 'Draft > 30 days':
        return row.draftOver30Days;
      case 'No Management Update':
        return row.noManagementUpdate;
      case 'Long Dated':
        return row.longDated;
      case 'Findings Accepted':
        return row.findingsAccepted > 0;
      case 'Findings Rejected':
        return row.findingsRejected > 0;
      case 'Findings Pending':
        return row.findingsPending > 0;
    }
  }

  private applyFilters(): void {
    let rows = this.allRows;
    if (this.activeFilters.size) {
      rows = rows.filter((r) => Array.from(this.activeFilters).every((key) => this.matchesFilter(r, key)));
    }
    this.filteredRows = rows;
    this.page = 1;
  }

  /** "At a glance" counts across every currently-filtered row, unaffected by pagination. */
  get summary(): { total: number; pastDue: number; noMgmtUpdate: number; findingsPending: number } {
    return {
      total: this.filteredRows.length,
      pastDue: this.filteredRows.filter((r) => r.dueStatus === 'Past Due').length,
      noMgmtUpdate: this.filteredRows.filter((r) => r.noManagementUpdate).length,
      findingsPending: this.filteredRows.filter((r) => r.findingsPending > 0).length,
    };
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
  }

  sortIndicator(column: SortColumn): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  get sortedRows(): ReportRow[] {
    if (!this.sortColumn) return this.filteredRows;
    const column = this.sortColumn;
    const factor = this.sortDirection === 'asc' ? 1 : -1;
    const valueOf = (r: ReportRow): string | number => {
      switch (column) {
        case 'accountName': return r.accountName ?? '';
        case 'projectName': return r.projectName ?? '';
        case 'businessUnit': return r.businessUnit ?? '';
        case 'period': return r.period ?? '';
        case 'domainName': return r.domainName ?? '';
        case 'assessmentStatus': return r.assessmentStatus ?? '';
        case 'dueStatus': return r.dueStatus ?? '';
        case 'lastUpdated': return r.lastUpdated ?? '';
        case 'averageScore': return r.averageScore ?? -1;
        case 'maturityPercent': return r.maturityPercent ?? -1;
      }
    };
    return [...this.filteredRows].sort((a, b) => {
      const av = valueOf(a);
      const bv = valueOf(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedRows.length / this.pageSize));
  }

  get pagedRows(): ReportRow[] {
    const rows = this.sortedRows;
    const clampedPage = Math.min(this.page, this.totalPages);
    const start = (clampedPage - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  get currentPage(): number {
    return Math.min(this.page, this.totalPages);
  }

  get rangeLabel(): string {
    const total = this.sortedRows.length;
    if (!total) return '0 of 0';
    const clampedPage = Math.min(this.page, this.totalPages);
    const start = (clampedPage - 1) * this.pageSize + 1;
    const end = Math.min(total, start + this.pageSize - 1);
    return `${start}-${end} of ${total}`;
  }

  goToPage(page: number): void {
    this.page = Math.min(Math.max(1, page), this.totalPages);
  }

  // ---- Parameter Detail report: sort + pagination ----
  paramSortBy(column: ParamSortColumn): void {
    if (this.paramSortColumn === column) {
      this.paramSortDirection = this.paramSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.paramSortColumn = column;
      this.paramSortDirection = 'asc';
    }
    this.paramPage = 1;
  }

  paramSortIndicator(column: ParamSortColumn): string {
    if (this.paramSortColumn !== column) return '';
    return this.paramSortDirection === 'asc' ? '▲' : '▼';
  }

  get sortedParamRows(): ParameterDetailReportRow[] {
    if (!this.paramSortColumn) return this.paramRows;
    const column = this.paramSortColumn;
    const factor = this.paramSortDirection === 'asc' ? 1 : -1;
    const valueOf = (r: ParameterDetailReportRow): string | number => {
      switch (column) {
        case 'accountName': return r.accountName ?? '';
        case 'businessUnit': return r.businessUnit ?? '';
        case 'period': return r.period ?? '';
        case 'projectName': return r.projectName ?? '';
        case 'domainName': return r.domainName ?? '';
        case 'category': return r.category ?? '';
        case 'parameter': return r.parameter ?? '';
        case 'score': return r.score ?? -1;
        case 'findingStatus': return r.findingStatus ?? '';
      }
    };
    return [...this.paramRows].sort((a, b) => {
      const av = valueOf(a);
      const bv = valueOf(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }

  get paramTotalPages(): number {
    return Math.max(1, Math.ceil(this.sortedParamRows.length / this.pageSize));
  }

  get pagedParamRows(): ParameterDetailReportRow[] {
    const rows = this.sortedParamRows;
    const clampedPage = Math.min(this.paramPage, this.paramTotalPages);
    const start = (clampedPage - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  get paramCurrentPage(): number {
    return Math.min(this.paramPage, this.paramTotalPages);
  }

  get paramRangeLabel(): string {
    const total = this.sortedParamRows.length;
    if (!total) return '0 of 0';
    const clampedPage = Math.min(this.paramPage, this.paramTotalPages);
    const start = (clampedPage - 1) * this.pageSize + 1;
    const end = Math.min(total, start + this.pageSize - 1);
    return `${start}-${end} of ${total}`;
  }

  goToParamPage(page: number): void {
    this.paramPage = Math.min(Math.max(1, page), this.paramTotalPages);
  }

  findingPill(status: string | null): string {
    if (status === 'Accepted' || status === 'Closed') return 'pill-good';
    if (status === 'Rejected') return 'pill-critical';
    if (status === 'Open') return 'pill-info';
    return 'pill-muted';
  }

  statusPill(status: AssessmentStatus): string {
    if (status === 'Closed') return 'pill-good';
    if (status === 'Suspended') return 'pill-muted';
    return 'pill-info';
  }

  duePill(due: string | null): string {
    return due === 'Past Due' ? 'pill-critical' : 'pill-good';
  }

  formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async exportToExcel(): Promise<void> {
    const XLSX = await import('xlsx');

    if (this.isParameterReport) {
      const exportRows = this.paramRows.map((r) => ({
        Account: r.accountName,
        'Business Unit': r.businessUnit,
        Project: r.projectName,
        Period: r.period,
        'Technology Domain': r.domainName,
        Category: r.category,
        Parameter: r.parameter,
        Question: r.question,
        Score: r.score ?? '',
        Assessor: r.assessor,
        Reviewer: r.reviewer,
        Assessee: r.assessee ?? '',
        'Finding Status': r.findingStatus ?? '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet['!cols'] = Object.keys(exportRows[0] ?? {}).map((key) => ({ wch: Math.max(14, key.length + 2) }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Parameter Detail Report');
      XLSX.writeFile(workbook, `IT-Ops-Parameter-Detail-Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      return;
    }

    const exportRows = this.filteredRows.map((r) => ({
      'Business Unit': r.businessUnit,
      'Account Name': r.accountName,
      Project: r.projectName,
      Period: r.period,
      'Technology Domain': r.domainName,
      'COE SPOC': r.coeSpoc,
      Reviewer: r.reviewer,
      'Assessment Status': r.assessmentStatus,
      'Due Status': r.dueStatus ?? '',
      'Target Completion Date': this.formatDate(r.targetDate),
      'Last Updated': this.formatDate(r.lastUpdated),
      'Days Since Update': r.daysSinceUpdate,
      'Draft > 15 Days': r.draftOver15Days ? 'Yes' : 'No',
      'Draft > 30 Days': r.draftOver30Days ? 'Yes' : 'No',
      'No Management Update': r.noManagementUpdate ? 'Yes' : 'No',
      'Long Dated': r.longDated ? 'Yes' : 'No',
      'Findings Accepted': r.findingsAccepted,
      'Findings Rejected': r.findingsRejected,
      'Findings Pending': r.findingsPending,
      'Average Score': r.averageScore ?? '',
      'Maturity %': r.maturityPercent ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet['!cols'] = Object.keys(exportRows[0] ?? {}).map((key) => ({ wch: Math.max(14, key.length + 2) }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'IT Ops Maturity Report');

    const fileName = `IT-Ops-Maturity-Report_All-Accounts_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}

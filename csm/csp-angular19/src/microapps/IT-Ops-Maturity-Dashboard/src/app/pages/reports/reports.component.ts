import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ItOpsReportApiService, ReportOption } from '../../services/itops-report-api.service';
import { IdentityService } from '../../services/identity.service';
import { SessionService } from '../../services/session.service';
import { ItOpsMaturityApiService } from '../../services/itops-maturity-api.service';
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

  /** Dashboard Viewer role / ITOps Superuser - same broad grant the Dashboard itself uses
   * to show every account regardless of the viewer's own SPOC/Reviewer/GDH assignments.
   * The Parameter Detail report (no per-row SPOC/Reviewer email columns to check against)
   * is only offered to viewers who already have this broad grant. */
  hasFullAccess = false;

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
            hasFullAccess: empId ? this.maturityApi.getHasDashboardAccess(empId) : of(false),
            cycles: this.maturityApi.getCycleList().pipe(catchError(() => of([]))),
            domains: this.maturityApi.getDomainList().pipe(catchError(() => of([]))),
            businessUnits: this.maturityApi.getBusinessUnits().pipe(catchError(() => of([]))),
            accounts: this.maturityApi.getAccountsWithAssessments().pipe(catchError(() => of([]))),
          });
        }),
      )
      .subscribe(({ reports, hasFullAccess, cycles, domains, businessUnits, accounts }) => {
        this.hasFullAccess = hasFullAccess;
        // The Parameter Detail report has no per-row SPOC/Reviewer email columns to check
        // against, so it's only offered to viewers who already hold the broad Dashboard
        // Viewer/Superuser grant - everyone else only sees the Domain Assessment report.
        this.reportOptions = hasFullAccess
          ? reports
          : reports.filter((r) => r.displayName !== ItOpsReportApiService.PARAMETER_REPORT_NAME);
        this.selectedReport =
          this.reportOptions.find((r) => r.displayName === ItOpsReportApiService.DOMAIN_REPORT_NAME)?.displayName ??
          this.reportOptions[0]?.displayName ??
          '';
        this.dashboardCycles = cycles;
        this.domainList = domains.map((d) => ({ domainId: d.domainId, name: d.name }));
        this.businessUnits = businessUnits;
        this.accountsWithAssessments = accounts;
        this.loading = false;
        this.loadReportData();
      });
  }

  onReportChange(): void {
    this.page = 1;
    this.paramPage = 1;
    this.loadReportData();
  }

  /** Business Unit changed - narrows the Account dropdown to only that BU's accounts (cascading Cycle -> Business Unit -> Account -> Project -> Domain), and resets Account/Project since the previous selection may no longer be valid for this BU. */
  onBusinessUnitFilterChange(): void {
    this.accountFilter = '';
    this.projectFilter = '';
    this.projectsForAccount = [];
    this.maturityApi
      .getAccountsWithAssessments(this.cycleFilter ? Number(this.cycleFilter) : undefined, this.businessUnitFilter || undefined)
      .pipe(catchError(() => of([])))
      .subscribe((accounts) => (this.accountsWithAssessments = accounts));
    this.loadReportData();
  }

  /** Cycle changed - re-narrows Business Unit's own Account cascade to this cycle, and resets Business Unit/Account/Project since the previous selections may no longer be valid for this cycle. */
  onCycleFilterChange(): void {
    this.businessUnitFilter = '';
    this.accountFilter = '';
    this.projectFilter = '';
    this.projectsForAccount = [];
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
    const filterValues: Record<string, string> = {
      CustomerId: this.accountFilter || '-1',
      ProjectId: this.projectFilter || '-1',
      DomainId: this.domainFilter || '-1',
      AssessmentMasterId: this.cycleFilter || '-1',
      BusinessUnit: this.businessUnitFilter || '-1',
    };

    this.rowsLoading = true;
    if (this.isParameterReport) {
      this.reportApi.getParameterDetailReportRows(filterValues).subscribe((rows) => {
        this.paramRows = rows;
        this.rowsLoading = false;
        this.paramPage = 1;
      });
      return;
    }

    this.reportApi.getDomainReportRows(filterValues).subscribe((rows) => {
      this.allRows = this.hasFullAccess ? rows : rows.filter((row) => this.session.canSeeRow(row));
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ItOpsReportApiService } from '../../services/itops-report-api.service';
import { IdentityService } from '../../services/identity.service';
import { SessionService } from '../../services/session.service';
import { ReportRow, AssessmentStatus } from '../../models/maturity.model';

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

type SortColumn = 'accountName' | 'domainName' | 'assessmentStatus' | 'dueStatus' | 'lastUpdated' | 'averageScore' | 'maturityPercent';

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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  loading = true;
  accountCount = 0;

  allRows: ReportRow[] = [];
  filteredRows: ReportRow[] = [];

  filterKeys = FILTER_KEYS;
  activeFilters = new Set<FilterKey>();

  accountFilter = '';
  accountOptions: string[] = [];

  sortColumn: SortColumn | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  page = 1;
  readonly pageSize = 25;

  constructor(
    private reportApi: ItOpsReportApiService,
    private identityService: IdentityService,
    private session: SessionService,
  ) {}

  ngOnInit(): void {
    this.identityService
      .getMyEmail()
      .pipe(
        switchMap((email) => {
          this.session.setEmail(email);
          return this.reportApi.getReportRows();
        }),
      )
      .subscribe((rows) => {
        this.allRows = rows.filter((row) => this.session.canSeeRow(row));
        this.accountOptions = Array.from(new Set(this.allRows.map((r) => r.accountName))).sort((a, b) => a.localeCompare(b));
        this.accountCount = this.accountOptions.length;
        this.loading = false;
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

  onFilterSelectChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.activeFilters.clear();
    this.accountFilter = '';
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
    if (this.accountFilter) {
      rows = rows.filter((r) => r.accountName === this.accountFilter);
    }
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
    const exportRows = this.filteredRows.map((r) => ({
      'Business Unit': r.businessUnit,
      'Account Name': r.accountName,
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

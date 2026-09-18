import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { MaturityMockService } from '../../services/maturity-mock.service';
import { AccountService } from '../../services/account.service';
import { BusinessUnitService } from '../../services/business-unit.service';
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

  constructor(
    private maturityService: MaturityMockService,
    private accountService: AccountService,
    private businessUnitService: BusinessUnitService,
    private identityService: IdentityService,
    private session: SessionService,
  ) {}

  ngOnInit(): void {
    this.identityService
      .getMyEmail()
      .pipe(
        switchMap((email) => {
          this.session.setEmail(email);
          return this.accountService.getAccounts();
        }),
        switchMap((accounts) => {
          this.accountCount = accounts.length;
          if (!accounts.length) return of([]);
          const perAccount = accounts.map((account) =>
            this.businessUnitService.getBusinessUnitForAccount(String(account.cusT_ID)).pipe(
              switchMap((bu) => this.maturityService.getReportRows(account.cusT_NM, bu)),
            ),
          );
          return forkJoin(perAccount);
        }),
      )
      .subscribe((rowsPerAccount) => {
        this.allRows = rowsPerAccount.flat().filter((row) => this.session.canSeeRow(row));
        this.accountOptions = Array.from(new Set(this.allRows.map((r) => r.accountName))).sort((a, b) => a.localeCompare(b));
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

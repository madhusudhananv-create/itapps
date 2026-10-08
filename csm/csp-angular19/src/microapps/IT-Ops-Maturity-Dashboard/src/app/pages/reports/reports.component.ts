import { Component, OnInit, HostListener } from '@angular/core';
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
import { maturityLevelLabel } from '../../utils/rubric.util';

type FilterKey =
  | 'Open'
  | 'In Progress'
  | 'Completed'
  | 'Suspended'
  | 'Past Due'
  | 'On Target'
  | 'Draft > 15 days'
  | 'Draft > 30 days';

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
  'In Progress',
  'Completed',
  'Suspended',
  'Past Due',
  'On Target',
  'Draft > 15 days',
  'Draft > 30 days',
];

/** Parameter Detail report's own quick filters - mirrors row.findingStatus ('Accepted'/'Rejected'/'Open'/'Closed', shown as 'Pending' for Open - see findingPill). */
type ParamFilterKey = 'Findings Accepted' | 'Findings Rejected' | 'Findings Pending' | 'Findings Closed';
const PARAM_FILTER_KEYS: ParamFilterKey[] = ['Findings Accepted', 'Findings Rejected', 'Findings Pending', 'Findings Closed'];

/** The Reports page's column list/order/labels are built ENTIRELY from whatever the report
 * SP actually returns (ReportRow.rawColumns / ParameterDetailReportRow.rawColumns, captured
 * in the SP's own SELECT order) - not from a fixed Angular field list. Adding a column to
 * the SP is enough on its own for a new plain-text column to appear on screen and in the
 * Excel export.
 *
 * The one thing that still needs a one-line code change is deciding a column's VISUAL
 * STYLE - whether it renders as plain text or as something bespoke like a status pill, a
 * findings badge cluster, or the maturity bar. That's exactly what DOMAIN_COLUMN_STYLES/
 * PARAM_COLUMN_STYLES below are: a lookup from raw SP column name to a render style. A
 * column with no entry here still renders (as plain wrapped text) - the lookup only
 * upgrades a handful of columns to a richer visual. `group` folds several raw columns that
 * together make up one visual (e.g. dueStatus + lastUpdated + longDated -> one "Due /
 * Updated" cell) into a single emitted column, positioned at the first of its raw columns. */
type ColumnRenderer =
  | 'text' | 'wrap' | 'question' | 'date' | 'num'
  | 'status-pill' | 'finding-status-pill'
  | 'due-updated' | 'findings' | 'maturity-bar' | 'maturity-level' | 'last-activity' | 'score-with-min';

interface ColumnDef {
  key: string;
  label: string;
  renderer: ColumnRenderer;
  sortKey?: SortColumn | ParamSortColumn;
  title?: string;
}

interface ColumnStyle {
  renderer: ColumnRenderer;
  sortKey?: SortColumn | ParamSortColumn;
  title?: string;
  /** When set, this raw column doesn't emit its own <th>/<td> - it's one of the raw
   * columns that together make up the named group's single composite column. */
  group?: string;
}

/** groupId -> the virtual column(s) that group emits, in order, once (at the position of
 * whichever of its member raw columns appears first in the SP's SELECT list). */
const COLUMN_GROUPS: Record<string, ColumnDef[]> = {
  'due-updated': [{ key: 'due-updated', label: 'Due / Updated', renderer: 'due-updated', sortKey: 'dueStatus' }],
  findings: [{ key: 'findings', label: 'Findings', renderer: 'findings' }],
  maturity: [
    { key: 'maturity-bar', label: 'Maturity %', renderer: 'maturity-bar', sortKey: 'maturityPercent' },
    { key: 'maturity-level', label: 'Maturity Level', renderer: 'maturity-level' },
  ],
  'last-activity': [{ key: 'last-activity', label: 'Last Activity', renderer: 'last-activity' }],
  score: [{ key: 'score', label: 'Score', renderer: 'score-with-min', sortKey: 'score' }],
};

const DOMAIN_COLUMN_STYLES: Record<string, ColumnStyle> = {
  account: { renderer: 'text', sortKey: 'accountName' },
  project: { renderer: 'wrap', sortKey: 'projectName' },
  businessunit: { renderer: 'wrap', sortKey: 'businessUnit' },
  period: { renderer: 'text', sortKey: 'period' },
  domainname: { renderer: 'wrap', sortKey: 'domainName' },
  assessor: { renderer: 'wrap' },
  reviewer: { renderer: 'wrap' },
  assessee: { renderer: 'wrap' },
  assessoremail: { renderer: 'wrap' },
  revieweremail: { renderer: 'wrap' },
  assessmentstatus: { renderer: 'status-pill', sortKey: 'assessmentStatus' },
  duestatus: { renderer: 'text', group: 'due-updated' },
  targetdate: { renderer: 'date' },
  returncomment: { renderer: 'wrap' },
  lastupdated: { renderer: 'text', group: 'due-updated' },
  daysinceupdate: { renderer: 'text', group: 'due-updated' },
  draftover15days: { renderer: 'text', group: 'due-updated' },
  draftover30days: { renderer: 'text', group: 'due-updated' },
  nomanagementupdate: { renderer: 'text', group: 'due-updated' },
  longdated: { renderer: 'text', group: 'due-updated' },
  findingsaccepted: { renderer: 'text', group: 'findings' },
  findingsrejected: { renderer: 'text', group: 'findings' },
  findingspending: { renderer: 'text', group: 'findings' },
  findingsclosed: { renderer: 'num' },
  totalfindingsraised: { renderer: 'num', title: 'Every finding ever raised on this assessment, across all statuses' },
  overduefindingscount: { renderer: 'num', title: 'Open findings whose target date has already passed' },
  escalationcount: { renderer: 'num', title: "Distinct findings disputed (Assessor re-rejected the Assessee's rejection) at least once" },
  lastactivitytype: { renderer: 'text', group: 'last-activity' },
  lastactivitydate: { renderer: 'text', group: 'last-activity' },
  createddate: { renderer: 'date' },
  createdby: { renderer: 'wrap' },
  updateddate: { renderer: 'date' },
  updatedby: { renderer: 'wrap' },
  averagescore: { renderer: 'text', group: 'maturity' },
  maturitypercent: { renderer: 'text', group: 'maturity' },
  paramcount: { renderer: 'num', title: 'No. of Parameters - every currently-effective parameter in the domain' },
  applicableparamcount: { renderer: 'num', title: 'No of Applicable Parameters - how many were actually scored' },
  sumscores: { renderer: 'num' },
  maxpossible: { renderer: 'num' },
};

const PARAM_COLUMN_STYLES: Record<string, ColumnStyle> = {
  account: { renderer: 'text', sortKey: 'accountName' },
  businessunit: { renderer: 'wrap', sortKey: 'businessUnit' },
  project: { renderer: 'wrap', sortKey: 'projectName' },
  period: { renderer: 'text', sortKey: 'period' },
  domainname: { renderer: 'wrap', sortKey: 'domainName' },
  category: { renderer: 'wrap', sortKey: 'category' },
  parameter: { renderer: 'wrap', sortKey: 'parameter' },
  question: { renderer: 'question' },
  score: { renderer: 'text', group: 'score' },
  minrequiredscore: { renderer: 'text', group: 'score' },
  maxrequiredscore: { renderer: 'num' },
  targetdate: { renderer: 'date' },
  createddate: { renderer: 'date' },
  createdby: { renderer: 'wrap' },
  updateddate: { renderer: 'date' },
  updatedby: { renderer: 'wrap' },
  assessor: { renderer: 'wrap' },
  reviewer: { renderer: 'wrap' },
  assessee: { renderer: 'wrap' },
  findingstatus: { renderer: 'finding-status-pill', sortKey: 'findingStatus' },
  assessorcomments: { renderer: 'wrap' },
  assesseeacceptcomments: { renderer: 'wrap' },
  assesseerejectcomments: { renderer: 'wrap' },
  assessordisputecomments: { renderer: 'wrap' },
  assessmentstatus: { renderer: 'status-pill' },
};

/** Turns a raw SQL alias like "cloudProvider" into a readable column label ("Cloud
 * Provider") for a column nobody wrote a style entry for. */
function labelFromKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
  return spaced.trim();
}

function buildColumns(
  rows: { rawColumns: { key: string; value: any }[] }[],
  styles: Record<string, ColumnStyle>,
): ColumnDef[] {
  const order = rows[0]?.rawColumns.map((c) => c.key) ?? [];
  const result: ColumnDef[] = [];
  const emittedGroups = new Set<string>();
  for (const key of order) {
    const style = styles[key.toLowerCase()];
    if (style?.group) {
      if (emittedGroups.has(style.group)) continue;
      emittedGroups.add(style.group);
      result.push(...(COLUMN_GROUPS[style.group] ?? []));
      continue;
    }
    // Label always comes from the SP's own column name, never a hand-typed override - a
    // renamed SP alias renames the header/export column too, no Angular change needed.
    if (style) {
      result.push({ key, label: labelFromKey(key), renderer: style.renderer, sortKey: style.sortKey, title: style.title });
    } else {
      result.push({ key, label: labelFromKey(key), renderer: 'wrap' });
    }
  }
  return result;
}

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
  /** Non-empty when this employee is a GDH (not an explicit Report Viewer/Superuser) - restricts the Business Unit filter (and everything it cascades to) to just these BU(s), see applyGdhBuRestriction(). */
  gdhBusinessUnits: string[] = [];

  /** GDH restriction, applied everywhere a full-access org-wide Business Unit list is loaded. */
  private applyGdhBuRestriction(businessUnits: string[]): string[] {
    if (!this.gdhBusinessUnits.length) return businessUnits;
    return businessUnits.filter((bu) => this.gdhBusinessUnits.some((gdhBu) => gdhBu.toLowerCase() === bu.toLowerCase()));
  }

  // ---- Report picker ----
  reportOptions: ReportOption[] = [];
  selectedReport = '';

  get reportSelectOptions(): SearchableSelectOption[] {
    return this.reportOptions.map((r) => ({ value: r.displayName, label: r.displayName }));
  }

  get isParameterReport(): boolean {
    return this.selectedReport === ItOpsReportApiService.PARAMETER_REPORT_NAME;
  }

  // ---- Column picker (show/hide columns) ----
  // Keyed by column key, per report (domain vs parameter), so switching tabs doesn't carry
  // one report's hidden columns onto the other's unrelated column set. A key with no entry
  // reads as visible - this is what makes a brand-new SP column (one nobody has ever
  // explicitly hidden) show up checked/visible automatically, with zero code change here.
  domainColumnVisibility: Record<string, boolean> = {};
  paramColumnVisibility: Record<string, boolean> = {};
  columnMenuOpen = false;
  columnSearchText = '';

  get activeColumns(): ColumnDef[] {
    return this.isParameterReport ? this.dynamicParamColumns : this.dynamicDomainColumns;
  }

  /** dynamicDomainColumns/dynamicParamColumns rebuild a brand-new ColumnDef[] (new object
   * identities) on every call, since they're plain getters over buildColumns() - without a
   * trackBy, *ngFor's default identity-based diffing treats every re-render as "remove all,
   * add all", tearing down and recreating every checkbox's DOM node on each toggle (and on
   * any unrelated change detection pass) - a known cause of a checkbox toggle not sticking
   * visually. Tracking by the column's own key keeps each row's DOM node stable instead. */
  trackByColKey(_index: number, col: ColumnDef): string {
    return col.key;
  }

  private get activeColumnVisibility(): Record<string, boolean> {
    return this.isParameterReport ? this.paramColumnVisibility : this.domainColumnVisibility;
  }

  isColumnVisible(key: string): boolean {
    return this.activeColumnVisibility[key] !== false;
  }

  toggleColumn(key: string): void {
    this.activeColumnVisibility[key] = !this.isColumnVisible(key);
  }

  get allColumnsSelected(): boolean {
    return this.activeColumns.every((c) => this.isColumnVisible(c.key));
  }

  toggleAllColumns(): void {
    const newState = !this.allColumnsSelected;
    const visibility = this.activeColumnVisibility;
    this.activeColumns.forEach((c) => (visibility[c.key] = newState));
  }

  get visibleColumnCount(): number {
    return this.activeColumns.filter((c) => this.isColumnVisible(c.key)).length;
  }

  get hasScrollableColumns(): boolean {
    return this.activeColumns.length > 8;
  }

  get filteredColumnNames(): ColumnDef[] {
    const q = this.columnSearchText.toLowerCase().trim();
    return q ? this.activeColumns.filter((c) => c.label.toLowerCase().includes(q)) : this.activeColumns;
  }

  get visibleDomainColumns(): ColumnDef[] {
    return this.dynamicDomainColumns.filter((c) => this.domainColumnVisibility[c.key] !== false);
  }

  get visibleParamColumns(): ColumnDef[] {
    return this.dynamicParamColumns.filter((c) => this.paramColumnVisibility[c.key] !== false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.columnMenuOpen) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.col-picker-wrap')) this.columnMenuOpen = false;
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
  pageSize = 25;
  readonly pageSizeOptions = [25, 50, 100];
  /** Free-text match across account/project/domain/COE SPOC/reviewer - same idea for both reports, no server round trip since everything's already loaded. */
  searchText = '';

  // ---- Parameter Detail report state ----
  paramRows: ParameterDetailReportRow[] = [];
  filteredParamRows: ParameterDetailReportRow[] = [];
  paramFilterKeys = PARAM_FILTER_KEYS;
  activeParamFilters = new Set<ParamFilterKey>();
  paramSortColumn: ParamSortColumn | null = null;
  paramSortDirection: 'asc' | 'desc' = 'asc';
  paramPage = 1;
  paramSearchText = '';

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
              : of({ fullAccess: false, hasAnyAssignment: false, isGdh: false, gdhBusinessUnits: [] as string[] }),
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
        this.gdhBusinessUnits = access.gdhBusinessUnits ?? [];
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
          // Unrestricted - every account/project/domain org-wide, as before -
          // except a GDH (no explicit Report Viewer/Superuser grant) is still
          // narrowed to their own configured Business Unit(s).
          this.domainList = domains.map((d) => ({ domainId: d.domainId, name: d.name }));
          this.businessUnits = this.applyGdhBuRestriction(businessUnits);
          if (this.gdhBusinessUnits.length) {
            this.businessUnitFilter = this.businessUnits[0] ?? '';
            this.maturityApi
              .getAccountsWithAssessments(undefined, this.businessUnitFilter || undefined)
              .pipe(catchError(() => of([])))
              .subscribe((scopedAccounts) => (this.accountsWithAssessments = scopedAccounts));
          } else {
            this.accountsWithAssessments = accounts;
          }
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
    this.columnMenuOpen = false;
    this.columnSearchText = '';
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
      .subscribe((businessUnits) => {
        this.businessUnits = this.applyGdhBuRestriction(businessUnits);
        if (this.gdhBusinessUnits.length) {
          this.businessUnitFilter = this.businessUnits[0] ?? '';
          this.maturityApi
            .getAccountsWithAssessments(cycleId, this.businessUnitFilter || undefined)
            .pipe(catchError(() => of([])))
            .subscribe((accounts) => (this.accountsWithAssessments = accounts));
        }
      });
    if (!this.gdhBusinessUnits.length) {
      this.maturityApi
        .getAccountsWithAssessments(cycleId)
        .pipe(catchError(() => of([])))
        .subscribe((accounts) => (this.accountsWithAssessments = accounts));
    }
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
    // Also sent for a GDH (hasFullAccess is true for them too, but the SP still
    // needs their empId to enforce the Business-Unit restriction itself
    // server-side, rather than trusting whichever BU this screen's own filter
    // happens to be set to).
    const myEmpId = this.hasFullAccess && !this.gdhBusinessUnits.length ? '-1' : localStorage.getItem('empid') || '-1';
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
          this.applyParamFilters();
          this.rowsLoading = false;
          return;
        }
        forkJoin(
          ownScopePairs.map((p) =>
            this.reportApi.getParameterDetailReportRows({ ...filterValues, CustomerId: p.custId, ProjectId: p.projectId }),
          ),
        ).subscribe((lists) => {
          this.paramRows = lists.flat();
          this.applyParamFilters();
          this.rowsLoading = false;
        });
        return;
      }
      this.reportApi.getParameterDetailReportRows(filterValues).subscribe((rows) => {
        this.paramRows = rows;
        this.applyParamFilters();
        this.rowsLoading = false;
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

  /** How many of the CURRENT (search-matched) rows this chip would add/remove - lets someone judge a chip's effect before clicking it, without needing every OTHER active chip's restriction applied first (each count is independent of the others). */
  filterCount(key: FilterKey): number {
    const rows = this.searchFilteredRows(this.allRows, this.searchText);
    return rows.filter((r) => this.matchesFilter(r, key)).length;
  }

  paramFilterCount(key: ParamFilterKey): number {
    const rows = this.searchFilteredParamRows(this.paramRows, this.paramSearchText);
    return rows.filter((r) => this.matchesParamFilter(r, key)).length;
  }

  clearFilters(): void {
    this.activeFilters.clear();
    this.applyFilters();
  }

  /** Unlike clearFilters() (chips only, kept for anyone already used to that link), this resets every dropdown, chip, and the search box back to "All" and reloads - the one-click "start over" a user reasonably expects from a "Reset" action. */
  resetAllFilters(): void {
    this.cycleFilter = '';
    this.businessUnitFilter = '';
    this.accountFilter = '';
    this.projectFilter = '';
    this.domainFilter = '';
    this.projectsForAccount = [];
    this.activeFilters.clear();
    this.activeParamFilters.clear();
    this.searchText = '';
    this.paramSearchText = '';
    if (!this.hasFullAccess) {
      this.refreshOwnScopeFilterOptions();
    }
    this.loadReportData();
  }

  private matchesFilter(row: ReportRow, key: FilterKey): boolean {
    switch (key) {
      case 'Open':
        return row.assessmentStatus === 'Open';
      case 'In Progress':
        return row.assessmentStatus === 'InProgress';
      case 'Completed':
        return row.assessmentStatus === 'Completed';
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
    }
  }

  /** Matches account/project/domain/COE SPOC/reviewer - case-insensitive substring, same fields a reader would actually scan the table by. */
  private searchFilteredRows(rows: ReportRow[], text: string): ReportRow[] {
    const q = text.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.accountName, r.projectName, r.domainName, r.assessor, r.reviewer].some((v) => (v ?? '').toLowerCase().includes(q)),
    );
  }

  private searchFilteredParamRows(rows: ParameterDetailReportRow[], text: string): ParameterDetailReportRow[] {
    const q = text.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.accountName, r.projectName, r.domainName, r.parameter, r.assessor, r.reviewer].some((v) => (v ?? '').toLowerCase().includes(q)),
    );
  }

  private applyFilters(): void {
    let rows = this.searchFilteredRows(this.allRows, this.searchText);
    if (this.activeFilters.size) {
      // OR across selected chips, not AND - these are mutually exclusive buckets of the
      // same field (a row can't be both "Open" and "Completed"), so requiring every chip
      // to match at once would always return zero rows once more than one was selected.
      // Selecting several chips means "show me any of these", same as any tag/chip filter.
      rows = rows.filter((r) => Array.from(this.activeFilters).some((key) => this.matchesFilter(r, key)));
    }
    this.filteredRows = rows;
    this.page = 1;
  }

  onSearchTextChange(): void {
    this.applyFilters();
  }

  // ---- Parameter Detail report: quick filters + search ----
  toggleParamFilter(key: ParamFilterKey): void {
    if (this.activeParamFilters.has(key)) {
      this.activeParamFilters.delete(key);
    } else {
      this.activeParamFilters.add(key);
    }
    this.applyParamFilters();
  }

  isParamFilterActive(key: ParamFilterKey): boolean {
    return this.activeParamFilters.has(key);
  }

  clearParamFilters(): void {
    this.activeParamFilters.clear();
    this.applyParamFilters();
  }

  /** findingStatus is a raw backend value - 'Open' is this report's equivalent of the Domain report's "pending" bucket (see findingPill). */
  private matchesParamFilter(row: ParameterDetailReportRow, key: ParamFilterKey): boolean {
    switch (key) {
      case 'Findings Accepted':
        return row.findingStatus === 'Accepted';
      case 'Findings Rejected':
        return row.findingStatus === 'Rejected';
      case 'Findings Pending':
        return row.findingStatus === 'Open';
      case 'Findings Closed':
        return row.findingStatus === 'Closed';
    }
  }

  private applyParamFilters(): void {
    let rows = this.searchFilteredParamRows(this.paramRows, this.paramSearchText);
    if (this.activeParamFilters.size) {
      // OR across selected chips - same reasoning as applyFilters above (Accepted/Rejected/
      // Pending/Closed are mutually exclusive, so AND would always yield zero rows).
      rows = rows.filter((r) => Array.from(this.activeParamFilters).some((key) => this.matchesParamFilter(r, key)));
    }
    this.filteredParamRows = rows;
    this.paramPage = 1;
  }

  onParamSearchTextChange(): void {
    this.applyParamFilters();
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.paramPage = 1;
  }

  /** "At a glance" counts across every currently-filtered row, unaffected by pagination. */
  get summary(): { total: number; pastDue: number; notStarted: number; findingsPending: number } {
    return {
      total: this.filteredRows.length,
      pastDue: this.filteredRows.filter((r) => r.dueStatus === 'Past Due').length,
      notStarted: this.filteredRows.filter((r) => r.assessmentStatus === 'NotStarted').length,
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

  /** Union of every column the report SP is currently returning, styled and ordered per
   * DOMAIN_COLUMN_STYLES/COLUMN_GROUPS (module scope, above the @Component) - see the big
   * comment there for how this stays SP-driven rather than a fixed Angular field list. */
  get dynamicDomainColumns(): ColumnDef[] {
    return buildColumns(this.allRows, DOMAIN_COLUMN_STYLES);
  }

  get dynamicParamColumns(): ColumnDef[] {
    return buildColumns(this.paramRows, PARAM_COLUMN_STYLES);
  }

  /** Looks up one column's raw value on a row for the template's plain-text/date/num
   * renderers - rawColumns is a small array, so a linear find is simpler than indexing. */
  colValue(row: { rawColumns: { key: string; value: any }[] }, key: string): any {
    return row.rawColumns?.find((c) => c.key === key)?.value ?? null;
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
    if (!this.paramSortColumn) return this.filteredParamRows;
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
    return [...this.filteredParamRows].sort((a, b) => {
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
    if (status === 'Completed') return 'pill-optimal';
    if (status === 'Suspended' || status === 'NotStarted') return 'pill-muted';
    if (status === 'InProgress') return 'pill-warning';
    return 'pill-info';
  }

  /** assessmentStatus is a raw backend enum value ('NotStarted'/'InProgress' have no space) - everything else already reads fine as-is. */
  statusLabel(status: AssessmentStatus): string {
    if (status === 'NotStarted') return 'Not Started';
    if (status === 'InProgress') return 'In Progress';
    return status;
  }

  duePill(due: string | null): string {
    return due === 'Past Due' ? 'pill-critical' : 'pill-good';
  }

  /** Same "N - Label" maturity-level bucketing used everywhere else - see maturityLevelLabel in rubric.util.ts. */
  levelLabel(averageScore: number | null): string {
    return maturityLevelLabel(averageScore);
  }

  /** Same 5-level bucketing as levelLabel/maturityLevelLabel - Optimized (a
   * perfect 5) gets its own distinct color rather than collapsing into the
   * same "good" green as Managed (4-4.99), which made the two best levels
   * indistinguishable at a glance. */
  levelPill(averageScore: number | null): string {
    if (averageScore === null || averageScore === undefined) return 'pill-muted';
    if (averageScore === 0) return 'pill-muted';
    if (averageScore < 2) return 'pill-critical';
    if (averageScore < 3) return 'pill-serious';
    if (averageScore < 4) return 'pill-warning';
    if (averageScore < 5) return 'pill-good';
    return 'pill-optimal';
  }

  formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /** Short filename fragment for whichever scope filters are actually set, so a shared export doesn't read as "All accounts" when it's really one account/cycle - falls back to "All-Scope" when nothing's selected. */
  private exportScopeSlug(): string {
    const parts: string[] = [];
    const accountName = this.accountsWithAssessments.find((a) => a.cusT_ID === this.accountFilter)?.cusT_NM;
    if (accountName) parts.push(accountName);
    const cycleLabel = this.dashboardCycles.find((c) => String(c.id) === this.cycleFilter)?.cycleLabel;
    if (cycleLabel) parts.push(cycleLabel);
    if (this.businessUnitFilter) parts.push(this.businessUnitFilter);
    if (!parts.length) return 'All-Scope';
    return parts.map((p) => p.replace(/[^a-z0-9]+/gi, '-')).join('_');
  }

  /** Builds one Excel row purely from the same column list the table renders - so the
   * export always matches what's on screen, and a new SP column lands in both with no
   * separate export code to update. Composite columns (a status pill, the findings badge
   * cluster, the maturity bar) expand back out into their own plain export columns, since
   * a spreadsheet cell can't hold a progress bar. */
  private exportRowFrom(row: any, columns: ColumnDef[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const col of columns) {
      switch (col.renderer) {
        case 'date':
          out[col.label] = this.formatDate(this.colValue(row, col.key));
          break;
        case 'status-pill':
          out[col.label] = this.statusLabel(this.colValue(row, col.key));
          break;
        case 'due-updated':
          out['Due Status'] = row.dueStatus ?? '';
          out['Last Updated'] = this.formatDate(row.lastUpdated);
          break;
        case 'findings':
          out['Findings Accepted'] = row.findingsAccepted;
          out['Findings Rejected'] = row.findingsRejected;
          out['Findings Pending'] = row.findingsPending;
          break;
        case 'maturity-bar':
          out['Average Score'] = row.averageScore ?? '';
          out['Maturity %'] = row.maturityPercent ?? '';
          break;
        case 'maturity-level':
          out['Maturity Level'] = this.levelLabel(row.averageScore);
          break;
        case 'last-activity':
          out['Last Activity Type'] = row.lastActivityType ?? '';
          out['Last Activity Date'] = this.formatDate(row.lastActivityDate);
          break;
        case 'score-with-min':
          out['Score'] = row.score ?? '';
          break;
        case 'finding-status-pill':
        case 'text':
        case 'wrap':
        case 'question':
        case 'num':
        default:
          out[col.label] = this.colValue(row, col.key) ?? '';
      }
    }
    return out;
  }

  async exportToExcel(): Promise<void> {
    const XLSX = await import('xlsx');
    const dateSlug = new Date().toISOString().slice(0, 10);

    if (this.isParameterReport) {
      // sortedParamRows, not paramRows/filteredParamRows - the export should match what's
      // actually on screen (current sort + filters + search), not the raw unsorted fetch.
      const columns = this.visibleParamColumns;
      const exportRows = this.sortedParamRows.map((r) => this.exportRowFrom(r, columns));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet['!cols'] = Object.keys(exportRows[0] ?? {}).map((key) => ({ wch: Math.max(14, key.length + 2) }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Parameter Detail Report');
      XLSX.writeFile(workbook, `IT-Ops-Parameter-Detail-Report_${this.exportScopeSlug()}_${dateSlug}.xlsx`);
      return;
    }

    // sortedRows, not filteredRows - same "what you see is what you export" reasoning.
    const columns = this.visibleDomainColumns;
    const exportRows = this.sortedRows.map((r) => this.exportRowFrom(r, columns));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet['!cols'] = Object.keys(exportRows[0] ?? {}).map((key) => ({ wch: Math.max(14, key.length + 2) }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'IT Ops Maturity Report');

    const fileName = `IT-Ops-Maturity-Report_${this.exportScopeSlug()}_${dateSlug}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}

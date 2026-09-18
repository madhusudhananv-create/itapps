import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, filter, switchMap, forkJoin, of } from 'rxjs';
import { MaturityMockService, computeEnterpriseSummary } from '../../services/maturity-mock.service';
import { SessionService } from '../../services/session.service';
import { AccountService } from '../../services/account.service';
import { AssesseeService } from '../../services/assessee.service';
import { BusinessUnitService } from '../../services/business-unit.service';
import { IdentityService } from '../../services/identity.service';
import { DomainSummary, EnterpriseSummary, TopRisk, CurrentUser } from '../../models/maturity.model';
import { CustomerModel } from '../../models/account.model';
import { Assessee } from '../../models/assessee.model';
import { statusPillClass } from '../../utils/status.util';

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
  imports: [CommonModule, FormsModule, RouterLink],
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
  selectedAssessee: Assessee | null = null;
  assesseeSearch = '';
  assesseeDropdownOpen = false;
  assesseesLoading = false;

  @ViewChild('assesseeCombobox') assesseeCombobox?: ElementRef<HTMLElement>;

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

  constructor(
    private maturityService: MaturityMockService,
    private session: SessionService,
    private accountService: AccountService,
    private assesseeService: AssesseeService,
    private businessUnitService: BusinessUnitService,
    private identityService: IdentityService,
  ) {}

  ngOnInit(): void {
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

    this.assesseeService.selectedAssessee$.subscribe((assessee) => {
      this.selectedAssessee = assessee;
    });

    // Role/domain-access is only resolvable once an account is selected,
    // since GDH eligibility depends on that account's real Business Unit.
    this.accountService.selectedAccount$
      .pipe(
        filter((account): account is CustomerModel => !!account),
        switchMap((account) => {
          const custId = String(account.cusT_ID);
          return forkJoin({
            domains: this.maturityService.getDomainSummaries(),
            businessUnit: this.businessUnitService.getBusinessUnitForAccount(custId),
            email: this.identityService.getMyEmail(),
          });
        }),
      )
      .subscribe(({ domains, businessUnit, email }) => {
        this.accountBusinessUnit = businessUnit;
        this.session.resolveIdentity(domains, businessUnit, email);
      });

    combineLatest([
      this.session.user$,
      this.maturityService.getDomainSummaries(),
      this.maturityService.getTopRisks(),
    ]).subscribe(([user, summaries, risks]) => {
      this.currentUser = user;
      this.allDomainSummaries = summaries;
      this.applyRoleScope(risks);
    });
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
    this.enterpriseSummary = computeEnterpriseSummary(this.domainSummaries);
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
    const assesseeEl = this.assesseeCombobox?.nativeElement;
    if (this.assesseeDropdownOpen && assesseeEl && !assesseeEl.contains(event.target as Node)) {
      this.closeAssesseeDropdown();
    }
  }

  openAssesseeDropdown(): void {
    this.assesseeDropdownOpen = true;
    this.filterAssessees();
  }

  closeAssesseeDropdown(): void {
    this.assesseeDropdownOpen = false;
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

  selectAccount(account: CustomerModel): void {
    this.accountService.selectAccount(account);
    this.accountSearch = '';
    this.closeAccountDropdown();
  }

  changeAccount(): void {
    this.accountService.clearSelectedAccount();
    this.accountSearch = '';
  }

  selectAssessee(assessee: Assessee): void {
    this.assesseeService.selectAssessee(assessee);
    this.assesseeSearch = '';
    this.closeAssesseeDropdown();
  }

  changeAssessee(): void {
    this.assesseeService.changeAssessee();
    this.assesseeSearch = '';
  }

  canEditDomain(domain: DomainSummary): boolean {
    return this.currentUser.role === 'SPOC' && this.currentUser.allowedDomainIds.includes(domain.id);
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

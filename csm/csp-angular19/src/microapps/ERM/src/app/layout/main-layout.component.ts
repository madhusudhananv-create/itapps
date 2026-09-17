import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, map, merge, of } from 'rxjs';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { fluxMainPageAnimation } from '../animations/flux-page.animation';
import { AuthService } from '../core/auth.service';
import {
  HeaderDataMode,
  RiskService,
} from '../core/services/risk.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    Button,
    Select,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  animations: [fluxMainPageAnimation],
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly risks = inject(RiskService);

  /** Drives Flux-style main canvas transition when child routes change. */
  readonly fluxMainPageState = toSignal(
    merge(
      of(this.mainRouteKey()),
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.mainRouteKey())
      )
    ),
    { initialValue: this.mainRouteKey() }
  );

  private mainRouteKey(): string {
    const u = this.router.url.split('?')[0]?.trim() || '/';
    return u || '/';
  }

  private routePath(): string {
    return this.router.url.split('?')[0]?.trim() || '/';
  }

  /** Branded title + tagline (hidden on risk log, reports, and key insights). */
  readonly showLayoutTitle = toSignal(
    merge(
      of(this.computeShowLayoutTitle()),
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.computeShowLayoutTitle())
      )
    ),
    { initialValue: this.computeShowLayoutTitle() }
  );

  /** Data scope / BU filters in layout header. */
  readonly showLayoutDataScope = toSignal(
    merge(
      of(this.computeShowLayoutDataScope()),
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.computeShowLayoutDataScope())
      )
    ),
    { initialValue: this.computeShowLayoutDataScope() }
  );

  /** My Role stays visible on Key Insights even when the other header context is hidden. */
  readonly showLayoutMyRole = toSignal(
    merge(
      of(this.computeShowLayoutMyRole()),
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.computeShowLayoutMyRole())
      )
    ),
    { initialValue: this.computeShowLayoutMyRole() }
  );

  readonly showMainHeader = toSignal(
    merge(
      of(this.computeShowMainHeader()),
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.computeShowMainHeader())
      )
    ),
    { initialValue: this.computeShowMainHeader() }
  );

  private computeShowLayoutTitle(): boolean {
    const p = this.routePath();
    return p !== '/risk-log' && p !== '/reports' && p !== '/key-insights';
  }

  private computeShowLayoutDataScope(): boolean {
    const p = this.routePath();
    return p !== '/reports' && p !== '/risk-log' && p !== '/key-insights';
  }

  private computeShowLayoutMyRole(): boolean {
    const p = this.routePath();
    return p !== '/reports' && p !== '/risk-log';
  }

  private computeShowMainHeader(): boolean {
    return (
      this.computeShowLayoutTitle() ||
      this.computeShowLayoutDataScope() ||
      this.computeShowLayoutMyRole()
    );
  }

  readonly headerModeOptions = [
    { label: 'Organization-wide', value: 'organization' as HeaderDataMode },
    { label: 'Business unit scope', value: 'business-unit' as HeaderDataMode },
  ];

  readonly myRoleOptions = [
    'CEO',
    'COO',
    'CISO',
    'CFO',
    'CQO',
    'CLO',
    'CPO',
    'GDH - Tech',
    'GDH - India & UK',
    'GDH - SEAD',
    'GDH - Healthcare',
    'GDH - CIT',
    'IT Head',
    'Sales Head',
    'Marketing Head',
    'Talent Head',
    'Quality Head',
    'Finance Head',
    'Legal Head',
    'Operations Head',
    'Procurement Head',
    'DP',
  ].map((role) => ({ label: role, value: role }));

  readonly buOptions = computed(() =>
    this.risks.businessUnits().map((bu) => ({ label: bu, value: bu }))
  );

  headerMode = this.risks.headerDataMode;
  headerBu = this.risks.headerBusinessUnit;
  myRole = signal('CEO');

  onHeaderModeChange(mode: HeaderDataMode): void {
    this.risks.setHeaderMode(mode, this.headerBu());
  }

  onHeaderBuChange(bu: string): void {
    this.risks.headerBusinessUnit.set(bu);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}

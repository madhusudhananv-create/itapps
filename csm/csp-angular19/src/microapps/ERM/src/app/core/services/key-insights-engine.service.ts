import {
  afterNextRender,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { buildMockExecutiveInsightBundle } from '../data/executive-insights.mock';
import { mergeRegisterCrispLines } from '../data/register-insight-snippets';
import type { ExecutiveInsightBundle } from '../models/executive-insight.model';
import { RiskService } from './risk.service';

/**
 * Dynamic Key Insights engine for the Neurealm Executive Dashboard.
 *
 * Today: deterministic mock bundle rotated by **calendar date** (local).
 * Tomorrow: inject `HttpClient` and POST to an LLM insights endpoint; keep the same `ExecutiveInsightBundle` shape.
 */
@Injectable({ providedIn: 'root' })
export class KeyInsightsEngineService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly risks = inject(RiskService);

  readonly bundle = signal<ExecutiveInsightBundle | undefined>(undefined);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.refresh());
    interval(60_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const today = this.localDateKey();
        const b = this.bundle();
        if (!b || b.effectiveDate !== today) {
          this.refresh();
        }
      });
  }

  /** YYYY-MM-DD in local timezone — drives daily insight rotation. */
  localDateKey(d = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Regenerates the insight bundle. Call after navigation or for a manual refresh.
   * Future: `return this.http.post<ExecutiveInsightBundle>('/api/executive-insights', { date: this.localDateKey() })`
   */
  refresh(): void {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const key = this.localDateKey();
      const base = buildMockExecutiveInsightBundle(key);
      const next = mergeRegisterCrispLines(base, this.risks.headerScopedRisks());
      this.bundle.set(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unable to load insights';
      this.error.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}

import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
import { Select } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import {
  CRITICAL_PROJECT_RISK_HEADERS,
  CRITICAL_PROJECT_RISKS,
  type CriticalProjectRiskHeader,
  type CriticalProjectRiskRow,
} from '../../core/data/critical-project-risks.generated';

const EMPTY_CELL = '__EMPTY__';

type CriticalRiskDisplayRow = Record<string, string>;

const COLUMN_DEFS: readonly { header: CriticalProjectRiskHeader; field: string }[] =
  CRITICAL_PROJECT_RISK_HEADERS.map((header, index) => ({
    header,
    field: `f${index}`,
  })).filter((column) => column.header !== 'PORTFOLIO' && column.header !== 'RISK_LEVEL1');

function augmentRows(rows: readonly CriticalProjectRiskRow[]): CriticalRiskDisplayRow[] {
  return rows.map((r) => {
    const o: CriticalRiskDisplayRow = {};
    CRITICAL_PROJECT_RISK_HEADERS.forEach((h, i) => {
      const v = r[h];
      o[`f${i}`] =
        v === null || v === undefined || String(v).trim() === ''
          ? EMPTY_CELL
          : String(v);
    });
    return o;
  });
}

@Component({
  selector: 'app-critical-project-risks',
  standalone: true,
  imports: [FormsModule, Select, TableModule],
  templateUrl: './critical-project-risks.component.html',
  styleUrl: './critical-project-risks.component.scss',
})
export class CriticalProjectRisksComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly columnDefs = COLUMN_DEFS;
  readonly tableMinWidth = `${Math.max(52, CRITICAL_PROJECT_RISK_HEADERS.length * 10 + 4)}rem`;
  readonly allRows = augmentRows(CRITICAL_PROJECT_RISKS);
  readonly scrollContentWidth = signal(0);

  private readonly risksTable = viewChild<Table>('risksTable');
  private readonly topScrollEl = viewChild<ElementRef<HTMLElement>>('topScroll');
  private mainScrollSub: Subscription | null = null;
  private scrollSyncGen = 0;

  readonly filterOptionMap = computed(() => {
    const m: Record<string, { label: string; value: string }[]> = {};
    for (const d of this.columnDefs) {
      const vals = [...new Set(this.allRows.map((r) => r[d.field]))];
      vals.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
      m[d.field] = vals.map((v) => ({
        label: v === EMPTY_CELL ? '(No value)' : v,
        value: v,
      }));
    }
    return m;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.mainScrollSub?.unsubscribe();
      this.mainScrollSub = null;
    });

    afterNextRender(() => {
      queueMicrotask(() => this.rebindTableScrollSync());
    });
    effect(() => {
      this.risksTable();
      const gen = ++this.scrollSyncGen;
      queueMicrotask(() => {
        if (gen !== this.scrollSyncGen) return;
        this.rebindTableScrollSync();
      });
    });
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.measureScrollWidth());
  }

  filterOptionsFor(field: string): { label: string; value: string }[] {
    return this.filterOptionMap()[field] ?? [];
  }

  displayCell(value: string): string {
    return value === EMPTY_CELL ? '-' : value;
  }

  rowCountInView(): number {
    const t = this.risksTable();
    const processed = t?.processedData as CriticalRiskDisplayRow[] | undefined;
    if (processed && Array.isArray(processed)) {
      return processed.length;
    }
    return this.allRows.length;
  }

  riskLevelClass(row: CriticalRiskDisplayRow): string {
    const riskLevelIndex = CRITICAL_PROJECT_RISK_HEADERS.indexOf('RISK_LEVEL');
    const level = row[`f${riskLevelIndex}`]?.toLowerCase() ?? '';
    if (level === 'catastrophic') return 'critical-risk-level critical-risk-level--catastrophic';
    if (level === 'high') return 'critical-risk-level critical-risk-level--high';
    if (level === 'moderate') return 'critical-risk-level critical-risk-level--moderate';
    if (level === 'low') return 'critical-risk-level critical-risk-level--low';
    return '';
  }

  private mainHScrollEl(): HTMLElement | null {
    const w = this.risksTable()?.wrapperViewChild?.nativeElement;
    return w ?? null;
  }

  private rebindTableScrollSync(): void {
    this.mainScrollSub?.unsubscribe();
    this.mainScrollSub = null;
    this.measureScrollWidth();
    const el = this.mainHScrollEl();
    if (!el) return;
    this.mainScrollSub = fromEvent(el, 'scroll').subscribe(() => this.syncTopFromMain());
  }

  private syncTopFromMain(): void {
    const main = this.mainHScrollEl();
    const top = this.topScrollEl()?.nativeElement;
    if (main && top && top.scrollLeft !== main.scrollLeft) {
      top.scrollLeft = main.scrollLeft;
    }
  }

  onTopScroll(): void {
    const main = this.mainHScrollEl();
    const top = this.topScrollEl()?.nativeElement;
    if (main && top && main.scrollLeft !== top.scrollLeft) {
      main.scrollLeft = top.scrollLeft;
    }
  }

  private measureScrollWidth(): void {
    const main = this.mainHScrollEl();
    this.scrollContentWidth.set(main?.scrollWidth ?? 0);
  }
}

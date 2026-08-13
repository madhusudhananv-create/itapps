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
import { RouterLink } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import {
  ERM_RISK_TRACKER_HEADERS,
  type ErmRiskTrackerHeader,
} from '../../core/data/erm-risk-tracker.generated';
import { RiskService, type TrackerRowWithKey } from '../../core/services/risk.service';

/** Sentinel for null/empty cells in stringified tracker rows (PrimeNG equals filter). */
const TRACKER_EMPTY = '__EMPTY__';

export type TrackerAugmentedRow = Record<string, string> & { __rowKey: string };

export const TRACKER_COLUMN_DEFS: readonly { header: ErmRiskTrackerHeader; field: string }[] =
  ERM_RISK_TRACKER_HEADERS.map((header, index) => ({
    header,
    field: `f${index}`,
  }));

function augmentTrackerRows(rows: TrackerRowWithKey[]): TrackerAugmentedRow[] {
  return rows.map((r) => {
    const o = { __rowKey: r.__rowKey } as TrackerAugmentedRow;
    ERM_RISK_TRACKER_HEADERS.forEach((h, i) => {
      const v = r[h];
      o[`f${i}`] =
        v === null || v === undefined || String(v).trim() === ''
          ? TRACKER_EMPTY
          : String(v);
    });
    return o;
  });
}

@Component({
  selector: 'app-view-existing-risk',
  standalone: true,
  imports: [RouterLink, FormsModule, Button, Dialog, TableModule, Select],
  templateUrl: './view-existing-risk.component.html',
  styleUrl: './view-existing-risk.component.scss',
})
export class ViewExistingRiskComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly risks = inject(RiskService);

  readonly columnDefs = TRACKER_COLUMN_DEFS;
  editDialogVisible = false;
  editingRowKey = '';
  editDraft: Partial<Record<ErmRiskTrackerHeader, string>> = {};

  readonly augmentedScopedRows = computed(() =>
    augmentTrackerRows(this.risks.headerScopedTrackerRowsWithKeys())
  );

  readonly tableMinWidth = `${Math.max(58, ERM_RISK_TRACKER_HEADERS.length * 10 + 8)}rem`;

  readonly scrollContentWidth = signal(0);

  private readonly trackerTable = viewChild<Table>('trackerTable');
  private readonly topScrollEl = viewChild<ElementRef<HTMLElement>>('topScroll');

  /** PrimeNG horizontal scroll lives on `.p-datatable-table-container` (#wrapper), not the outer host. */
  private mainScrollSub: Subscription | null = null;
  private scrollSyncGen = 0;

  readonly filterOptionMap = computed(() => {
    const rows = this.augmentedScopedRows();
    const m: Record<string, { label: string; value: string }[]> = {};
    for (const d of this.columnDefs) {
      const vals = [...new Set(rows.map((r) => r[d.field]))];
      vals.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
      m[d.field] = vals.map((v) => ({
        label: v === TRACKER_EMPTY ? '(No value)' : v,
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
      this.augmentedScopedRows();
      this.trackerTable();
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

  /** Scrollable region inside p-table (matches the bottom horizontal scrollbar). */
  private mainHScrollEl(): HTMLElement | null {
    const w = this.trackerTable()?.wrapperViewChild?.nativeElement;
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

  filterOptionsFor(field: string): { label: string; value: string }[] {
    return this.filterOptionMap()[field] ?? [];
  }

  displayCell(value: string): string {
    return value === TRACKER_EMPTY ? '—' : value;
  }

  editRow(row: TrackerAugmentedRow): void {
    this.editingRowKey = row.__rowKey;
    this.editDraft = {};
    for (const cd of this.columnDefs) {
      const value = row[cd.field];
      this.editDraft[cd.header] = value === TRACKER_EMPTY ? '' : value;
    }
    this.editDialogVisible = true;
  }

  saveEdit(): void {
    if (!this.editingRowKey) return;
    const nextRow: Partial<Record<ErmRiskTrackerHeader, string>> = {};
    for (const h of ERM_RISK_TRACKER_HEADERS) {
      nextRow[h] = this.editDraft[h]?.trim() ?? '';
    }
    this.risks.patchTrackerRow(this.editingRowKey, nextRow);
    this.editDialogVisible = false;
    this.editingRowKey = '';
    this.editDraft = {};
  }

  cancelEdit(): void {
    this.editDialogVisible = false;
    this.editingRowKey = '';
    this.editDraft = {};
  }

  registerRowCount(): number {
    const t = this.trackerTable();
    const processed = t?.processedData as TrackerAugmentedRow[] | undefined;
    if (processed && Array.isArray(processed)) {
      return processed.length;
    }
    return this.augmentedScopedRows().length;
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

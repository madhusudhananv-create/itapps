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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { RiskRecord } from '../../core/models/risk.model';
import {
  HeaderDataMode,
  RiskService,
} from '../../core/services/risk.service';

/** Sentinel for nullable USD fields so column filters can match “no value” rows. */
const REPORT_USD_EMPTY = '__EMPTY__';

/** Row shape for the reports table (adds string keys used only for filtering). */
export type ReportsTableRow = RiskRecord & {
  inherentUsdFilter: string;
  residualUsdFilter: string;
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, Button, DatePicker, Select, TableModule, Tag],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly risks = inject(RiskService);
  private readonly registerTable = viewChild<Table>('registerTable');
  private readonly topScrollEl = viewChild<ElementRef<HTMLElement>>('topScroll');

  readonly scrollContentWidth = signal(0);

  private mainScrollSub: Subscription | null = null;
  private scrollSyncGen = 0;

  readonly headerModeOptions = [
    { label: 'Organization-wide', value: 'organization' as HeaderDataMode },
    { label: 'Business unit scope', value: 'business-unit' as HeaderDataMode },
  ];

  readonly buOptions = computed(() =>
    this.risks.businessUnits().map((bu) => ({ label: bu, value: bu }))
  );

  readonly headerMode = this.risks.headerDataMode;
  readonly headerBu = this.risks.headerBusinessUnit;

  /** PrimeNG range picker model: [start, end] */
  readonly range = signal<Date[] | null>(null);

  readonly filteredRows = computed(() => {
    const all = this.risks.headerScopedRisks();
    const span = this.range();
    if (!span || span.length < 2 || !span[0] || !span[1]) {
      return all;
    }
    const start = this.toYmd(span[0]);
    const end = this.toYmd(span[1]);
    return all.filter(
      (r) => r.identificationDate >= start && r.identificationDate <= end
    );
  });

  /** Rows shown in the grid (adds filter-only keys for nullable USD columns). */
  readonly reportTableRows = computed((): ReportsTableRow[] =>
    this.filteredRows().map((r) => ({
      ...r,
      inherentUsdFilter:
        r.inherentRiskExposureUsd == null
          ? REPORT_USD_EMPTY
          : String(r.inherentRiskExposureUsd),
      residualUsdFilter:
        r.residualRiskExposureUsd == null
          ? REPORT_USD_EMPTY
          : String(r.residualRiskExposureUsd),
    }))
  );

  /** Distinct values per column for filter dropdowns (from current date + scope). */
  readonly reportFilterSelectOptions = computed(() => {
    const rows = this.reportTableRows();
    return {
      id: this.distinctSelectOptions(rows, (r) => r.id),
      title: this.distinctSelectOptions(rows, (r) => r.title),
      category: this.distinctSelectOptions(rows, (r) => r.category),
      businessUnit: this.distinctSelectOptions(rows, (r) => r.businessUnit),
      account: this.distinctSelectOptions(rows, (r) => r.account),
      status: this.distinctSelectOptions(rows, (r) => r.status),
      riskLifecycleStatus: this.distinctSelectOptions(
        rows,
        (r) => r.riskLifecycleStatus
      ),
      riskStrategy: this.distinctSelectOptions(rows, (r) => r.riskStrategy),
      targetClosureDate: this.distinctSelectOptions(
        rows,
        (r) => r.targetClosureDate
      ),
      inherentRating: this.distinctSelectOptions(rows, (r) => r.inherentRating),
      inherentUsdFilter: this.distinctSelectOptions(
        rows,
        (r) => r.inherentUsdFilter,
        (v) => (v === REPORT_USD_EMPTY ? '(No value)' : `$${v}`)
      ),
      residualRating: this.distinctSelectOptions(rows, (r) => r.residualRating),
      residualUsdFilter: this.distinctSelectOptions(
        rows,
        (r) => r.residualUsdFilter,
        (v) => (v === REPORT_USD_EMPTY ? '(No value)' : `$${v}`)
      ),
      identificationDate: this.distinctSelectOptions(
        rows,
        (r) => r.identificationDate
      ),
      riskIdentifiedBy: this.distinctSelectOptions(
        rows,
        (r) => r.riskIdentifiedBy
      ),
      riskApprover: this.distinctSelectOptions(rows, (r) => r.riskApprover),
    };
  });

  private toYmd(d: Date): string {
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  clearRange(): void {
    this.range.set(null);
  }

  /** Row count after date/scope + column filters (table may be undefined on first CD). */
  registerRowCount(): number {
    return this.registerRowsForExport(this.registerTable()).length;
  }

  /** Rows currently shown in the grid (respects column filters) for export. */
  private registerRowsForExport(table: Table | null | undefined): RiskRecord[] {
    const processed = table?.processedData as ReportsTableRow[] | undefined;
    if (processed && Array.isArray(processed)) {
      return processed.map(({ inherentUsdFilter: _a, residualUsdFilter: _b, ...r }) => r);
    }
    return this.filteredRows();
  }

  private distinctSelectOptions<T extends string | number>(
    rows: ReportsTableRow[],
    pick: (r: ReportsTableRow) => T,
    label?: (v: T) => string
  ): { label: string; value: T }[] {
    const vals = [...new Set(rows.map(pick))];
    vals.sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b), undefined, {
        sensitivity: 'base',
        numeric: true,
      });
    });
    return vals.map((value) => ({
      label: label ? label(value) : String(value),
      value,
    }));
  }

  onHeaderModeChange(mode: HeaderDataMode): void {
    this.risks.setHeaderMode(mode, this.headerBu());
  }

  onHeaderBuChange(bu: string): void {
    this.risks.headerBusinessUnit.set(bu);
  }

  exportExcel(): void {
    const rows = this.registerRowsForExport(this.registerTable()).map((r) => this.flatRow(r));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Risks');
    XLSX.writeFile(wb, `neurealm-erp-risks-${Date.now()}.xlsx`);
  }

  exportPdf(): void {
    const data = this.registerRowsForExport(this.registerTable());
    const head = [
      [
        'ID',
        'Title',
        'Category',
        'BU',
        'Account',
        'Register',
        'Risk status',
        'Strategy',
        'Target closure',
        'Inherent',
        'Exposure $ (inherent)',
        'Residual',
        'Exposure $ (residual)',
        'Identified',
        'Risk identified by',
        'Risk owner',
        'Owner email',
        'Approver role',
        'Approver name',
        'Approver email',
      ],
    ];
    const body = data.map((r) => [
      r.id,
      r.title,
      r.category,
      r.businessUnit,
      r.account,
      r.status,
      r.riskLifecycleStatus,
      r.riskStrategy,
      r.targetClosureDate,
      r.inherentRating,
      r.inherentRiskExposureUsd ?? '',
      r.residualRating,
      r.residualRiskExposureUsd ?? '',
      r.identificationDate,
      r.owner,
      r.ownerEmail,
      r.riskApprover,
      r.riskApproverName,
      r.riskApproverEmail,
    ]);
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text("Neurealm's ERP — Risk register export", 14, 16);
    autoTable(doc, {
      head,
      body,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 92] },
    });
    doc.save(`neurealm-erp-risks-${Date.now()}.pdf`);
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.mainScrollSub?.unsubscribe();
      this.mainScrollSub = null;
    });

    afterNextRender(() => {
      queueMicrotask(() => this.rebindTableScrollSync());
    });
    effect(() => {
      this.reportTableRows();
      this.registerTable();
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
    const w = this.registerTable()?.wrapperViewChild?.nativeElement;
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

  private flatRow(r: RiskRecord): Record<string, string | number> {
    return {
      id: r.id,
      title: r.title,
      businessImpact: r.businessImpact,
      threat: r.threat,
      vulnerability: r.vulnerability,
      location: r.location,
      riskRemediationPlan: r.riskRemediationPlan,
      personResponsibleRiskTreatment: r.personResponsibleRiskTreatment,
      riskTreatmentCompletionDate: r.riskTreatmentCompletionDate,
      riskTreatmentImplementationStatus: r.riskTreatmentImplementationStatus,
      riskTreatmentEffectivenessStatus: r.riskTreatmentEffectivenessStatus,
      riskTreatmentEffectivenessVerifiedBy: r.riskTreatmentEffectivenessVerifiedBy,
      riskTreatmentEffectivenessVerifiedDate: r.riskTreatmentEffectivenessVerifiedDate,
      riskTreatmentEffectivenessComments: r.riskTreatmentEffectivenessComments,
      nextRiskAssessmentDate: r.nextRiskAssessmentDate,
      category: r.category,
      businessUnit: r.businessUnit,
      account: r.account,
      status: r.status,
      riskLifecycleStatus: r.riskLifecycleStatus,
      riskStrategy: r.riskStrategy,
      targetClosureDate: r.targetClosureDate,
      inherentRating: r.inherentRating,
      inherentRiskExposureUsd: r.inherentRiskExposureUsd ?? '',
      residualRating: r.residualRating,
      residualRiskExposureUsd: r.residualRiskExposureUsd ?? '',
      identificationDate: r.identificationDate,
      riskIdentifiedBy: r.riskIdentifiedBy,
      owner: r.owner,
      ownerEmail: r.ownerEmail,
      riskApprover: r.riskApprover,
      riskApproverName: r.riskApproverName,
      riskApproverEmail: r.riskApproverEmail,
      treatment: r.treatment,
      orgFunction: r.orgFunction,
      controlEffectiveness: r.controlEffectiveness,
    };
  }
}

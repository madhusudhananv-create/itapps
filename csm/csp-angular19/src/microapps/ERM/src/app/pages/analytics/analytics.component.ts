import { Component, computed, inject } from '@angular/core';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import {
  ANALYTICS_CONSEQUENCE_LABELS,
  ANALYTICS_LIKELIHOOD_LABELS,
} from '../../core/data/analytics-reference.mock';
import type { ErmRiskTrackerHeader, ErmRiskTrackerRow } from '../../core/data/erm-risk-tracker.generated';
import { RiskService } from '../../core/services/risk.service';

type RatingBand = 'Low' | 'Moderate' | 'High' | 'Catastrophic';

const THRESHOLD = 10;

const CONSEQUENCE_FIELD: ErmRiskTrackerHeader =
  'Current Consequences of the event when threat exploit vulnerabilities';
const LIKELIHOOD_FIELD: ErmRiskTrackerHeader =
  'Current Likelihood of threat exploiting vulnerability';
const RATING_FIELD: ErmRiskTrackerHeader = 'Risk Rating BEFORE Risk Treatment Action';
const CATEGORY_FIELD: ErmRiskTrackerHeader = 'Risk Category';
const BUSINESS_UNIT_FIELD: ErmRiskTrackerHeader = 'Business Unit';
const ACTION_STATUS_FIELD: ErmRiskTrackerHeader =
  'Current status of Risk Treatment implementation';
const TREATMENT_PLAN_FIELD: ErmRiskTrackerHeader =
  'Proposed Risk Treatment Plan / Mitigation Plan';
const REMEDIATION_FIELD: ErmRiskTrackerHeader = 'Proposed Risk Remediation Plan';

function text(v: unknown): string {
  return v == null ? '' : String(v).trim();
}

function num(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function hasRiskContent(r: ErmRiskTrackerRow): boolean {
  return Boolean(text(r['Risk Description']) || text(r['Threat']) || text(r[RATING_FIELD]));
}

function product(r: ErmRiskTrackerRow): number | null {
  const c = num(r[CONSEQUENCE_FIELD]);
  const l = num(r[LIKELIHOOD_FIELD]);
  if (c == null || l == null) return null;
  return c * l;
}

function bandFromProduct(p: number): RatingBand {
  if (p >= 20) return 'Catastrophic';
  if (p >= 10) return 'High';
  if (p >= 5) return 'Moderate';
  return 'Low';
}

function ratingBand(r: ErmRiskTrackerRow): RatingBand {
  const raw = text(r[RATING_FIELD]).toLowerCase();
  if (raw.includes('catastrophic')) return 'Catastrophic';
  if (raw.includes('high')) return 'High';
  if (raw.includes('moderate')) return 'Moderate';
  if (raw.includes('low')) return 'Low';
  return bandFromProduct(product(r) ?? 0);
}

function isAtThreshold(r: ErmRiskTrackerRow): boolean {
  const p = product(r);
  if (p != null) return p >= THRESHOLD;
  const band = ratingBand(r);
  return band === 'High' || band === 'Catastrophic';
}

function responseStarted(r: ErmRiskTrackerRow): boolean {
  return Boolean(
    text(r[ACTION_STATUS_FIELD]) ||
      text(r[TREATMENT_PLAN_FIELD]) ||
      text(r[REMEDIATION_FIELD]) ||
      text(r['Risk Treatment Strategy'])
  );
}

function normalizeActionStatus(r: ErmRiskTrackerRow): string {
  const raw = text(r[ACTION_STATUS_FIELD]);
  if (!raw) {
    return responseStarted(r) ? 'Plan defined' : 'Not started';
  }
  const lower = raw.toLowerCase();
  if (lower.includes('wip') || lower.includes('progress')) return 'WIP — Work In Progress';
  if (lower.includes('complete') || lower.includes('closed') || lower.includes('done')) return 'Completed';
  if (lower.includes('defer')) return 'Deferred';
  return raw;
}

function splitCategory(raw: string): string[] {
  return raw
    .split(/[\/\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function increment(map: Map<string, number>, key: string, by = 1): void {
  map.set(key, (map.get(key) ?? 0) + by);
}

function topN(map: Map<string, number>, n: number): { name: string; count: number }[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }))
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

function pieDataset(labels: string[], data: number[], colors: string[]) {
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors.map((c) => c.replace(/0\.\d+\)/, '1)')),
        borderWidth: 1,
        hoverOffset: 6,
      },
    ],
  };
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [Card, UIChart],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent {
  private readonly risks = inject(RiskService);
  private readonly trackerRows = computed(() =>
    this.risks.headerScopedTrackerRows().filter(hasRiskContent)
  );
  private readonly thresholdRows = computed(() =>
    this.trackerRows().filter(isAtThreshold)
  );

  readonly kpis = computed(() => {
    const rows = this.trackerRows();
    const thresholdRows = this.thresholdRows();
    const responseCount = thresholdRows.filter(responseStarted).length;
    return {
      pctRiskGteThreshold: rows.length
        ? Math.round((thresholdRows.length / rows.length) * 10000) / 100
        : 0,
      countRiskGteThreshold: thresholdRows.length,
      avgRiskThreshold: THRESHOLD,
      thresholdBandLabel: 'Catastrophic & High',
      responseProgressPct: thresholdRows.length
        ? Math.round((responseCount / thresholdRows.length) * 10000) / 100
        : 0,
      totalRiskCount: rows.length,
    };
  });

  readonly chartHeight = '260px';
  readonly chartHeightTall = '300px';

  readonly riskRatingPieData = computed(() => {
    const counts = new Map<RatingBand, number>();
    for (const r of this.thresholdRows()) {
      increment(counts, ratingBand(r));
    }
    const labels = (['High', 'Catastrophic', 'Moderate', 'Low'] as const).filter(
      (l) => (counts.get(l) ?? 0) > 0
    );
    return pieDataset(
      [...labels],
      labels.map((l) => counts.get(l) ?? 0),
      ['rgba(249, 115, 22, 0.88)', 'rgba(220, 38, 38, 0.92)', 'rgba(234, 179, 8, 0.88)', 'rgba(34, 197, 94, 0.85)']
    );
  });

  readonly actionPlanPieData = computed(() => {
    const counts = new Map<string, number>();
    for (const r of this.thresholdRows()) {
      increment(counts, normalizeActionStatus(r));
    }
    const rows = topN(counts, 6);
    return pieDataset(
      rows.map((r) => r.name),
      rows.map((r) => r.count),
      [
        'rgba(34, 197, 94, 0.85)',
        'rgba(234, 179, 8, 0.88)',
        'rgba(251, 146, 60, 0.85)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(148, 163, 184, 0.75)',
        'rgba(168, 85, 247, 0.75)',
      ]
    );
  });

  readonly pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 6, bottom: 6 } },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#475569', boxWidth: 11, font: { size: 11 } },
      },
      datalabels: {
        display: (ctx: { dataset: { data: unknown[] }; dataIndex: number }) =>
          Number(ctx.dataset.data[ctx.dataIndex]) > 0,
        color: '#0f172a',
        textStrokeColor: '#ffffff',
        textStrokeWidth: 3,
        font: { weight: '700' as const, size: 12 },
        formatter: (v: number) => v,
      },
    },
  };

  readonly categoryBarData = computed(() => {
    const counts = new Map<string, number>();
    for (const r of this.thresholdRows()) {
      const cats = splitCategory(text(r[CATEGORY_FIELD]));
      for (const c of cats.length ? cats : ['Uncategorized']) increment(counts, c);
    }
    const rows = topN(counts, 5);
    return {
      labels: rows.map((c) => c.name),
      datasets: [
        {
          label: '# risks ≥ threshold',
          data: rows.map((c) => c.count),
          backgroundColor: 'rgba(37, 99, 235, 0.55)',
          borderColor: 'rgba(29, 78, 216, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  });

  readonly buBarData = computed(() => {
    const counts = new Map<string, number>();
    for (const r of this.thresholdRows()) {
      increment(counts, text(r[BUSINESS_UNIT_FIELD]) || 'Unassigned');
    }
    const rows = topN(counts, 5);
    return {
      labels: rows.map((b) => b.name),
      datasets: [
        {
          label: '# risks ≥ threshold',
          data: rows.map((b) => b.count),
          backgroundColor: 'rgba(14, 165, 233, 0.55)',
          borderColor: 'rgba(2, 132, 199, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  });

  readonly hBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    layout: { padding: { top: 8, bottom: 8, left: 4, right: 28 } },
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        anchor: 'end' as const,
        align: 'end' as const,
        offset: 4,
        color: '#0f172a',
        font: { weight: '700' as const, size: 11 },
        formatter: (v: number) => v,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#64748b', stepSize: 2 },
        grid: { color: 'rgba(148, 163, 184, 0.35)' },
      },
      y: {
        ticks: { color: '#334155', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  readonly vBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20, bottom: 8, left: 4, right: 4 } },
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        anchor: 'end' as const,
        align: 'end' as const,
        offset: -2,
        color: '#0f172a',
        font: { weight: '700' as const, size: 11 },
        formatter: (v: number) => v,
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', maxRotation: 35, minRotation: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.25)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', stepSize: 2 },
        grid: { color: 'rgba(148, 163, 184, 0.35)' },
      },
    },
  };

  readonly sparklineData = computed(() => ({
    labels: ['', '', '', ''],
    datasets: [
      {
        data: [
          Math.max(1, Math.round(this.kpis().countRiskGteThreshold * 0.55)),
          Math.max(1, Math.round(this.kpis().countRiskGteThreshold * 0.72)),
          Math.max(1, Math.round(this.kpis().countRiskGteThreshold * 0.86)),
          this.kpis().countRiskGteThreshold,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.35)',
        borderColor: 'rgba(22, 163, 74, 0.9)',
        borderWidth: 2,
        borderRadius: 3,
      },
    ],
  }));

  readonly sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, datalabels: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0, max: 32 },
    },
  };

  readonly likelihoodLabels = ANALYTICS_LIKELIHOOD_LABELS;
  readonly consequenceLabels = ANALYTICS_CONSEQUENCE_LABELS;
  readonly heatMatrix = computed(() => {
    const matrix = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));
    for (const r of this.trackerRows()) {
      const c = num(r[CONSEQUENCE_FIELD]);
      const l = num(r[LIKELIHOOD_FIELD]);
      if (c == null || l == null || c < 1 || c > 5 || l < 1 || l > 5) continue;
      matrix[5 - l]![5 - c]! += 1;
    }
    return matrix;
  });

  heatCellClass(n: number): string {
    if (n <= 0) return 'analytics-heat--empty';
    if (n >= 20) return 'analytics-heat--critical';
    if (n >= 10) return 'analytics-heat--high';
    if (n >= 4) return 'analytics-heat--med';
    if (n >= 2) return 'analytics-heat--low';
    return 'analytics-heat--minimal';
  }
}

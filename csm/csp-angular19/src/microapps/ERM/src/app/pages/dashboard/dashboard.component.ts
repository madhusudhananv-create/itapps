import { NgClass, UpperCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { UIChart } from 'primeng/chart';
import { DashboardLens, RiskService } from '../../core/services/risk.service';
import { riskSeverityClass } from '../../core/risk-rating.constants';
import { RiskRecord } from '../../core/models/risk.model';

type DashboardChartPointKind = 'status' | 'category' | 'function' | 'month';

interface DashboardChartHoverElement {
  readonly index: number;
}

interface DashboardChartHoverApi {
  readonly data?: {
    readonly labels?: readonly unknown[];
  };
}

interface DashboardHoveredPoint {
  readonly kind: DashboardChartPointKind;
  readonly label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, UpperCasePipe, FormsModule, Card, Dialog, Select, SelectButton, UIChart],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly risks = inject(RiskService);
  hoveredChartPoint: DashboardHoveredPoint | null = null;
  detailDialogVisible = false;
  detailDialogTitle = '';
  detailDialogRows: RiskRecord[] = [];

  ngOnInit(): void {
    this.risks.syncDashboardFunctionFilterToCatalog();
  }

  /** PrimeNG Chart + Chart.js: explicit plot height (string) so canvases fill the card. */
  readonly chartPlotHeight = '280px';

  readonly lensOptions = [
    { label: 'Enterprise', value: 'enterprise' as DashboardLens },
    { label: 'Business Unit', value: 'business-unit' as DashboardLens },
    { label: 'Account', value: 'account' as DashboardLens },
    { label: 'Function', value: 'function' as DashboardLens },
  ];

  readonly buFilterOptions = computed(() =>
    this.risks.businessUnits().map((bu) => ({ label: bu, value: bu }))
  );

  readonly functionFilterOptions = computed(() =>
    this.risks.dashboardOrgFunctionOptions().map((fn) => ({ label: fn, value: fn }))
  );

  readonly accountFilterOptions = computed(() =>
    this.risks.dashboardAccountOptionsForBu().map((a) => ({ label: a, value: a }))
  );

  /** Business units available for the selected account (Account lens only). */
  readonly accountLensBuFilterOptions = computed(() =>
    this.risks.dashboardAccountLensBuOptions().map((bu) => ({ label: bu, value: bu }))
  );

  readonly donutData = computed(() => {
    const list = this.risks.dashboardRisks();
    const total = list.length;
    const open = list.filter((r) => r.status === 'open').length;
    const closed = list.filter((r) => r.status === 'closed').length;
    return {
      labels: ['Open', 'Closed'],
      datasets: [
        {
          data: [open, closed],
          backgroundColor: ['rgba(239, 68, 68, 0.72)', 'rgba(148, 163, 184, 0.55)'],
          borderColor: ['rgba(185, 28, 28, 1)', 'rgba(100, 116, 139, 1)'],
          borderWidth: 1,
          hoverOffset: 6,
        },
      ],
      total,
    };
  });

  readonly barData = computed(() => {
    const list = this.risks.dashboardRisks();
    const map = new Map<string, number>();
    for (const r of list) {
      map.set(r.category, (map.get(r.category) ?? 0) + 1);
    }
    const labels = [...map.keys()].sort();
    const data = labels.map((k) => map.get(k) ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Risks',
          data,
          backgroundColor: 'rgba(56, 189, 248, 0.55)',
          borderColor: 'rgba(14, 165, 233, 1)',
          borderWidth: 1,
        },
      ],
    };
  });

  readonly pieData = computed(() => {
    const list = this.risks.dashboardRisks();
    const map = new Map<string, number>();
    for (const r of list) {
      map.set(r.orgFunction, (map.get(r.orgFunction) ?? 0) + 1);
    }
    const labels = [...map.keys()].sort();
    const data = labels.map((k) => map.get(k) ?? 0);
    const palette = [
      'rgba(56, 189, 248, 0.8)',
      'rgba(129, 140, 248, 0.8)',
      'rgba(52, 211, 153, 0.8)',
      'rgba(251, 191, 36, 0.85)',
      'rgba(248, 113, 113, 0.8)',
      'rgba(94, 234, 212, 0.75)',
      'rgba(196, 181, 253, 0.8)',
      'rgba(148, 163, 184, 0.75)',
    ];
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 1,
        },
      ],
    };
  });

  readonly lineData = computed(() => {
    const list = this.risks.dashboardRisks();
    const map = new Map<string, number>();
    for (const r of list) {
      const d = new Date(r.loggedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const labels = [...map.keys()].sort();
    const data = labels.map((k) => map.get(k) ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Risks logged',
          data,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHitRadius: 12,
          borderColor: 'rgba(56, 189, 248, 1)',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
        },
      ],
    };
  });

  readonly chartOptionsDonut = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, bottom: 8 } },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          boxWidth: 12,
          color: (ctx: { index: number }) =>
            ctx.index === 0 ? '#b91c1c' : '#475569',
        },
      },
      tooltip: { enabled: true },
      datalabels: {
        display: (ctx: { dataset: { data: unknown[] }; dataIndex: number }) =>
          Number(ctx.dataset.data[ctx.dataIndex]) > 0,
        color: (ctx: { dataIndex: number }) =>
          ctx.dataIndex === 0 ? '#b91c1c' : '#0f172a',
        textStrokeColor: '#ffffff',
        textStrokeWidth: 3,
        font: { weight: '700' as const, size: 13 },
        formatter: (v: number) => v,
      },
    },
    cutout: '62%',
    onHover: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.trackChartHover('status', elements, chart),
    onClick: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.openChartDetailsFromElements('status', elements, chart),
  };

  readonly chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 22, bottom: 12, left: 2, right: 4 } },
    plugins: {
      legend: { display: false },
      datalabels: {
        display: (ctx: { dataset: { data: unknown[] }; dataIndex: number }) =>
          Number(ctx.dataset.data[ctx.dataIndex]) > 0,
        anchor: 'end' as const,
        align: 'top' as const,
        offset: -4,
        color: '#1e3a8a',
        font: { weight: '600' as const, size: 11 },
        formatter: (v: number) => v,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', maxRotation: 40, minRotation: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.35)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', stepSize: 1 },
        grid: { color: 'rgba(148, 163, 184, 0.35)' },
      },
    },
    onHover: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.trackChartHover('category', elements, chart),
    onClick: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.openChartDetailsFromElements('category', elements, chart),
  };

  readonly chartOptionsPie = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 4, bottom: 4 } },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: { color: '#475569', boxWidth: 10 },
      },
    },
    onHover: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.trackChartHover('function', elements, chart),
    onClick: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.openChartDetailsFromElements('function', elements, chart),
  };

  readonly chartOptionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 18, bottom: 4, left: 2, right: 4 } },
    plugins: {
      legend: {
        labels: { color: '#475569' },
      },
      datalabels: {
        display: (ctx: { dataset: { data: unknown[] }; dataIndex: number }) =>
          Number(ctx.dataset.data[ctx.dataIndex]) > 0,
        align: 'top' as const,
        anchor: 'center' as const,
        offset: 6,
        color: '#1d4ed8',
        font: { weight: '600' as const, size: 11 },
        formatter: (v: number) => v,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(148, 163, 184, 0.3)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', stepSize: 1 },
        grid: { color: 'rgba(148, 163, 184, 0.3)' },
      },
    },
    onHover: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.trackChartHover('month', elements, chart),
    onClick: (
      _event: unknown,
      elements: readonly DashboardChartHoverElement[],
      chart: DashboardChartHoverApi
    ) => this.openChartDetailsFromElements('month', elements, chart),
  };

  trackChartHover(
    kind: DashboardChartPointKind,
    elements: readonly DashboardChartHoverElement[],
    chart: DashboardChartHoverApi
  ): void {
    this.hoveredChartPoint = this.chartPointFromElements(kind, elements, chart);
  }

  openHoveredChartDetails(expectedKind: DashboardChartPointKind): void {
    const point = this.hoveredChartPoint;
    if (!point || point.kind !== expectedKind) {
      return;
    }

    this.openChartDetails(point);
  }

  openChartDetailsFromElements(
    kind: DashboardChartPointKind,
    elements: readonly DashboardChartHoverElement[],
    chart: DashboardChartHoverApi
  ): void {
    const point = this.chartPointFromElements(kind, elements, chart);
    if (!point) {
      return;
    }
    this.openChartDetails(point);
  }

  private chartPointFromElements(
    kind: DashboardChartPointKind,
    elements: readonly DashboardChartHoverElement[],
    chart: DashboardChartHoverApi
  ): DashboardHoveredPoint | null {
    const first = elements[0];
    const label = first ? String(chart.data?.labels?.[first.index] ?? '') : '';
    return label ? { kind, label } : null;
  }

  private openChartDetails(point: DashboardHoveredPoint): void {
    const rows = this.detailRowsForPoint(point);
    this.detailDialogTitle = `${this.detailTitleForKind(point.kind)}: ${point.label}`;
    this.detailDialogRows = rows;
    this.detailDialogVisible = true;
  }

  private detailRowsForPoint(point: DashboardHoveredPoint): RiskRecord[] {
    const rows = this.risks.dashboardRisks();
    if (point.kind === 'status') {
      const status = point.label.toLowerCase();
      return rows.filter((r) => r.status === status);
    }
    if (point.kind === 'category') {
      return rows.filter((r) => r.category === point.label);
    }
    if (point.kind === 'function') {
      return rows.filter((r) => r.orgFunction === point.label);
    }
    return rows.filter((r) => {
      const d = new Date(r.loggedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === point.label;
    });
  }

  private detailTitleForKind(kind: DashboardChartPointKind): string {
    if (kind === 'status') return 'Status';
    if (kind === 'category') return 'Risk category';
    if (kind === 'function') return 'Function';
    return 'Logged month';
  }

  exposureSeverity(stats: { exposure: number; total: number }): 'low' | 'medium' | 'high' {
    if (stats.total === 0) return 'low';
    const avg = stats.exposure / stats.total;
    return riskSeverityClass(Math.round(avg));
  }

  setLens(v: DashboardLens): void {
    this.risks.setDashboardLens(v);
    if (v === 'account') {
      this.risks.syncDashboardBuForAccountLens();
    }
  }

  setBuFilter(bu: string): void {
    this.risks.setDashboardBu(bu);
  }

  setFunctionFilter(fn: string): void {
    this.risks.setDashboardFunction(fn);
  }

  setAccountFilter(acc: string): void {
    this.risks.setDashboardAccount(acc);
  }
}

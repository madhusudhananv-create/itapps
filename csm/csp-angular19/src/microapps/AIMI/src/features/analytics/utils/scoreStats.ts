import type { MonthPoint, ScoreSeries } from '../services/analyticsService';

export interface ScoreStats {
  current: number | null;
  accepted: number | null;
  previous: number | null;
  /** (current - previous) / previous * 100, null when there is no previous score. */
  growth: number | null;
  /** Month the current score belongs to (yyyy-MM). */
  month: string | null;
  previousMonth: string | null;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** yyyy-MM list ending at `endMonth`, `count` long, oldest first. */
export const buildMonthAxis = (count: number, endMonth: string): string[] => {
  const [y, m] = endMonth.split('-').map(Number);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

export const currentMonthKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const monthLabel = (month: string, withYear = false): string => {
  const [y, m] = month.split('-').map(Number);
  return withYear ? `${MONTH_NAMES[m - 1]} ${y}` : MONTH_NAMES[m - 1];
};

/** Latest scored month is "current", the scored month before it is "previous". */
export const computeStats = (series: ScoreSeries): ScoreStats => {
  const scored: MonthPoint[] = series.points.filter((p) => p.current !== null);
  const latest = scored[scored.length - 1];
  const prior = scored[scored.length - 2];
  const current = latest?.current ?? null;
  const previous = prior?.current ?? null;
  const growth =
    current !== null && previous !== null && previous > 0
      ? ((current - previous) / previous) * 100
      : null;
  return {
    current,
    accepted: latest?.accepted ?? null,
    previous,
    growth,
    month: latest?.month ?? null,
    previousMonth: prior?.month ?? null,
  };
};

export const isDrop = (growth: number | null): boolean =>
  growth !== null && growth < -0.005;

export const formatScore = (value: number | null): string =>
  value === null ? '–' : value.toFixed(2);

export const formatGrowth = (growth: number | null): string =>
  growth === null
    ? '–'
    : `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;

import { aimiApiClient } from '@shared/services/aimiApiClient';

// Backs the AIMI Analytics dashboard (admin only). Reads the monthly score history the API
// stores in AIMI_SCORE_HISTORY via usp_AIMI_GetScoreAnalytics / usp_AIMI_GetScoreFilterOptions.

export type AnalyticsLevel = 'BU' | 'ACCOUNT' | 'PROJECT' | 'PRACTICE';

export interface AnalyticsFilters {
  businessUnits: string[];
  accounts: string[];
  projects: string[];
  practices: string[];
}

export interface MonthPoint {
  /** yyyy-MM */
  month: string;
  current: number | null;
  accepted: number | null;
}

export interface ScoreSeries {
  name: string;
  points: MonthPoint[];
  projectCount: number;
}

export interface AnalyticsResult {
  /** Overall figure for the filters, drives the tiles and the trend chart. */
  total: ScoreSeries;
  groups: ScoreSeries[];
}

interface ApiScoreRow {
  GROUP_NAME: string | null;
  IS_TOTAL: boolean;
  SNAPSHOT_MONTH: string;
  CURRENT_SCORE: number | null;
  ACCEPTED_SCORE: number | null;
  PROJECT_COUNT: number;
}

interface ApiFilterOption {
  DIMENSION: AnalyticsLevel;
  VALUE_TEXT: string;
}

/**
 * The downloadable report. Which columns it has, their titles and their order are decided by the
 * database (AIMI_SCORE_REPORT_COLUMN); the client shows exactly what comes back.
 */
export interface ScoreReport {
  /** Column titles, in order. */
  columns: string[];
  /** One object per row, keyed by column title. */
  rows: Record<string, string | number | null>[];
}

const ENDPOINTS = {
  FILTER_OPTIONS: '/api/AllSys/GetAimiScoreFilterOptions',
  ANALYTICS: '/api/AllSys/GetAimiScoreAnalytics',
  REPORT: '/api/AllSys/GetAimiScoreReport',
};

export const EMPTY_SERIES: ScoreSeries = {
  name: '',
  points: [],
  projectCount: 0,
};

const toSeries = (name: string, rows: ApiScoreRow[]): ScoreSeries => {
  const points = rows
    .map((r) => ({
      month: r.SNAPSHOT_MONTH.slice(0, 7),
      current: r.CURRENT_SCORE,
      accepted: r.ACCEPTED_SCORE,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
  const projectCount = rows.reduce((m, r) => Math.max(m, r.PROJECT_COUNT), 0);
  return { name, points, projectCount };
};

export const analyticsService = {
  getFilterOptions: async (): Promise<Record<AnalyticsLevel, string[]>> => {
    const rows = await aimiApiClient.get<ApiFilterOption[]>(
      ENDPOINTS.FILTER_OPTIONS
    );
    const options: Record<AnalyticsLevel, string[]> = {
      BU: [],
      ACCOUNT: [],
      PROJECT: [],
      PRACTICE: [],
    };
    (rows ?? []).forEach((r) => {
      if (options[r.DIMENSION]) options[r.DIMENSION].push(r.VALUE_TEXT);
    });
    return options;
  },

  /**
   * Report rows, one per group at `level`, for the current filters. Columns and titles are
   * whatever the database returns; property order in each row object is the column order.
   */
  getScoreReport: async (
    level: AnalyticsLevel,
    months: number,
    filters: AnalyticsFilters
  ): Promise<ScoreReport> => {
    const rows =
      (await aimiApiClient.post<ScoreReport['rows']>(ENDPOINTS.REPORT, {
        level,
        months,
        ...filters,
      })) ?? [];
    return { columns: rows.length ? Object.keys(rows[0]) : [], rows };
  },

  getScoreAnalytics: async (
    level: AnalyticsLevel,
    months: number,
    filters: AnalyticsFilters
  ): Promise<AnalyticsResult> => {
    const rows =
      (await aimiApiClient.post<ApiScoreRow[]>(ENDPOINTS.ANALYTICS, {
        level,
        months,
        ...filters,
      })) ?? [];

    const byGroup = new Map<string, ApiScoreRow[]>();
    rows
      .filter((r) => !r.IS_TOTAL && r.GROUP_NAME !== null)
      .forEach((r) => {
        const key = r.GROUP_NAME as string;
        const list = byGroup.get(key);
        if (list) list.push(r);
        else byGroup.set(key, [r]);
      });

    return {
      total: toSeries(
        'All',
        rows.filter((r) => r.IS_TOTAL)
      ),
      groups: Array.from(byGroup.entries())
        .map(([name, list]) => toSeries(name, list))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  },
};

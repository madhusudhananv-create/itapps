/**
 * Charts Model
 * Migrated from Angular 6 to Angular 19
 * 
 * Model for chart data structures (Radar, Trend, etc.)
 */

export interface RadarChartConfig {
  radarChartType: string;
  radarChartLabels: string[];
  radarChartData: any;
}

export interface ChartsModel {
  RadarChart: RadarChartConfig;
}

/**
 * Extended chart model for dashboard usage
 */
export interface DashboardChartsModel {
  radarHighChart?: any;
  trendHighChartGroup?: TrendHighChartGroup[];
  month?: string;
  year?: number;
}

export interface TrendHighChartGroup {
  goalName?: string;
  trendHighChart?: TrendHighChart[];
}

export interface TrendHighChart {
  kpiId?: string;
  portfolioId?: string;
  trendHighChart?: any;
}

import { aimiApiClient } from '@shared/services/aimiApiClient';
import type {
  SummaryStatistics,
  AIToolMetrics,
  SDLCPhaseAITools,
  QualitativeBenefitAnalysis,
} from '@shared/types/dashboardTypes';

// Server-side aggregation over usp_AIMI_GetDashboardSummary / GetAIToolMetrics /
// GetAIToolsBySDLCPhase / GetQualitativeBenefitAnalysis, replacing the client-side
// reduce()s that used to run over every Firestore activity document. Correlation
// analysis (Pearson/chi-square) has no SQL equivalent and is intentionally NOT
// here - it stays in statisticalAnalysisUtils.ts, computed from raw activity rows
// fetched via activityService, unchanged.

const ENDPOINTS = {
  DASHBOARD_SUMMARY: '/api/AllSys/GetAimiDashboardSummary',
  AI_TOOL_METRICS: '/api/AllSys/GetAimiAIToolMetrics',
  AI_TOOLS_BY_SDLC_PHASE: '/api/AllSys/GetAimiAIToolsBySDLCPhase',
  QUALITATIVE_BENEFIT_ANALYSIS: '/api/AllSys/GetAimiQualitativeBenefitAnalysis',
};

interface ApiDashboardSummaryRow {
  TOTAL_ACTIVITIES: number;
  OVERALL_AI_ADOPTION_SCORE: number | null;
  OVERALL_WORK_DONE_BY_AI: number | null;
  TOTAL_HOURS_SAVED: number;
  REVENUE_GENERATING_ACTIVITIES: number;
  HIGH_ADOPTION_ACTIVITIES: number;
}

interface ApiAiToolMetricRow {
  TOOL_NAME: string;
  ACTIVITIES: number;
  HOURS_SAVED: number;
  REVENUE_ACTIVITIES: number;
  AVG_WORK_DONE_BY_AI: number | null;
}

interface ApiAiToolBySdlcPhaseRow {
  SDLC_PHASE: string;
  TOOL_NAME: string;
}

interface ApiQualitativeBenefitRow {
  BENEFIT_NAME: string;
  FREQUENCY: number;
  TOTAL_HOURS_SAVED: number;
  MOST_FREQUENT_TOOL: string | null;
  ASSOCIATED_TOOLS: string[];
}

export const getAimiDashboardSummary = async (
  projectId?: string,
  practice?: string
): Promise<SummaryStatistics> => {
  const row = await aimiApiClient.get<ApiDashboardSummaryRow | null>(
    ENDPOINTS.DASHBOARD_SUMMARY,
    { projectId, practice }
  );

  if (!row) {
    return {
      totalActivities: 0,
      totalHoursSaved: 0,
      revenueGenerated: 0,
      highAdoption: 0,
      overallAIAdoptionScore: 0,
      overallWorkDoneByAI: 0,
    };
  }

  return {
    totalActivities: row.TOTAL_ACTIVITIES ?? 0,
    totalHoursSaved: row.TOTAL_HOURS_SAVED ?? 0,
    revenueGenerated: row.REVENUE_GENERATING_ACTIVITIES ?? 0,
    highAdoption: row.HIGH_ADOPTION_ACTIVITIES ?? 0,
    overallAIAdoptionScore: row.OVERALL_AI_ADOPTION_SCORE ?? 0,
    overallWorkDoneByAI: row.OVERALL_WORK_DONE_BY_AI ?? 0,
  };
};

export const getAimiAIToolMetrics = async (
  projectId?: string,
  practice?: string
): Promise<AIToolMetrics[]> => {
  const rows = await aimiApiClient.get<ApiAiToolMetricRow[]>(
    ENDPOINTS.AI_TOOL_METRICS,
    { projectId, practice }
  );

  return rows
    .map((row) => ({
      toolName: row.TOOL_NAME,
      activitiesCount: row.ACTIVITIES ?? 0,
      hoursSaved: row.HOURS_SAVED ?? 0,
      revenueActivities: row.REVENUE_ACTIVITIES ?? 0,
      averageWorkDone: row.AVG_WORK_DONE_BY_AI ?? 0,
    }))
    .sort((a, b) => b.hoursSaved - a.hoursSaved);
};

export const getAimiAIToolsBySDLCPhase = async (
  projectId?: string,
  practice?: string
): Promise<SDLCPhaseAITools[]> => {
  const rows = await aimiApiClient.get<ApiAiToolBySdlcPhaseRow[]>(
    ENDPOINTS.AI_TOOLS_BY_SDLC_PHASE,
    { projectId, practice }
  );

  // Flat SDLC_PHASE/TOOL_NAME rows -> {phase, tools: string[]}[] - the same
  // pivot the client used to do over Firestore rows, just fed by SQL rows now.
  const phaseTools = new Map<string, Set<string>>();
  rows.forEach((row) => {
    if (!phaseTools.has(row.SDLC_PHASE)) {
      phaseTools.set(row.SDLC_PHASE, new Set());
    }
    phaseTools.get(row.SDLC_PHASE)!.add(row.TOOL_NAME);
  });

  return Array.from(phaseTools.entries()).map(([phase, tools]) => ({
    phase,
    tools: Array.from(tools),
  }));
};

export const getAimiQualitativeBenefitAnalysis = async (
  projectId?: string,
  practice?: string
): Promise<QualitativeBenefitAnalysis[]> => {
  const rows = await aimiApiClient.get<ApiQualitativeBenefitRow[]>(
    ENDPOINTS.QUALITATIVE_BENEFIT_ANALYSIS,
    { projectId, practice }
  );

  return rows
    .map((row) => ({
      benefit: row.BENEFIT_NAME,
      frequency: row.FREQUENCY ?? 0,
      totalHoursSaved: row.TOTAL_HOURS_SAVED ?? 0,
      // The proc returns just the tool name, no count - the old UI text was
      // "Tool (N times)"; that exact count isn't reproducible from this row,
      // so the plain tool name is shown instead (small, known UI text change).
      mostFrequentTool: row.MOST_FREQUENT_TOOL || '',
      associatedTools: row.ASSOCIATED_TOOLS ?? [],
    }))
    .sort((a, b) => b.frequency - a.frequency);
};

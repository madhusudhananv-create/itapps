import { useState, useEffect } from 'react';
import type { ActivityWithProjectInfo } from '@activities/types/activityTypes';
import { activityStorageUtils } from '@activities/utils/activityStorageUtils';
import {
  calculateAIToolSDLCPhaseCorrelation,
  calculateQualitativeBenefitPracticeCorrelation,
  calculateWorkDoneHoursSavedCorrelation,
  calculateRevenueAdoptionCorrelation,
  calculateCorrelationInsights,
} from '@shared/utils/statisticalAnalysisUtils';
import {
  getAimiDashboardSummary,
  getAimiAIToolMetrics,
  getAimiAIToolsBySDLCPhase,
  getAimiQualitativeBenefitAnalysis,
} from '@shared/services/aimiAnalyticsService';
import type {
  SummaryStatistics,
  CorrelationData,
  AIToolMetrics,
  SDLCPhaseAITools,
  QualitativeBenefitAnalysis,
  CorrelationInsights,
} from '@shared/types/dashboardTypes';

// Summary stats / AI tool metrics / phase-tool grouping / qualitative benefit
// analysis are now server-side aggregations (see aimiAnalyticsService.ts).
// Correlation analysis (Pearson/chi-square) has no SQL equivalent, so it - and
// the raw activity fetch it needs - stays exactly as it was, just now backed
// by activityService's SQL calls instead of Firestore.
export const useDashboardData = () => {
  const [activities, setActivities] = useState<ActivityWithProjectInfo[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatistics>({
    totalActivities: 0,
    totalHoursSaved: 0,
    revenueGenerated: 0,
    highAdoption: 0,
    overallAIAdoptionScore: 0,
    overallWorkDoneByAI: 0,
  });
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [aiToolMetrics, setAIToolMetrics] = useState<AIToolMetrics[]>([]);
  const [sdlcPhaseTools, setSdlcPhaseTools] = useState<SDLCPhaseAITools[]>([]);
  const [qualitativeBenefits, setQualitativeBenefits] = useState<
    QualitativeBenefitAnalysis[]
  >([]);
  const [correlationInsights, setCorrelationInsights] =
    useState<CorrelationInsights>({
      hoursSavedLeaders: [],
      revenueGenerationLeaders: [],
      mostBeneficialToBoth: [],
      mostImpactfulBenefits: [],
    });
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      // Raw rows - only needed for the correlation calculations below.
      const allActivities = await activityStorageUtils.getActivities();
      setActivities(allActivities);

      const [stats, toolMetrics, phaseTools, benefits] = await Promise.all([
        getAimiDashboardSummary(),
        getAimiAIToolMetrics(),
        getAimiAIToolsBySDLCPhase(),
        getAimiQualitativeBenefitAnalysis(),
      ]);
      setSummaryStats(stats);
      setAIToolMetrics(toolMetrics);
      setSdlcPhaseTools(phaseTools);
      setQualitativeBenefits(benefits);

      setCorrelations([
        calculateAIToolSDLCPhaseCorrelation(allActivities),
        calculateQualitativeBenefitPracticeCorrelation(allActivities),
        calculateWorkDoneHoursSavedCorrelation(allActivities),
        calculateRevenueAdoptionCorrelation(allActivities),
      ]);
      setCorrelationInsights(calculateCorrelationInsights(allActivities));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await loadDashboardData();
      } catch {
        // already logged in loadDashboardData
      } finally {
        setIsLoading(false);
      }
    };

    load();

    // Listen for storage changes to refresh data
    const handleStorageChange = () => {
      load();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshData = async () => {
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  return {
    activities,
    summaryStats,
    correlations,
    aiToolMetrics,
    sdlcPhaseTools,
    qualitativeBenefits,
    correlationInsights,
    isLoading,
    refreshData,
  };
};

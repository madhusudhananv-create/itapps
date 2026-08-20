import { useState, useEffect } from 'react';
import type { ActivityWithProjectInfo } from '@activities/types/activityTypes';
import { activityStorageUtils } from '@activities/utils/activityStorageUtils';
import {
  calculateSummaryStatistics,
  calculateAIToolSDLCPhaseCorrelation,
  calculateQualitativeBenefitPracticeCorrelation,
  calculateWorkDoneHoursSavedCorrelation,
  calculateRevenueAdoptionCorrelation,
  calculateAIToolMetrics,
  getAIToolsBySDLCPhase,
  analyzeQualitativeBenefits,
  calculateCorrelationInsights,
} from '@shared/utils/statisticalAnalysisUtils';
import type {
  SummaryStatistics,
  CorrelationData,
  AIToolMetrics,
  SDLCPhaseAITools,
  QualitativeBenefitAnalysis,
  CorrelationInsights,
} from '@shared/types/dashboardTypes';

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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Load activities from Firestore
        const allActivities = await activityStorageUtils.getActivities();
        setActivities(allActivities);

        // Calculate summary statistics
        const stats = calculateSummaryStatistics(allActivities);
        setSummaryStats(stats);

        // Calculate correlations
        const correlationData = [
          calculateAIToolSDLCPhaseCorrelation(allActivities),
          calculateQualitativeBenefitPracticeCorrelation(allActivities),
          calculateWorkDoneHoursSavedCorrelation(allActivities),
          calculateRevenueAdoptionCorrelation(allActivities),
        ];
        setCorrelations(correlationData);

        // Calculate AI tool metrics
        const toolMetrics = calculateAIToolMetrics(allActivities);
        setAIToolMetrics(toolMetrics);

        // Get AI tools by SDLC phase
        const phaseTools = getAIToolsBySDLCPhase(allActivities);
        setSdlcPhaseTools(phaseTools);

        // Analyze qualitative benefits
        const benefits = analyzeQualitativeBenefits(allActivities);
        setQualitativeBenefits(benefits);

        // Calculate correlation insights
        const insights = calculateCorrelationInsights(allActivities);
        setCorrelationInsights(insights);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Listen for storage changes to refresh data
    const handleStorageChange = () => {
      loadDashboardData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshData = async () => {
    try {
      const allActivities = await activityStorageUtils.getActivities();
      setActivities(allActivities);

      const stats = calculateSummaryStatistics(allActivities);
      setSummaryStats(stats);

      const correlationData = [
        calculateAIToolSDLCPhaseCorrelation(allActivities),
        calculateQualitativeBenefitPracticeCorrelation(allActivities),
        calculateWorkDoneHoursSavedCorrelation(allActivities),
        calculateRevenueAdoptionCorrelation(allActivities),
      ];
      setCorrelations(correlationData);

      const toolMetrics = calculateAIToolMetrics(allActivities);
      setAIToolMetrics(toolMetrics);

      const phaseTools = getAIToolsBySDLCPhase(allActivities);
      setSdlcPhaseTools(phaseTools);

      const benefits = analyzeQualitativeBenefits(allActivities);
      setQualitativeBenefits(benefits);

      const insights = calculateCorrelationInsights(allActivities);
      setCorrelationInsights(insights);
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

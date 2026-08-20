import { useState, useEffect, useMemo } from 'react';
import type { ActivityData } from '../types/activityTypes';
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
} from '../../../shared/utils/statisticalAnalysisUtils';
import type {
  SummaryStatistics,
  CorrelationData,
  AIToolMetrics,
  SDLCPhaseAITools,
  QualitativeBenefitAnalysis,
  CorrelationInsights,
} from '../../../shared/types/dashboardTypes';

interface ProjectInfo {
  businessUnit: string;
  businessHead: string;
  account: string;
  accountManager: string;
  project: string;
  projectId: string;
  practice: string;
  manager: string;
  currentPhase: string;
  headcount?: number;
  peopleUsingAI?: number;
}

export const useProjectStatistics = (
  projectInfo?: ProjectInfo,
  activities?: ActivityData[]
) => {
  const [projectStats, setProjectStats] = useState<SummaryStatistics>({
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
  const [isLoading, setIsLoading] = useState(false);

  // Use the activities passed from parent (already filtered for the project)
  const projectActivities = useMemo(() => {
    return activities || [];
  }, [activities]);

  // Calculate project-specific statistics
  useEffect(() => {
    if (!projectInfo || !projectActivities.length) {
      setProjectStats({
        totalActivities: 0,
        totalHoursSaved: 0,
        revenueGenerated: 0,
        highAdoption: 0,
        overallAIAdoptionScore: 0,
        overallWorkDoneByAI: 0,
      });
      setCorrelations([]);
      setAIToolMetrics([]);
      setSdlcPhaseTools([]);
      setQualitativeBenefits([]);
      setCorrelationInsights({
        hoursSavedLeaders: [],
        revenueGenerationLeaders: [],
        mostBeneficialToBoth: [],
        mostImpactfulBenefits: [],
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert ActivityData to ActivityWithProjectInfo for statistical analysis
      const activitiesWithProjectInfo = projectActivities.map((activity) => ({
        ...activity,
        projectId: projectInfo.projectId,
        businessUnit: projectInfo.businessUnit,
        businessHead: projectInfo.businessHead,
        account: projectInfo.account,
        accountManager: projectInfo.accountManager,
        project: projectInfo.project,
        practice: projectInfo.practice,
        manager: projectInfo.manager,
        currentPhase: projectInfo.currentPhase,
      }));

      // Calculate summary statistics for the project
      const stats = calculateSummaryStatistics(activitiesWithProjectInfo);
      setProjectStats(stats);

      // Calculate correlations for the project
      const correlationData = [
        calculateAIToolSDLCPhaseCorrelation(activitiesWithProjectInfo),
        calculateQualitativeBenefitPracticeCorrelation(
          activitiesWithProjectInfo
        ),
        calculateWorkDoneHoursSavedCorrelation(activitiesWithProjectInfo),
        calculateRevenueAdoptionCorrelation(activitiesWithProjectInfo),
      ];
      setCorrelations(correlationData);

      // Calculate AI tool metrics for the project
      const toolMetrics = calculateAIToolMetrics(activitiesWithProjectInfo);
      setAIToolMetrics(toolMetrics);

      // Get AI tools by SDLC phase for the project
      const phaseTools = getAIToolsBySDLCPhase(activitiesWithProjectInfo);
      setSdlcPhaseTools(phaseTools);

      // Analyze qualitative benefits for the project
      const benefits = analyzeQualitativeBenefits(activitiesWithProjectInfo);
      setQualitativeBenefits(benefits);

      // Calculate correlation insights for the project
      const insights = calculateCorrelationInsights(activitiesWithProjectInfo);
      setCorrelationInsights(insights);
    } catch (error) {
      console.error('Error calculating project statistics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectInfo, projectActivities]);

  return {
    projectStats,
    correlations,
    aiToolMetrics,
    sdlcPhaseTools,
    qualitativeBenefits,
    correlationInsights,
    projectActivities,
    isLoading,
  };
};

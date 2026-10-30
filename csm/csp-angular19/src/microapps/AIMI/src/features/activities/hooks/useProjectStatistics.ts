import { useState, useEffect, useMemo } from 'react';
import type { ActivityData } from '../types/activityTypes';
import {
  calculateAIToolSDLCPhaseCorrelation,
  calculateQualitativeBenefitPracticeCorrelation,
  calculateWorkDoneHoursSavedCorrelation,
  calculateRevenueAdoptionCorrelation,
  calculateCorrelationInsights,
} from '../../../shared/utils/statisticalAnalysisUtils';
import {
  getAimiDashboardSummary,
  getAimiAIToolMetrics,
  getAimiAIToolsBySDLCPhase,
  getAimiQualitativeBenefitAnalysis,
} from '../../../shared/services/aimiAnalyticsService';
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
  isProjectNA?: boolean;
  naComments?: string;
}

const EMPTY_STATS: SummaryStatistics = {
  totalActivities: 0,
  totalHoursSaved: 0,
  revenueGenerated: 0,
  highAdoption: 0,
  overallAIAdoptionScore: 0,
  overallWorkDoneByAI: 0,
};

const EMPTY_INSIGHTS: CorrelationInsights = {
  hoursSavedLeaders: [],
  revenueGenerationLeaders: [],
  mostBeneficialToBoth: [],
  mostImpactfulBenefits: [],
};

// Summary stats / AI tool metrics / phase-tool grouping / qualitative benefit
// analysis are server-side aggregations scoped to this project+practice (see
// aimiAnalyticsService.ts). Correlation analysis has no SQL equivalent, so it
// keeps running client-side over the `activities` already fetched by the
// caller (SQL-backed transparently via activityService).
export const useProjectStatistics = (
  projectInfo?: ProjectInfo,
  activities?: ActivityData[]
) => {
  const [projectStats, setProjectStats] =
    useState<SummaryStatistics>(EMPTY_STATS);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [aiToolMetrics, setAIToolMetrics] = useState<AIToolMetrics[]>([]);
  const [sdlcPhaseTools, setSdlcPhaseTools] = useState<SDLCPhaseAITools[]>([]);
  const [qualitativeBenefits, setQualitativeBenefits] = useState<
    QualitativeBenefitAnalysis[]
  >([]);
  const [correlationInsights, setCorrelationInsights] =
    useState<CorrelationInsights>(EMPTY_INSIGHTS);
  const [isLoading, setIsLoading] = useState(false);

  // Use the activities passed from parent (already filtered for the project)
  const projectActivities = useMemo(() => {
    return activities || [];
  }, [activities]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (
        !projectInfo ||
        !projectActivities.length ||
        projectInfo.isProjectNA
      ) {
        setProjectStats(EMPTY_STATS);
        setCorrelations([]);
        setAIToolMetrics([]);
        setSdlcPhaseTools([]);
        setQualitativeBenefits([]);
        setCorrelationInsights(EMPTY_INSIGHTS);
        return;
      }

      setIsLoading(true);

      try {
        // Annotate with project-level fields for the client-side correlation math.
        const activitiesWithProjectInfo = projectActivities.map(
          (activity) => ({
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
          })
        );

        const [stats, toolMetrics, phaseTools, benefits] = await Promise.all([
          getAimiDashboardSummary(projectInfo.projectId, projectInfo.practice),
          getAimiAIToolMetrics(projectInfo.projectId, projectInfo.practice),
          getAimiAIToolsBySDLCPhase(
            projectInfo.projectId,
            projectInfo.practice
          ),
          getAimiQualitativeBenefitAnalysis(
            projectInfo.projectId,
            projectInfo.practice
          ),
        ]);

        if (cancelled) return;

        setProjectStats(stats);
        setAIToolMetrics(toolMetrics);
        setSdlcPhaseTools(phaseTools);
        setQualitativeBenefits(benefits);

        setCorrelations([
          calculateAIToolSDLCPhaseCorrelation(activitiesWithProjectInfo),
          calculateQualitativeBenefitPracticeCorrelation(
            activitiesWithProjectInfo
          ),
          calculateWorkDoneHoursSavedCorrelation(activitiesWithProjectInfo),
          calculateRevenueAdoptionCorrelation(activitiesWithProjectInfo),
        ]);
        setCorrelationInsights(
          calculateCorrelationInsights(activitiesWithProjectInfo)
        );
      } catch (error) {
        console.error('Error calculating project statistics:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
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

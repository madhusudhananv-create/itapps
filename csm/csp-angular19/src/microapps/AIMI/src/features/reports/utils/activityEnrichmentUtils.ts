import type { ActivityWithProjectInfo } from '@activities/types/activityTypes';

// Interface for fully enriched activity data
export interface EnrichedActivityWithProjectInfo
  extends ActivityWithProjectInfo {
  businessHead: string;
  accountManager: string;
  manager: string;
  headcount?: number;
  currentPhase?: string;

  // AI Adoption Metrics and Accepted Score, taken from the project's info
  peopleUsingAI?: number;
  licenseCount?: number;
  licenseProvider?: string;
  runOpsAutoResolved?: string;
  runOpsMTTRReduction?: string;
  runOpsAIAgents?: string;
  runOpsAutomatedWorkflows?: string;
  runOpsMTTD?: string;
  runOpsMTTR?: string;
  engineerAIAgents?: string;
  engineerDeliveryCycleTime?: string;
  engineerContractTestCasePassRate?: string;
  engineerPerformanceDefectsPreRelease?: string;
  commonAdoptionWorkforceCertification?: string;
  commonAdoptionEffortsSaved?: string;
  commonDeploymentEngineer?: string;
  acceptedScore?: number;
  acceptedScoreComment?: string;
}

/**
 * Enrich activities with all project and practice information in a single pass
 */
export const enrichActivitiesWithProjectInfo = (
  activities: ActivityWithProjectInfo[],
  projectMapping: Map<string, ProjectMapping>,
  projectInfoList: ProjectInfo[],
  practiceInfoList: PracticeInfo[]
): EnrichedActivityWithProjectInfo[] => {
  // Create maps for faster lookup
  const projectInfoMap = new Map<string, ProjectInfo>();
  const practiceInfoMap = new Map<string, PracticeInfo>();

  // Build project info map
  projectInfoList.forEach((projectInfo) => {
    projectInfoMap.set(projectInfo.projectId, projectInfo);
  });

  // Build practice info map (key: projectId|practice)
  practiceInfoList.forEach((practiceInfo) => {
    const key = `${practiceInfo.projectId}|${practiceInfo.practice}`;
    practiceInfoMap.set(key, practiceInfo);
  });

  return activities.map((activity) => {
    // Get project mapping data
    const mapping = projectMapping.get(activity.projectId);

    // Get project info (AI Adoption Metrics, accepted score)
    const projectInfo = projectInfoMap.get(activity.projectId);

    // Get practice info for currentPhase
    const practiceKey = `${activity.projectId}|${activity.practice}`;
    const practiceInfo = practiceInfoMap.get(practiceKey);

    return {
      ...activity,
      businessHead: mapping?.businessHead ?? '',
      accountManager: mapping?.accountManager ?? '',
      manager: mapping?.manager ?? '',
      headcount: mapping?.headcount,
      currentPhase: practiceInfo?.currentPhase ?? '',

      peopleUsingAI: projectInfo?.peopleUsingAI,
      licenseCount: projectInfo?.licenseCount,
      licenseProvider: projectInfo?.licenseProvider,
      runOpsAutoResolved: projectInfo?.runOpsAutoResolved,
      runOpsMTTRReduction: projectInfo?.runOpsMTTRReduction,
      runOpsAIAgents: projectInfo?.runOpsAIAgents,
      runOpsAutomatedWorkflows: projectInfo?.runOpsAutomatedWorkflows,
      runOpsMTTD: projectInfo?.runOpsMTTD,
      runOpsMTTR: projectInfo?.runOpsMTTR,
      engineerAIAgents: projectInfo?.engineerAIAgents,
      engineerDeliveryCycleTime: projectInfo?.engineerDeliveryCycleTime,
      engineerContractTestCasePassRate:
        projectInfo?.engineerContractTestCasePassRate,
      engineerPerformanceDefectsPreRelease:
        projectInfo?.engineerPerformanceDefectsPreRelease,
      commonAdoptionWorkforceCertification:
        projectInfo?.commonAdoptionWorkforceCertification,
      commonAdoptionEffortsSaved: projectInfo?.commonAdoptionEffortsSaved,
      commonDeploymentEngineer: projectInfo?.commonDeploymentEngineer,
      acceptedScore: projectInfo?.acceptedScore,
      acceptedScoreComment: projectInfo?.acceptedScoreComment,
    };
  });
};

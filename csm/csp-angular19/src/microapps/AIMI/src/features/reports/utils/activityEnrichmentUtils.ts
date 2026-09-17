import type { ActivityWithProjectInfo } from '@activities/types/activityTypes';
import type { ProjectInfo } from '@shared/projects/services/projectInfoService';
import type { PracticeInfo } from '@shared/practices/services/practiceInfoService';
import type { ProjectMapping } from '@shared/projects/types/projectMappingTypes';

// Interface for fully enriched activity data
export interface EnrichedActivityWithProjectInfo
  extends ActivityWithProjectInfo {
  businessHead: string;
  accountManager: string;
  manager: string;
  headcount?: number;
  currentPhase?: string;
  peopleUsingAI?: number;
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

    // Get project info for peopleUsingAI
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
    };
  });
};

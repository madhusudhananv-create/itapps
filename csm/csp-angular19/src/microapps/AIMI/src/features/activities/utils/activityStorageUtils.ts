import { activityService } from '../services';
import type {
  ActivityWithProjectInfo,
  ActivityData,
} from '../types/activityTypes';

export const activityStorageUtils = {
  /**
   * Save activities to Firestore
   */
  saveActivities: async (
    activities: Omit<ActivityWithProjectInfo, 'id'>[]
  ): Promise<ActivityWithProjectInfo[]> => {
    return await activityService.saveActivities(activities);
  },

  /**
   * Get all activities from Firestore
   */
  getActivities: async (): Promise<ActivityWithProjectInfo[]> => {
    return await activityService.getAllActivities();
  },

  /**
   * Add new activities to Firestore
   */
  addActivities: async (
    newActivities: Omit<ActivityWithProjectInfo, 'id'>[]
  ): Promise<ActivityWithProjectInfo[]> => {
    return await activityService.saveActivities(newActivities);
  },

  /**
   * Upsert activities for a specific project and practice in Firestore
   * Updates existing activities and creates new ones efficiently
   */
  upsertActivitiesForProject: async (
    activities: ActivityWithProjectInfo[]
  ): Promise<ActivityWithProjectInfo[]> => {
    if (activities.length === 0) return [];
    return await activityService.upsertActivitiesForProject(activities);
  },

  /**
   * Clear all activities from Firestore
   */
  clearActivities: async (): Promise<void> => {
    await activityService.clearAllActivities();
  },

  /**
   * Get activities by project ID and practice from Firestore
   */
  getActivitiesByProjectIdAndPractice: async (
    projectId: string,
    practice: string
  ): Promise<ActivityWithProjectInfo[]> => {
    return await activityService.getActivitiesByProjectIdAndPractice(
      projectId,
      practice
    );
  },

  /**
   * Get activities by project ID from Firestore
   */
  getActivitiesByProjectId: async (
    projectId: string
  ): Promise<ActivityWithProjectInfo[]> => {
    return await activityService.getActivitiesByProjectId(projectId);
  },
};

export const getActivitiesForProject = async (
  projectId: string,
  practice: string
): Promise<ActivityWithProjectInfo[]> => {
  return await activityStorageUtils.getActivitiesByProjectIdAndPractice(
    projectId,
    practice
  );
};

// Check if all activities have applicability other than 'Yes'
export const areAllActivitiesNotApplicable = (
  activities: ActivityData[]
): boolean => {
  if (activities.length === 0) return false;

  return activities.every((activity) => activity.applicability !== 'Yes');
};

// Calculate average AI adoption score from activities
export const calculateAverageAIAdoptionScore = (
  activities: ActivityData[]
): number => {
  if (activities.length === 0) return 0;

  const validScores = activities
    .filter((a) => a.sdlcPhase !== 'NA') // skip NA
    .map((activity) => {
      const score = activity.aiAdoptionScore;
      if (score === 'N/A' || score === '') return null;
      const numScore = parseFloat(score);
      return isNaN(numScore) ? null : numScore;
    })
    .filter((score): score is number => score !== null);

  if (validScores.length === 0) return 0;

  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / validScores.length) * 100) / 100; // Round to 2 decimal places
};

// Calculate average AI adoption score by phase
export const calculateAverageAIAdoptionScoreByPhase = (
  activities: ActivityData[]
): Record<string, number> => {
  const phaseScores: Record<string, { sum: number; count: number }> = {};

  activities.forEach((activity) => {
    if (activity.sdlcPhase === 'NA') return; // skip NA phases

    const score = activity.aiAdoptionScore;
    if (score === 'N/A' || score === '') return;

    const numScore = parseFloat(score);
    if (isNaN(numScore)) return;

    if (!phaseScores[activity.sdlcPhase]) {
      phaseScores[activity.sdlcPhase] = { sum: 0, count: 0 };
    }

    phaseScores[activity.sdlcPhase].sum += numScore;
    phaseScores[activity.sdlcPhase].count += 1;
  });

  const result: Record<string, number> = {};
  Object.entries(phaseScores).forEach(([phase, { sum, count }]) => {
    result[phase] = Math.round((sum / count) * 100) / 100; // Round to 2 decimal places
  });

  return result;
};

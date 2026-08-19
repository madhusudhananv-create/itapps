import { useState, useEffect, useCallback } from 'react';
import type {
  ActivityData,
  ActivityWithProjectInfo,
  ProjectInfo,
} from '../types/activityTypes';
import { activityStorageUtils } from '@activities/utils/activityStorageUtils';

interface UseActivityStateProps {
  projectId?: string;
  selectedPractice?: string;
}

export const useActivityState = ({
  projectId,
  selectedPractice,
}: UseActivityStateProps) => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [originalActivities, setOriginalActivities] = useState<ActivityData[]>(
    []
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load activities for the selected project and practice
  const loadActivitiesForProject = useCallback(
    async (projectId: string, practice: string) => {
      if (!projectId || !practice) return;

      try {
        const storedActivities =
          await activityStorageUtils.getActivitiesByProjectIdAndPractice(
            projectId,
            practice
          );
        const projectActivities = storedActivities.map((activity) => ({
          id: activity.id,
          sdlcPhase: activity.sdlcPhase,
          activity: activity.activity,
          applicability: activity.applicability || '',
          aiAdoptionScore: activity.aiAdoptionScore,
          aiToolUsed: activity.aiToolUsed || '',
          clientApproved: activity.clientApproved || '',
          acceleratorsUsed: activity.acceleratorsUsed || '',
          workDoneByAI: activity.workDoneByAI,
          hoursSaved: activity.hoursSaved,
          revenueGenerated: activity.revenueGenerated,
          benefitTo: activity.benefitTo,
          qualitativeBenefits: activity.qualitativeBenefits,
          comments: activity.comments,
          status: activity.status || 'submitted',
          createdAt: new Date(activity.createdAt),
          updatedAt: activity.updatedAt
            ? new Date(activity.updatedAt)
            : undefined,
        }));

        setActivities(projectActivities);
        setOriginalActivities(projectActivities);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading activities:', error);
        setActivities([]);
        setOriginalActivities([]);
        setHasUnsavedChanges(false);
      }
    },
    []
  );

  // Recompute unsaved state by id whenever activities/originalActivities change,
  // so commitActivity (which updates both arrays directly) stays in sync
  useEffect(() => {
    if (activities.length !== originalActivities.length) {
      setHasUnsavedChanges(true);
      return;
    }

    const originalMap = new Map(
      originalActivities.map((activity) => [activity.id, activity])
    );
    const changed = activities.some((activity) => {
      const original = originalMap.get(activity.id);
      return !original || JSON.stringify(activity) !== JSON.stringify(original);
    });
    setHasUnsavedChanges(changed);
  }, [activities, originalActivities]);

  // Check for unsaved changes
  const checkForChanges = useCallback(
    (currentActivities: ActivityData[]) => {
      if (currentActivities.length !== originalActivities.length) {
        return true;
      }

      return currentActivities.some((activity, index) => {
        const original = originalActivities[index];
        if (!original) return true;

        return JSON.stringify(activity) !== JSON.stringify(original);
      });
    },
    [originalActivities]
  );

  // Check if a specific activity is unsaved
  const isActivityUnsaved = useCallback(
    (activityId: string) => {
      const currentActivity = activities.find(
        (activity) => activity.id === activityId
      );
      const originalActivity = originalActivities.find(
        (activity) => activity.id === activityId
      );

      if (!currentActivity) return false;
      if (!originalActivity) return true; // New activity

      return (
        JSON.stringify(currentActivity) !== JSON.stringify(originalActivity)
      );
    },
    [activities, originalActivities]
  );

  // Add new activity
  const addActivity = useCallback(
    (activity: ActivityData) => {
      setActivities((prevActivities) => {
        const newActivities = [...prevActivities, activity];
        setHasUnsavedChanges(checkForChanges(newActivities));
        return newActivities;
      });
    },
    [checkForChanges]
  );

  // Replace a (possibly temporary) activity id with its persisted version and
  // sync originalActivities too, so an auto-saved draft is no longer flagged as unsaved
  const commitActivity = useCallback(
    (oldId: string, savedActivity: ActivityData) => {
      setActivities((prevActivities) => {
        const exists = prevActivities.some((activity) => activity.id === oldId);
        return exists
          ? prevActivities.map((activity) =>
              activity.id === oldId ? savedActivity : activity
            )
          : [...prevActivities, savedActivity];
      });

      setOriginalActivities((prevOriginal) => {
        const exists = prevOriginal.some((activity) => activity.id === oldId);
        return exists
          ? prevOriginal.map((activity) =>
              activity.id === oldId ? savedActivity : activity
            )
          : [...prevOriginal, savedActivity];
      });
    },
    []
  );

  // Update existing activity
  const updateActivity = useCallback(
    (updatedActivity: ActivityData) => {
      setActivities((prevActivities) => {
        const newActivities = prevActivities.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        );
        setHasUnsavedChanges(checkForChanges(newActivities));
        return newActivities;
      });
    },
    [checkForChanges]
  );

  // Delete activity
  const deleteActivity = useCallback(
    (activityId: string) => {
      setActivities((prevActivities) => {
        const newActivities = prevActivities.filter(
          (activity) => activity.id !== activityId
        );
        setHasUnsavedChanges(checkForChanges(newActivities));
        return newActivities;
      });
    },
    [checkForChanges]
  );

  // Save activities to Firestore
  const saveActivities = useCallback(
    async (projectInfo: ProjectInfo) => {
      try {
        const activitiesWithProjectInfo: ActivityWithProjectInfo[] =
          activities.map((activity) => ({
            id: activity.id,
            sdlcPhase: activity.sdlcPhase,
            activity: activity.activity,
            applicability: activity.applicability,
            aiAdoptionScore: activity.aiAdoptionScore,
            aiToolUsed: activity.aiToolUsed,
            clientApproved: activity.clientApproved,
            acceleratorsUsed: activity.acceleratorsUsed,
            workDoneByAI: activity.workDoneByAI,
            hoursSaved: activity.hoursSaved,
            revenueGenerated: activity.revenueGenerated,
            benefitTo: activity.benefitTo,
            qualitativeBenefits: activity.qualitativeBenefits,
            comments: activity.comments,
            status: 'submitted',
            createdAt: activity.createdAt,
            projectId: projectInfo.projectId,
            project: projectInfo.project,
            practice: projectInfo.practice,
            account: projectInfo.account,
            businessUnit: projectInfo.businessUnit,
          }));

        const updatedActivities =
          await activityStorageUtils.upsertActivitiesForProject(
            activitiesWithProjectInfo
          );

        // Convert back to ActivityData format and update local state
        const updatedActivityData: ActivityData[] = updatedActivities.map(
          (activity) => ({
            id: activity.id,
            sdlcPhase: activity.sdlcPhase,
            activity: activity.activity,
            applicability: activity.applicability,
            aiAdoptionScore: activity.aiAdoptionScore,
            aiToolUsed: activity.aiToolUsed,
            clientApproved: activity.clientApproved,
            acceleratorsUsed: activity.acceleratorsUsed,
            workDoneByAI: activity.workDoneByAI,
            hoursSaved: activity.hoursSaved,
            revenueGenerated: activity.revenueGenerated,
            benefitTo: activity.benefitTo,
            qualitativeBenefits: activity.qualitativeBenefits,
            comments: activity.comments,
            status: activity.status,
            createdAt: new Date(activity.createdAt),
            updatedAt: activity.updatedAt
              ? new Date(activity.updatedAt)
              : undefined,
          })
        );

        setActivities(updatedActivityData);
        setOriginalActivities(updatedActivityData);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error saving activities:', error);
        throw error;
      }
    },
    [activities]
  );

  // Mark activities as saved (update originalActivities to match current activities)
  const markActivitiesAsSaved = useCallback(
    (updatedActivities?: ActivityData[]) => {
      if (updatedActivities) {
        // Update local state with the activities returned from Firestore (with correct IDs)
        setActivities(updatedActivities);
        setOriginalActivities(updatedActivities);
      } else {
        // Fallback to current activities if no updated activities provided
        setOriginalActivities([...activities]);
      }
      setHasUnsavedChanges(false);
    },
    [activities]
  );

  // Clear activities
  const clearActivities = useCallback(() => {
    setActivities([]);
    setOriginalActivities([]);
    setHasUnsavedChanges(false);
  }, []);

  // Load activities when projectId or practice changes
  useEffect(() => {
    if (projectId && selectedPractice) {
      loadActivitiesForProject(projectId, selectedPractice);
    } else {
      clearActivities();
    }
  }, [projectId, selectedPractice, loadActivitiesForProject, clearActivities]);

  return {
    activities,
    hasUnsavedChanges,
    addActivity,
    updateActivity,
    deleteActivity,
    commitActivity,
    saveActivities,
    markActivitiesAsSaved,
    clearActivities,
    isActivityUnsaved,
    loadActivitiesForProject: (projectId: string) =>
      loadActivitiesForProject(projectId, selectedPractice ?? ''),
  };
};

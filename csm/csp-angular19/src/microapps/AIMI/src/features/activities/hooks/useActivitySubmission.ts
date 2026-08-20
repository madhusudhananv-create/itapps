import { useState } from 'react';
import type {
  ActivityData,
  ActivityWithProjectInfo,
} from '../types/activityTypes';
import { activityStorageUtils } from '@activities/utils/activityStorageUtils';

interface FormData {
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

export const useActivitySubmission = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitActivities = async (
    activities: ActivityData[],
    formData: FormData,
    onSuccess?: (updatedActivities?: ActivityData[]) => void
  ) => {
    try {
      // Use existing projectId from form data
      const projectId = formData.projectId;

      if (!projectId) {
        throw new Error('Project ID is required for activity submission');
      }

      // Add project information to each activity (keeping the id for efficient updates)
      const activitiesWithProjectInfo: ActivityWithProjectInfo[] =
        activities.map((activity) => ({
          id: activity.id,
          sdlcPhase: activity.sdlcPhase,
          activity: activity.activity,
          applicability: activity.applicability,
          aiAdoptionScore: activity.aiAdoptionScore,
          aiToolUsed: activity.aiToolUsed,
          acceleratorsUsed: activity.acceleratorsUsed,
          workDoneByAI: activity.workDoneByAI,
          hoursSaved: activity.hoursSaved,
          revenueGenerated: activity.revenueGenerated,
          benefitTo: activity.benefitTo,
          qualitativeBenefits: activity.qualitativeBenefits,
          comments: activity.comments,
          createdAt: activity.createdAt,
          projectId,
          project: formData.project,
          practice: formData.practice,
          account: formData.account,
          businessUnit: formData.businessUnit,
        }));

      // Upsert activities in Firestore using efficient upsert function
      const updatedActivities =
        await activityStorageUtils.upsertActivitiesForProject(
          activitiesWithProjectInfo
        );

      // Convert back to ActivityData format for local state
      const updatedActivityData: ActivityData[] = updatedActivities.map(
        (activity) => ({
          id: activity.id,
          sdlcPhase: activity.sdlcPhase,
          activity: activity.activity,
          applicability: activity.applicability,
          aiAdoptionScore: activity.aiAdoptionScore,
          aiToolUsed: activity.aiToolUsed,
          acceleratorsUsed: activity.acceleratorsUsed,
          workDoneByAI: activity.workDoneByAI,
          hoursSaved: activity.hoursSaved,
          revenueGenerated: activity.revenueGenerated,
          benefitTo: activity.benefitTo,
          qualitativeBenefits: activity.qualitativeBenefits,
          comments: activity.comments,
          createdAt: new Date(activity.createdAt),
          updatedAt: activity.updatedAt
            ? new Date(activity.updatedAt)
            : undefined,
        })
      );

      // Show success message
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);

      // Call the success callback with updated activities to sync local state
      if (onSuccess) {
        onSuccess(updatedActivityData);
      }

      return { success: true, projectId, activities: updatedActivityData };
    } catch (error) {
      console.error('Error saving activities:', error);
      return { success: false, error };
    }
  };

  const clearSubmitSuccess = () => {
    setSubmitSuccess(false);
  };

  return {
    submitSuccess,
    submitActivities,
    clearSubmitSuccess,
  };
};

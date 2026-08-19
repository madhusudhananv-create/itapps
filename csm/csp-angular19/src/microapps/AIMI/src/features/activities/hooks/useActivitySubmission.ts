import { useState } from 'react';
import type {
  ActivityData,
  ActivityStatus,
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

// Upserts activities to Firestore with the given status and returns them in ActivityData form
const persistActivities = async (
  activities: ActivityData[],
  formData: FormData,
  status: ActivityStatus
) => {
  const projectId = formData.projectId;

  if (!projectId) {
    throw new Error('Project ID is required to save activities');
  }

  const activitiesWithProjectInfo: ActivityWithProjectInfo[] = activities.map(
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
      status,
      createdAt: activity.createdAt,
      projectId,
      project: formData.project,
      practice: formData.practice,
      account: formData.account,
      businessUnit: formData.businessUnit,
    })
  );

  const updatedActivities =
    await activityStorageUtils.upsertActivitiesForProject(
      activitiesWithProjectInfo
    );

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
      updatedAt: activity.updatedAt ? new Date(activity.updatedAt) : undefined,
    })
  );

  return { projectId, activities: updatedActivityData };
};

export const useActivitySubmission = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [draftSaveSuccess, setDraftSaveSuccess] = useState(false);

  const submitActivities = async (
    activities: ActivityData[],
    formData: FormData,
    onSuccess?: (updatedActivities?: ActivityData[]) => void
  ) => {
    try {
      const { projectId, activities: updatedActivityData } =
        await persistActivities(activities, formData, 'submitted');

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

  // Persists activities as drafts so data isn't lost if the connection drops before final submission
  const saveActivitiesAsDraft = async (
    activities: ActivityData[],
    formData: FormData,
    onSuccess?: (updatedActivities?: ActivityData[]) => void
  ) => {
    try {
      const { projectId, activities: updatedActivityData } =
        await persistActivities(activities, formData, 'draft');

      setDraftSaveSuccess(true);
      setTimeout(() => setDraftSaveSuccess(false), 5000);

      if (onSuccess) {
        onSuccess(updatedActivityData);
      }

      return { success: true, projectId, activities: updatedActivityData };
    } catch (error) {
      console.error('Error saving draft activities:', error);
      return { success: false, error };
    }
  };

  const clearSubmitSuccess = () => {
    setSubmitSuccess(false);
  };

  const clearDraftSaveSuccess = () => {
    setDraftSaveSuccess(false);
  };

  return {
    submitSuccess,
    submitActivities,
    clearSubmitSuccess,
    draftSaveSuccess,
    saveActivitiesAsDraft,
    clearDraftSaveSuccess,
  };
};

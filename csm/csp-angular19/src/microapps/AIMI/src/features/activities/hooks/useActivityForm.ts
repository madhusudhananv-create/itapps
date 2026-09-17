import { useState, useEffect, useCallback } from 'react';
import type { ActivityFormData, ActivityData } from '../types/activityTypes';
import {
  getSDLCPhasesForPractice,
  getActivitiesForSDLCPhase,
} from '../../../shared/utils/questionnaireUtils';

const initialFormData: ActivityFormData = {
  sdlcPhase: '',
  activity: '',
  applicability: '',
  aiAdoptionScore: '',
  aiToolUsed: '',
  acceleratorsUsed: '',
  workDoneByAI: 0,
  hoursSaved: 0,
  revenueGenerated: '',
  benefitTo: '',
  qualitativeBenefits: [],
  comments: '',
};

export const useActivityForm = (
  selectedPractice: string,
  editingActivity: ActivityData | null | undefined,
  existingActivities: ActivityData[] = []
) => {
  const [formData, setFormData] = useState<ActivityFormData>(initialFormData);
  const [originalFormData, setOriginalFormData] =
    useState<ActivityFormData | null>(null);
  const [sdlcPhases, setSdlcPhases] = useState<string[]>([]);
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  const isPhaseNA = formData.sdlcPhase === 'NA';

  // Load editing data when editingActivity changes
  useEffect(() => {
    if (editingActivity) {
      const editingFormData = {
        sdlcPhase: editingActivity.sdlcPhase,
        activity: editingActivity.activity,
        applicability: editingActivity.applicability,
        aiAdoptionScore: editingActivity.aiAdoptionScore,
        aiToolUsed: editingActivity.aiToolUsed,
        acceleratorsUsed: editingActivity.acceleratorsUsed || '',
        workDoneByAI: editingActivity.workDoneByAI,
        hoursSaved: editingActivity.hoursSaved,
        revenueGenerated: editingActivity.revenueGenerated,
        benefitTo: editingActivity.benefitTo,
        qualitativeBenefits: editingActivity.qualitativeBenefits,
        comments: editingActivity.comments,
      };
      setFormData(editingFormData);
      setOriginalFormData(editingFormData);
    } else {
      setFormData(initialFormData);
      setOriginalFormData(null);
    }
  }, [editingActivity]);

  // Load SDLC phases when practice changes
  useEffect(() => {
    if (selectedPractice) {
      let phases = getSDLCPhasesForPractice(selectedPractice);

      // Add "NA" option if not already present
      if (!phases.includes('NA')) {
        phases = [...phases, 'NA'];
      }

      setSdlcPhases(phases);

      // Only reset form when practice changes and we're not editing
      if (!editingActivity) {
        setFormData(initialFormData);
      }
    }
  }, [selectedPractice, editingActivity]);

  // Load activities when SDLC phase changes and filter out existing ones
  useEffect(() => {
    if (selectedPractice && formData.sdlcPhase) {
      const activityList = getActivitiesForSDLCPhase(
        selectedPractice,
        formData.sdlcPhase
      );

      // Filter out activities that already exist (excluding the current editing activity)
      const existingActivityNames = existingActivities
        .filter(
          (activity) =>
            activity.sdlcPhase === formData.sdlcPhase &&
            (!editingActivity || activity.id !== editingActivity.id)
        )
        .map((activity) => activity.activity);

      const filteredActivities = activityList.filter(
        (activity) => !existingActivityNames.includes(activity)
      );

      setAvailableActivities(filteredActivities);

      // Only reset activity when SDLC phase changes and we're not editing
      if (!editingActivity) {
        setFormData((prev) => ({ ...prev, activity: '' }));
      }
    }
  }, [
    selectedPractice,
    formData.sdlcPhase,
    editingActivity,
    existingActivities,
  ]);

  useEffect(() => {
    if (isPhaseNA) {
      handleFormChange('applicability', 'NA');
    }
  }, [formData.sdlcPhase]);

  const handleFormChange = useCallback(
    (field: keyof ActivityFormData, value: string | string[] | number) => {
      setFormData((prev) => {
        const newFormData = { ...prev, [field]: value };

        // Clear dependent fields when key fields change
        if (field === 'sdlcPhase') {
          // Clear activity and all dependent fields
          newFormData.activity = '';
          newFormData.applicability = '';
          newFormData.aiAdoptionScore = '';
          newFormData.aiToolUsed = '';
          newFormData.acceleratorsUsed = '';
          newFormData.workDoneByAI = 0;
          newFormData.hoursSaved = 0;
          newFormData.revenueGenerated = '';
          newFormData.benefitTo = '';
          newFormData.qualitativeBenefits = [];
          // Keep comments as they might be relevant across activities
        } else if (field === 'activity') {
          // Clear applicability and all dependent fields
          newFormData.applicability = '';
          newFormData.aiAdoptionScore = '';
          newFormData.aiToolUsed = '';
          newFormData.acceleratorsUsed = '';
          newFormData.workDoneByAI = 0;
          newFormData.hoursSaved = 0;
          newFormData.revenueGenerated = '';
          newFormData.benefitTo = '';
          newFormData.qualitativeBenefits = [];
          // Keep comments as they might be relevant across activities
        } else if (field === 'applicability') {
          // Clear AI adoption score and dependent fields
          newFormData.aiAdoptionScore = '';
          newFormData.aiToolUsed = '';
          newFormData.acceleratorsUsed = '';
          newFormData.workDoneByAI = 0;
          newFormData.hoursSaved = 0;
          newFormData.revenueGenerated = '';
          newFormData.benefitTo = '';
          newFormData.qualitativeBenefits = [];
          // Keep comments as they might be relevant across activities
        }

        return newFormData;
      });
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  return {
    formData,
    originalFormData,
    sdlcPhases,
    availableActivities,
    handleFormChange,
    resetForm,
    isPhaseNA,
  };
};

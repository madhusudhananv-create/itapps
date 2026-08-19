import type { ActivityFormData } from '../types/activityTypes';

export const isApplicable = (applicability: string): boolean => {
  return applicability === 'Yes';
};

export const isNotApplicable = (applicability: string): boolean => {
  return (
    applicability === 'No' ||
    applicability === 'Activity NA' ||
    applicability === 'Customer NA'
  );
};

export const isNoAIAdoption = (aiAdoptionScore: string): boolean => {
  return aiAdoptionScore === '0';
};

export const validateRequiredFields = (formData: ActivityFormData): boolean => {
  const isApplicableValue = isApplicable(formData.applicability);

  // Basic required fields that are always needed
  const basicFieldsValid = !!(
    formData.sdlcPhase &&
    formData.activity &&
    formData.applicability
  );

  // AI Adoption Score is only required when applicability is 'Yes'
  if (isApplicableValue) {
    return basicFieldsValid && !!formData.aiAdoptionScore;
  }

  // When not applicable, only basic fields are required
  return basicFieldsValid;
};

export const validateAITools = (aiToolUsed: string | string[]): boolean => {
  return Array.isArray(aiToolUsed) ? aiToolUsed.length > 0 : !!aiToolUsed;
};

export const validateAccelerators = (
  acceleratorsUsed: string | string[]
): boolean => {
  return Array.isArray(acceleratorsUsed)
    ? acceleratorsUsed.length > 0
    : !!acceleratorsUsed;
};

export const validateAIToolsOrAccelerators = (
  formData: ActivityFormData
): boolean => {
  const hasAITools = validateAITools(formData.aiToolUsed);
  const hasAccelerators = validateAccelerators(formData.acceleratorsUsed);
  return hasAITools || hasAccelerators;
};

export const validateOptionalFields = (formData: ActivityFormData): boolean => {
  return !!(
    validateAIToolsOrAccelerators(formData) &&
    formData.workDoneByAI > 0 &&
    formData.hoursSaved > 0 &&
    formData.revenueGenerated &&
    formData.benefitTo &&
    formData.clientApproved &&
    formData.qualitativeBenefits.length > 0 &&
    formData.comments.trim()
  );
};

export const isFormValid = (formData: ActivityFormData): boolean => {
  const requiredFieldsValid = validateRequiredFields(formData);

  // If not applicable, only required fields are needed
  if (isNotApplicable(formData.applicability)) {
    return requiredFieldsValid;
  }

  // If AI Adoption score is 0, only required fields are needed
  if (isNoAIAdoption(formData.aiAdoptionScore)) {
    return requiredFieldsValid;
  }

  // If applicable (Yes) and AI Adoption score > 0, required fields + AI tools/accelerators are needed
  return requiredFieldsValid && validateAIToolsOrAccelerators(formData);
};

export const hasFormChanges = (
  formData: ActivityFormData,
  originalFormData: ActivityFormData | null
): boolean => {
  if (!originalFormData) {
    return false;
  }

  return (
    formData.sdlcPhase !== originalFormData.sdlcPhase ||
    formData.activity !== originalFormData.activity ||
    formData.applicability !== originalFormData.applicability ||
    formData.aiAdoptionScore !== originalFormData.aiAdoptionScore ||
    formData.aiToolUsed !== originalFormData.aiToolUsed ||
    formData.clientApproved !== originalFormData.clientApproved ||
    formData.acceleratorsUsed !== originalFormData.acceleratorsUsed ||
    formData.workDoneByAI !== originalFormData.workDoneByAI ||
    formData.hoursSaved !== originalFormData.hoursSaved ||
    formData.revenueGenerated !== originalFormData.revenueGenerated ||
    formData.benefitTo !== originalFormData.benefitTo ||
    JSON.stringify(formData.qualitativeBenefits) !==
      JSON.stringify(originalFormData.qualitativeBenefits) ||
    formData.comments !== originalFormData.comments
  );
};

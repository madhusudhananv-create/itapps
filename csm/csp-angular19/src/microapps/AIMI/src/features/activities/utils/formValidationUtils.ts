import type { ActivityFormData, AIToolDetails } from '../types/activityTypes';

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

// Each selected AI tool must have an access type, and a license count when "Licensed"
export const validateAIToolDetails = (
  aiToolUsed: string | string[],
  aiToolDetails?: AIToolDetails
): boolean => {
  const tools = Array.isArray(aiToolUsed)
    ? aiToolUsed
    : aiToolUsed
    ? [aiToolUsed]
    : [];

  if (tools.length === 0) return true;

  return tools.every((tool) => {
    const details = aiToolDetails?.[tool];
    if (!details?.accessType) return false;
    if (details.accessType === 'Licensed' && !(details.licenseCount > 0)) {
      return false;
    }
    return true;
  });
};

// Lists everything that stops an activity from being submitted, using the same rules
// as the Add/Edit Activity modal. Used to validate activities that never went through
// that modal (e.g. imported from Excel) before they are submitted.
export const getActivityValidationErrors = (
  activity: ActivityFormData
): string[] => {
  const errors: string[] = [];

  if (!activity.applicability) {
    errors.push('Applicability is required');
    return errors;
  }

  if (!isApplicable(activity.applicability)) return errors;

  if (!activity.aiAdoptionScore) {
    errors.push('AI Adoption Score is required');
    return errors;
  }

  if (isNoAIAdoption(activity.aiAdoptionScore)) return errors;

  if (!validateAIToolsOrAccelerators(activity)) {
    errors.push('Select at least one AI tool or accelerator');
  }

  if (!validateAIToolDetails(activity.aiToolUsed, activity.aiToolDetails)) {
    errors.push(
      'Configure AI tool details (access type, and number of licenses when Licensed)'
    );
  }

  if (
    activity.aiAdoptionScore === '4' &&
    !(Number(activity.workDoneByAI) > 0)
  ) {
    errors.push('% Work Done by AI must be greater than 0 for Full Adoption');
  }

  return errors;
};

export const validateOptionalFields = (formData: ActivityFormData): boolean => {
  return !!(
    validateAIToolsOrAccelerators(formData) &&
    formData.workDoneByAI > 0 &&
    formData.hoursSaved > 0 &&
    formData.revenueGenerated &&
    formData.benefitTo &&
    //formData.clientApproved &&
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
  if (!requiredFieldsValid || !validateAIToolsOrAccelerators(formData)) {
    return false;
  }

  // When AI Tools Used is selected, its details and Client Approved become mandatory
  /* if (validateAITools(formData.aiToolUsed)) {
    return (
      //!!formData.clientApproved &&
      validateAIToolDetails(formData.aiToolUsed)
    );
  } */

  return true;
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
    //formData.clientApproved !== originalFormData.clientApproved ||
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

import { useAimiLookupData } from './useAimiLookupData';

// Replaces the hardcoded QUALITATIVE_BENEFITS / AI_ADOPTION_SCORES /
// COMMON_AI_TOOLS / COMMON_ACCELERATORS constants in activityTypes.ts with
// lists fetched from the AIMI lookup tables. Same shapes as before
// ({value, label} / {value, label, description} / string[]), so they drop
// straight into the same `options={...}` props.
//
// APPLICABILITY_OPTIONS, BENEFIT_TO_OPTIONS, REVENUE_GENERATED_OPTIONS and
// CLIENT_APPROVED_OPTIONS stay as hardcoded constants in activityTypes.ts, and
// the License Provider list is back to the inline 'Client'/'Neurealm'
// literals in ProjectInfoSelection.tsx - none of those need to be dynamic.
export const useAimiOptionLists = () => {
  const { qualitativeBenefits, aiAdoptionScores, aiTools, accelerators, loading, error } =
    useAimiLookupData();

  return {
    qualitativeBenefits,
    aiAdoptionScores,
    aiTools,
    accelerators,
    loading,
    error,
  };
};

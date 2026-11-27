import { useCallback } from 'react';
import type { Practice } from '@shared/practices/types/practiceTypes';
import { useAimiLookupData } from './useAimiLookupData';

// Replaces shared/utils/questionnaireUtils.ts's synchronous, statically-
// imported-JSON functions. Same signatures/behaviour, backed by
// AimiLookupProvider's SQL-fetched data instead of questionnaire.json -
// each getter returns [] (or undefined for getPracticeData) while the
// underlying fetch is still in flight, matching how useProjectHierarchy's
// getters degrade during loading.
export const useQuestionnaireLookup = () => {
  const { questionnaireData, loading, error } = useAimiLookupData();

  const getPracticesFromQuestionnaire = useCallback((): string[] => {
    if (loading) return [];
    return questionnaireData.practices.map((p) => p.practice);
  }, [questionnaireData, loading]);
  console.log("useQuestionnaireLookupFile",questionnaireData, loading, error);

  const getSDLCPhasesForPractice = useCallback(
    (practiceName: string): string[] => {
      if (loading) return [];
      const practice = questionnaireData.practices.find(
        (p) => p.practice === practiceName
      );
      return practice ? practice.sdlcPhases.map((sp) => sp.phase) : [];
    },
    [questionnaireData, loading]
  );

  const getActivitiesForSDLCPhase = useCallback(
    (practiceName: string, sdlcPhase: string): string[] => {
      if (loading) return [];
      const practice = questionnaireData.practices.find(
        (p) => p.practice === practiceName
      );
      if (!practice) return [];
      const phase = practice.sdlcPhases.find((sp) => sp.phase === sdlcPhase);
      return phase ? phase.activities.map((a) => a.activity) : [];
    },
    [questionnaireData, loading]
  );

  const getPracticeData = useCallback(
    (practiceName: string): Practice | undefined => {
      if (loading) return undefined;
      return questionnaireData.practices.find(
        (p) => p.practice === practiceName
      );
    },
    [questionnaireData, loading]
  );

  return {
    getPracticesFromQuestionnaire,
    getSDLCPhasesForPractice,
    getActivitiesForSDLCPhase,
    getPracticeData,
    loading,
    error,
  };
};

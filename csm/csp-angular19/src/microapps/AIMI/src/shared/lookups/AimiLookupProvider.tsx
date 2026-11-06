import React, { useEffect, useMemo, useState } from 'react';
import type { QuestionnaireData } from '@shared/practices/types/practiceTypes';
import { useAuth } from '@auth/hooks/useAuth';
import {
  fetchQuestionnaireData,
  fetchQualitativeBenefitOptions,
  fetchAiAdoptionScoreOptions,
  fetchAiToolOptions,
  fetchAcceleratorOptions,
} from './aimiLookupService';
import type {
  QualitativeBenefitOption,
  AiAdoptionScoreOption,
} from './aimiLookupService';
import {
  AimiLookupContext,
  type AimiLookupContextValue,
} from './AimiLookupContext';

const EMPTY_QUESTIONNAIRE: QuestionnaireData = { practices: [] };

interface AimiLookupProviderProps {
  children: React.ReactNode;
}

// Fetches every AIMI lookup/master-data list once (practices/phases/activities
// catalog + option lists) and exposes it via context, mirroring the same
// fetch-once-cache-via-Context pattern ProjectDataProvider already uses for
// the project hierarchy.
export const AimiLookupProvider: React.FC<AimiLookupProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [questionnaireData, setQuestionnaireData] =
    useState<QuestionnaireData>(EMPTY_QUESTIONNAIRE);
  const [qualitativeBenefits, setQualitativeBenefits] = useState<
    QualitativeBenefitOption[]
  >([]);
  const [aiAdoptionScores, setAiAdoptionScores] = useState<
    AiAdoptionScoreOption[]
  >([]);
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [accelerators, setAccelerators] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    console.log('[AIMI] AimiLookupProvider effect fired', {
      isAuthenticated,
      isAuthLoading,
    });

    const load = async () => {
      console.log('[AIMI] AimiLookupProvider: starting lookup fetches');
      setLoading(true);
      setError(null);

      // Each lookup is independent, so one failing endpoint (e.g. a stored
      // procedure not yet deployed to this environment's DB) must not blank
      // out the others - settle each separately instead of Promise.all.
      const [
        questionnaireResult,
        benefitsResult,
        scoresResult,
        toolsResult,
        accelsResult,
      ] = await Promise.allSettled([
        fetchQuestionnaireData(),
        fetchQualitativeBenefitOptions(),
        fetchAiAdoptionScoreOptions(),
        fetchAiToolOptions(),
        fetchAcceleratorOptions(),
      ]);

      if (cancelled) return;

      const failures: string[] = [];

      if (questionnaireResult.status === 'fulfilled') {
        setQuestionnaireData(questionnaireResult.value);
      } else {
        failures.push('practices/phases/activities');
        console.error(
          'Failed to load AIMI questionnaire data:',
          questionnaireResult.reason
        );
      }

      if (benefitsResult.status === 'fulfilled') {
        setQualitativeBenefits(benefitsResult.value);
      } else {
        failures.push('qualitative benefits');
        console.error(
          'Failed to load AIMI qualitative benefit options:',
          benefitsResult.reason
        );
      }

      if (scoresResult.status === 'fulfilled') {
        setAiAdoptionScores(scoresResult.value);
      } else {
        failures.push('AI adoption scores');
        console.error(
          'Failed to load AIMI AI adoption scores:',
          scoresResult.reason
        );
      }

      if (toolsResult.status === 'fulfilled') {
        setAiTools(toolsResult.value);
      } else {
        failures.push('AI tools');
        console.error('Failed to load AIMI AI tools:', toolsResult.reason);
      }

      if (accelsResult.status === 'fulfilled') {
        setAccelerators(accelsResult.value);
      } else {
        failures.push('accelerators');
        console.error(
          'Failed to load AIMI accelerators:',
          accelsResult.reason
        );
      }

      if (failures.length > 0) {
        setError(`Failed to load: ${failures.join(', ')}`);
      }
      setLoading(false);
    };

    if (isAuthenticated && !isAuthLoading) {
      load();
    } else if (!isAuthenticated && !isAuthLoading) {
      setQuestionnaireData(EMPTY_QUESTIONNAIRE);
      setQualitativeBenefits([]);
      setAiAdoptionScores([]);
      setAiTools([]);
      setAccelerators([]);
      setLoading(false);
      setError(null);
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading]);

  const value: AimiLookupContextValue = useMemo(
    () => ({
      questionnaireData,
      qualitativeBenefits,
      aiAdoptionScores,
      aiTools,
      accelerators,
      loading: isAuthLoading || loading,
      error,
    }),
    [
      questionnaireData,
      qualitativeBenefits,
      aiAdoptionScores,
      aiTools,
      accelerators,
      isAuthLoading,
      loading,
      error,
    ]
  );

  return (
    <AimiLookupContext.Provider value={value}>
      {children}
    </AimiLookupContext.Provider>
  );
};

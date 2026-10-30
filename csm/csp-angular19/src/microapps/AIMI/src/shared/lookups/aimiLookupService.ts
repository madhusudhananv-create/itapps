import { aimiApiClient } from '@shared/services/aimiApiClient';
import type { QuestionnaireData } from '@shared/practices/types/practiceTypes';

// Fetches for the AIMI lookup/master-data endpoints (usp_AIMI_Get*, tables
// from Release 2.6.3.sql) - the questionnaire practice/phase/activity catalog
// and the various option-list suggestion tables that used to be
// hardcoded/derived from a static questionnaire.json + activityTypes.ts
// constants in this client. Consumed via AimiLookupProvider, never called
// directly by components.

const ENDPOINTS = {
  PRACTICES: '/api/AllSys/GetAimiPractices',
  SDLC_PHASES: '/api/AllSys/GetAimiSdlcPhases',
  QUESTIONNAIRE_ACTIVITIES: '/api/AllSys/GetAimiQuestionnaireActivities',
  QUALITATIVE_BENEFITS: '/api/AllSys/GetAimiQualitativeBenefitOptions',
  AI_ADOPTION_SCORES: '/api/AllSys/GetAimiAiAdoptionScoreOptions',
  AI_TOOLS: '/api/AllSys/GetAimiAiToolOptions',
  ACCELERATORS: '/api/AllSys/GetAimiAcceleratorOptions',
};

interface ApiPracticeRow {
  ID: number;
  NAME: string;
  SORT_ORDER: number;
}

interface ApiSdlcPhaseRow {
  ID: number;
  PRACTICE_ID: number;
  PRACTICE_NAME: string;
  NAME: string;
  SORT_ORDER: number;
}

interface ApiQuestionnaireActivityRow {
  ID: number;
  SDLC_PHASE_ID: number;
  PRACTICE_NAME: string;
  SDLC_PHASE_NAME: string;
  ACTIVITY: string;
  SORT_ORDER: number;
}

interface ApiNamedRow {
  NAME: string;
  SORT_ORDER: number;
}

interface ApiNameOnlyRow {
  NAME: string;
}

interface ApiAiAdoptionScoreRow {
  SCORE: number;
  LABEL: string;
  DESCRIPTION: string;
  COLOR_HEX: string;
}

export interface QualitativeBenefitOption {
  value: string;
  label: string;
}

export interface AiAdoptionScoreOption {
  value: string;
  label: string;
  description: string;
}

/** Reassembles the flat practice/phase/activity rows into the nested tree
 * questionnaireUtils.ts's consumers already expect (was questionnaire.json). */
export const fetchQuestionnaireData = async (): Promise<QuestionnaireData> => {
  console.log('[AIMI] fetchQuestionnaireData: calling', ENDPOINTS.PRACTICES);
  const [practices, phases, activities] = await Promise.all([
    aimiApiClient.get<ApiPracticeRow[]>(ENDPOINTS.PRACTICES),
    aimiApiClient.get<ApiSdlcPhaseRow[]>(ENDPOINTS.SDLC_PHASES),
    aimiApiClient.get<ApiQuestionnaireActivityRow[]>(
      ENDPOINTS.QUESTIONNAIRE_ACTIVITIES
    ),
  ]);
  console.log('[AIMI] fetchQuestionnaireData: got practices', practices);

  return {
    practices: practices.map((p) => ({
      practice: p.NAME,
      sdlcPhases: phases
        .filter((ph) => ph.PRACTICE_NAME === p.NAME)
        .map((ph) => ({
          phase: ph.NAME,
          activities: activities
            .filter(
              (a) =>
                a.PRACTICE_NAME === p.NAME && a.SDLC_PHASE_NAME === ph.NAME
            )
            .map((a) => ({ activity: a.ACTIVITY })),
        })),
    })),
  };
};

export const fetchQualitativeBenefitOptions = async (): Promise<
  QualitativeBenefitOption[]
> => {
  const rows = await aimiApiClient.get<ApiNamedRow[]>(
    ENDPOINTS.QUALITATIVE_BENEFITS
  );
  return rows.map((r) => ({ value: r.NAME, label: r.NAME }));
};

export const fetchAiAdoptionScoreOptions = async (): Promise<
  AiAdoptionScoreOption[]
> => {
  const rows = await aimiApiClient.get<ApiAiAdoptionScoreRow[]>(
    ENDPOINTS.AI_ADOPTION_SCORES
  );
  return rows.map((r) => ({
    value: String(r.SCORE),
    label: r.LABEL,
    description: r.DESCRIPTION,
  }));
};

export const fetchAiToolOptions = async (): Promise<string[]> => {
  const rows = await aimiApiClient.get<ApiNameOnlyRow[]>(ENDPOINTS.AI_TOOLS);
  return rows.map((r) => r.NAME);
};

export const fetchAcceleratorOptions = async (): Promise<string[]> => {
  const rows = await aimiApiClient.get<ApiNameOnlyRow[]>(
    ENDPOINTS.ACCELERATORS
  );
  return rows.map((r) => r.NAME);
};


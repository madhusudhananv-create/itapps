import { createContext } from 'react';
import type { QuestionnaireData } from '@shared/practices/types/practiceTypes';
import type {
  QualitativeBenefitOption,
  AiAdoptionScoreOption,
} from './aimiLookupService';

export interface AimiLookupContextValue {
  questionnaireData: QuestionnaireData;
  qualitativeBenefits: QualitativeBenefitOption[];
  aiAdoptionScores: AiAdoptionScoreOption[];
  aiTools: string[];
  accelerators: string[];
  loading: boolean;
  error: string | null;
}

export const AimiLookupContext = createContext<
  AimiLookupContextValue | undefined
>(undefined);

import questionnaireData from '../assets/questionnaire.json';

// Import types from shared practices
import type {
  QuestionnaireData,
  Practice,
} from '@shared/practices/types/practiceTypes';

export const loadQuestionnaireData = (): QuestionnaireData => {
  return questionnaireData as QuestionnaireData;
};

export const getPracticesFromQuestionnaire = (): string[] => {
  const data = loadQuestionnaireData();
  return data.practices.map((practice) => practice.practice);
};

export const getSDLCPhasesForPractice = (practiceName: string): string[] => {
  const data = loadQuestionnaireData();
  const practice = data.practices.find((p) => p.practice === practiceName);
  if (!practice) return [];
  return practice.sdlcPhases.map((phase) => phase.phase);
};

export const getActivitiesForSDLCPhase = (
  practiceName: string,
  sdlcPhase: string
): string[] => {
  const data = loadQuestionnaireData();
  const practice = data.practices.find((p) => p.practice === practiceName);
  if (!practice) return [];

  const phase = practice.sdlcPhases.find((p) => p.phase === sdlcPhase);
  if (!phase) return [];

  return phase.activities.map((activity) => activity.activity);
};

export const getPracticeData = (practiceName: string): Practice | undefined => {
  const data = loadQuestionnaireData();
  return data.practices.find((p) => p.practice === practiceName);
};

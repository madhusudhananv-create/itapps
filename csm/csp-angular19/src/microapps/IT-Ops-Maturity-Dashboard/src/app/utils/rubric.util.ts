import { MaturityRubric } from '../models/maturity.model';

export const RUBRIC_LEVELS: { value: 1 | 2 | 3 | 4 | 5; label: string; key: keyof MaturityRubric }[] = [
  { value: 1, label: 'Ad Hoc', key: 'level1' },
  { value: 2, label: 'Developing', key: 'level2' },
  { value: 3, label: 'Defined', key: 'level3' },
  { value: 4, label: 'Managed', key: 'level4' },
  { value: 5, label: 'Optimized', key: 'level5' },
];

export function rubricScoreKey(score: number | string): keyof MaturityRubric {
  const numeric = typeof score === 'number' ? score : Number(score);
  return RUBRIC_LEVELS[numeric - 1]?.key ?? 'level1';
}

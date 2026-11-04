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

/**
 * Buckets an average score into the same "N - Label" maturity-level text
 * used everywhere else, matching the reference Excel formula exactly:
 * =IF(E7=0,"Not in scope",IFERROR(IF(score<2,"1 - Ad Hoc",IF(score<3,"2 -
 * Developing",IF(score<4,"3 - Defined",IF(score<5,"4 - Managed","5 -
 * Optimized")))),"N/A")) - where E7 is the "No of Applicable Parameters"
 * cell (parameters actually scored, not left NA), not the score itself.
 *
 * `applicableParamCount` should be passed whenever it's available (the
 * Dashboard's Domain Tracker has it) so "Not in scope" is driven by the real
 * E7=0 condition. Where it isn't available (a report row with only an
 * average score, no per-domain applicable-parameter count), a score of
 * exactly 0 is used as the fallback proxy for "nothing was applicable" -
 * this is what happens whenever every parameter was marked NA anyway, so the
 * two conditions coincide in practice.
 */
export function maturityLevelLabel(score: number | null | undefined, applicableParamCount?: number): string {
  if (applicableParamCount === 0) return 'Not in scope';
  if (score === null || score === undefined || typeof score !== 'number' || Number.isNaN(score)) return 'N/A';
  if (applicableParamCount === undefined && score === 0) return 'Not in scope';
  if (score < 2) return '1 - Ad Hoc';
  if (score < 3) return '2 - Developing';
  if (score < 4) return '3 - Defined';
  if (score < 5) return '4 - Managed';
  return '5 - Optimized';
}

import type { AIToolDetails } from '../types/activityTypes';
import {
  APPLICABILITY_OPTIONS,
  BENEFIT_TO_OPTIONS,
  REVENUE_GENERATED_OPTIONS,
} from '../types/activityTypes';

// Lists the imported text is matched against. The Select / Autocomplete fields in the
// Add/Edit modal only bind when a value exactly equals one of their options, so imported
// text has to be resolved to the canonical option (the lookup lists come from SQL).
export interface ImportLookups {
  aiTools: string[];
  accelerators: string[];
  qualitativeBenefits: string[];
}

export interface NormalizedImportFields {
  applicability: string;
  aiAdoptionScore: string;
  aiToolUsed: string[];
  aiToolDetails: AIToolDetails;
  acceleratorsUsed: string[];
  workDoneByAI: number;
  hoursSaved: number;
  revenueGenerated: string;
  benefitTo: string;
  qualitativeBenefits: string[];
  comments: string;
}

// Excel cells often carry non-breaking spaces / stray whitespace that defeat an
// exact comparison.
const clean = (value: unknown): string =>
  String(value ?? '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const matchOption = (value: string, options: string[]): string | undefined =>
  options.find((option) => clean(option).toLowerCase() === value.toLowerCase());

const splitList = (value: unknown): string[] =>
  String(value ?? '')
    .split(/[,;\n]/)
    .map(clean)
    .filter(Boolean);

// "50", "50%", "1,200.5" -> number; anything else -> NaN
const parseNumber = (value: unknown): number => {
  const text = clean(value).replace(/[%,]/g, '');
  return text === '' ? 0 : Number(text);
};

export const normalizeImportedRow = (
  row: Record<string, unknown>,
  lookups: ImportLookups
): { fields: NormalizedImportFields; errors: string[] } => {
  const errors: string[] = [];

  // Single-select fields: blank is allowed here (flagged at submit time), a value that
  // matches no option is an import error.
  const pickOption = (
    label: string,
    raw: unknown,
    options: string[]
  ): string => {
    const text = clean(raw);
    if (!text) return '';
    const match = matchOption(text, options);
    if (!match) {
      errors.push(`${label} "${text}" is not valid (use: ${options.join(', ')})`);
      return '';
    }
    return match;
  };

  const applicability = pickOption(
    'Applicability',
    row['Applicability'],
    APPLICABILITY_OPTIONS.map((o) => o.value)
  );
  const revenueGenerated = pickOption(
    'Revenue Generated',
    row['Revenue Generated'],
    REVENUE_GENERATED_OPTIONS.map((o) => o.value)
  );
  const benefitTo = pickOption(
    'Benefit To',
    row['Benefit To'],
    BENEFIT_TO_OPTIONS.map((o) => o.value)
  );

  // AI Adoption Score: accept "4", "4 - Full Adoption" or the label itself
  let aiAdoptionScore = '';
  const scoreText = clean(row['AI Adoption Score']);
  if (scoreText) {
    const byNumber = scoreText.match(/^([0-5])(?!\d)/);
    if (byNumber) {
      aiAdoptionScore = byNumber[1];
    } else {
      errors.push(`AI Adoption Score "${scoreText}" is not valid (use 0-5)`);
    }
  }

  const aiToolUsed = splitList(row['AI Tools Used']).map(
    (tool) => matchOption(tool, lookups.aiTools) ?? tool
  );
  const acceleratorsUsed = splitList(row['Accelerators Used']).map(
    (accelerator) => matchOption(accelerator, lookups.accelerators) ?? accelerator
  );

  const qualitativeBenefits: string[] = [];
  splitList(row['Qualitative Benefits']).forEach((benefit) => {
    const match = matchOption(benefit, lookups.qualitativeBenefits);
    if (match) {
      qualitativeBenefits.push(match);
    } else {
      errors.push(`Qualitative Benefit "${benefit}" is not valid`);
    }
  });

  const workDoneByAI = parseNumber(row['% Work Done by AI']);
  const hoursSaved = parseNumber(row['Hours Saved']);
  if (Number.isNaN(workDoneByAI) || workDoneByAI < 0 || workDoneByAI > 100) {
    errors.push('% Work Done by AI must be a number between 0 and 100');
  }
  if (Number.isNaN(hoursSaved) || hoursSaved < 0) {
    errors.push('Hours Saved must be a positive number');
  }

  // The template has no columns for per-tool access type / licenses / network, so
  // imported tools start with empty details; they are mandatory and checked on submit.
  const aiToolDetails: AIToolDetails = Object.fromEntries(
    aiToolUsed.map((tool) => [
      tool,
      { accessType: '', licenseCount: 0, networkType: '' },
    ])
  );

  return {
    fields: {
      applicability,
      aiAdoptionScore,
      aiToolUsed,
      aiToolDetails,
      acceleratorsUsed,
      workDoneByAI: Number.isNaN(workDoneByAI) ? 0 : workDoneByAI,
      hoursSaved: Number.isNaN(hoursSaved) ? 0 : hoursSaved,
      revenueGenerated,
      benefitTo,
      qualitativeBenefits,
      comments: String(row['Comments'] ?? '').trim(),
    },
    errors,
  };
};

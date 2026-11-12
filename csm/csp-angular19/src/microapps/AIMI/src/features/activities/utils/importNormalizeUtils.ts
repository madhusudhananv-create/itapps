import type { AIToolDetails } from '../types/activityTypes';
import {
  ACCESS_TYPE_OPTIONS,
  APPLICABILITY_OPTIONS,
  BENEFIT_TO_OPTIONS,
  NETWORK_TYPE_OPTIONS,
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

  // Per-tool details (Configure AI Tool Details pop-up). Each column holds either one value
  // applied to every tool, or a comma-separated list in the same order as "AI Tools Used".
  // Blank is allowed here - it is flagged at submit time like every other mandatory field.
  const accessTypes = splitList(row['Access Type']);
  const licenseCounts = splitList(row['No. of Licenses']);
  const networkTypes = splitList(row['Network Type']);
  const valueAt = (list: string[], index: number): string =>
    list.length <= 1 ? list[0] ?? '' : list[index] ?? '';

  const reported = new Set<string>();
  const reportOnce = (message: string) => {
    if (!reported.has(message)) {
      reported.add(message);
      errors.push(message);
    }
  };
  const accessOptions = ACCESS_TYPE_OPTIONS.map((o) => o.value);
  const networkOptions = NETWORK_TYPE_OPTIONS.map((o) => o.value);

  const aiToolDetails: AIToolDetails = Object.fromEntries(
    aiToolUsed.map((tool, index) => {
      const accessText = valueAt(accessTypes, index);
      let accessType = '';
      if (accessText) {
        accessType = matchOption(accessText, accessOptions) ?? '';
        if (!accessType) {
          reportOnce(`Access Type "${accessText}" is not valid (use: ${accessOptions.join(', ')})`);
        }
      }

      const networkText = valueAt(networkTypes, index);
      let networkType = '';
      if (networkText) {
        networkType = matchOption(networkText, networkOptions) ?? '';
        if (!networkType) {
          reportOnce(`Network Type "${networkText}" is not valid (use: ${networkOptions.join(', ')})`);
        }
      }

      const licenseText = valueAt(licenseCounts, index);
      let licenseCount = licenseText === '' ? 0 : Number(licenseText);
      if (Number.isNaN(licenseCount) || licenseCount < 0) {
        reportOnce(`No. of Licenses "${licenseText}" must be a positive number`);
        licenseCount = 0;
      }
      // The pop-up only collects a license count for Licensed tools
      if (accessType !== 'Licensed') licenseCount = 0;

      return [tool, { accessType, licenseCount, networkType }];
    })
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

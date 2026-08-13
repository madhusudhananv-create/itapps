/** Qualitative bands aligned with typical OHSE / HIRA-style consequence scales. */
export const CONSEQUENCE_SCALE: Record<
  number,
  { label: string; detail: string }
> = {
  1: { label: 'Minor', detail: 'Negligible injury or financial impact' },
  2: { label: 'Moderate', detail: 'First aid / localized disruption' },
  3: { label: 'Major', detail: 'Medical treatment / significant loss' },
  4: { label: 'Severe', detail: 'Serious harm / major operational impact' },
  5: { label: 'Catastrophic', detail: 'Fatality or existential/critical failure' },
};

/** CIA-style consequence bands (0–5) for confidentiality / integrity / availability impact. */
export const CIA_CONSEQUENCE_SCALE: Record<
  number,
  { label: string; detail: string }
> = {
  0: {
    label: 'None',
    detail:
      'No consequences — for example the control has eliminated them.',
  },
  1: {
    label: 'Insignificant',
    detail:
      'No visible impact to company reputation/customer satisfaction. No potential impact on market share/brand values.',
  },
  2: {
    label: 'Minor',
    detail:
      'Potential impact on market share/brand values. Internal control significant deficiency.',
  },
  3: {
    label: 'Significant',
    detail:
      'Visible reputation/satisfaction impact. Reputation and brand value will be affected in the short term. Internal control material weakness.',
  },
  4: {
    label: 'Major',
    detail:
      'Visible adverse brand value/market share publicity. Key alliances are threatened. Loss of key customers. SEC investigation or matter. Financial restatement.',
  },
  5: {
    label: 'Critical',
    detail:
      'Major company reputation impact. Revocation of licenses or regulatory registrations. Major customer satisfaction impact. Inability to service customers. Loss of major investor/street confidence.',
  },
};

export const LIKELIHOOD_SCALE: Record<number, { label: string; detail: string }> = {
  1: { label: 'Rare', detail: 'Not expected in normal operations' },
  2: { label: 'Unlikely', detail: 'Could occur at some time' },
  3: { label: 'Possible', detail: 'Might occur under certain conditions' },
  4: { label: 'Likely', detail: 'Will probably occur in most situations' },
  5: { label: 'Almost Certain', detail: 'Expected to occur frequently' },
};

/** Likelihood value bands (0–5): guideline, probability, frequency. */
export const LIKELIHOOD_VALUE_SCALE: Record<
  number,
  { label: string; guideline: string; probability: string; frequency: string }
> = {
  0: {
    label: 'Impossible',
    guideline:
      'The event is impossible - for example the risk source has been removed or activity has been stopped. Then do not consider as risk.',
    probability: '0%',
    frequency: 'will not happen',
  },
  1: {
    label: 'Rare',
    guideline:
      'The possibility of occurrence is so low. These are exceptional circumstances or it may never happen',
    probability: '<1%',
    frequency: 'it may never happen',
  },
  2: {
    label: 'Remote',
    guideline: 'Unlikely to happen',
    probability: '2-10%',
    frequency: 'doubt that it occurs',
  },
  3: {
    label: 'Moderate',
    guideline: 'Believe it could occur',
    probability: '11-50%',
    frequency: 'is at least 1 per year',
  },
  4: {
    label: 'Likely',
    guideline: 'May occur sometimes',
    probability: '51-90%',
    frequency: 'occasionally during a year',
  },
  5: {
    label: 'Frequent',
    guideline: 'Known to occur. Almost certain.',
    probability: '>90%',
    frequency: 'several times in a year',
  },
};

export const RISK_CATEGORIES = [
  'Financial',
  'Technical',
  'Operational',
  'Strategic',
  'Compliance',
  'Reputational',
  'Environmental',
  'Health & Safety',
  'Business',
  'Regulatory',
  'Other',
] as const;

export const BUSINESS_UNITS = [
  'Healthcare',
  'CIT',
  'Tech',
  'SEAD',
  'India',
  'UK',
  'India & UK',
] as const;

export const RISK_TREATMENTS = [
  'Reduce',
  'Invest',
  'CCB',
  'Weekly sequence call',
] as const;

/** Organizational function lens / org-function analytics catalog. */
export const ORG_FUNCTIONS = [
  'IT',
  'Finance',
  'Operations',
  'HR',
  'Legal',
  'Procurement',
  'Quality',
  'TAG',
  'Infosec',
  'TSC',
  'Admin function',
  'SOC',
  'Network',
  'Server',
  'TAM team',
  'Sales',
  'L&D',
] as const;

/** Single pick list for risk log: business unit and/or function. */
export const BUSINESS_UNIT_FUNCTION_OPTIONS = [
  'Enterprise wide',
  'CIT',
  'Healthcare',
  'Tech',
  'SEAD',
  'India',
  'UK',
  'India & UK',
  'IT',
  'Finance',
  'Operations',
  'HR',
  'Legal',
  'Procurement',
  'Quality',
  'TAG',
  'Infosec',
  'TSC',
  'Admin function',
  'SOC',
  'Network',
  'Server',
  'TAM team',
  'Sales',
  'L&D',
] as const;

/** Risk log — common risk titles (editable `p-select` on Log New Risk). */
export const RISK_LOG_TITLE_PRESETS = [
  'Business',
  'Resource',
  'geopolitical risk',
  'business risk',
  'pipeline risk',
  'Business risk',
] as const;

/** Risk log — geography / hub (core identification). */
export const RISK_LOG_LOCATION_OPTIONS = [
  'Vadodara',
  'Chennai',
  'Pune',
  'Princeton',
  'Kochi',
  'Bangalore',
  'All locations',
] as const;

/** Risk log — threat source (dropdown). */
export const RISK_LOG_THREAT_OPTIONS = [
  'Market / client',
  'People / talent',
  'Technology / systems',
  'Cyber / information security',
  'Financial / economic',
  'Legal / regulatory',
  'Operations / delivery',
  'Third-party / supply chain',
  'Physical / environmental',
  'Other',
] as const;

/** Risk log — vulnerability / weakness (dropdown). */
export const RISK_LOG_VULNERABILITY_OPTIONS = [
  'Control weakness or gap',
  'Single point of failure',
  'Skill or knowledge gap',
  'Dependency on vendor or partner',
  'Insufficient governance or oversight',
  'Resource or capacity constraint',
  'Legacy or undocumented process',
  'Contract / commercial exposure',
  'Other',
] as const;

export function riskSeverityClass(
  rating: number
): 'low' | 'medium' | 'high' {
  if (rating <= 6) return 'low';
  if (rating <= 15) return 'medium';
  return 'high';
}

/** Product consequence × likelihood, bands match the org Risk Rating Matrix legend. */
export type RiskRatingMatrixBand =
  | 'none'
  | 'low'
  | 'moderate'
  | 'high'
  | 'catastrophic';

/** Map numeric product (0–25 with 0–5 inputs) to matrix color band. */
export function riskRatingMatrixBandFromProduct(
  product: number
): RiskRatingMatrixBand {
  if (!Number.isFinite(product) || product <= 0) {
    return 'none';
  }
  if (product >= 20) {
    return 'catastrophic';
  }
  if (product >= 10) {
    return 'high';
  }
  if (product >= 5) {
    return 'moderate';
  }
  return 'low';
}

export const RISK_RATING_MATRIX_BAND_LABELS: Record<
  RiskRatingMatrixBand,
  string
> = {
  none: '',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  catastrophic: 'Catastrophic',
};

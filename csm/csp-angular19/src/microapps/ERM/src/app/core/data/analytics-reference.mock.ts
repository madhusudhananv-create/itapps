/**
 * Reference analytics snapshot (Neurealm ERM dashboard style).
 * Static figures aligned to the executive dashboard wireframe.
 */
export const ANALYTICS_REFERENCE_KPIS = {
  pctRiskGteThreshold: 69.29,
  countRiskGteThreshold: 88,
  avgRiskThreshold: 10,
  thresholdBandLabel: 'Catastrophic & High',
  responseProgressPct: 90.91,
} as const;

export const ANALYTICS_RISK_RATING_PIE = {
  labels: ['High', 'Catastrophic'] as const,
  data: [85, 3] as const,
  backgroundColor: ['rgba(249, 115, 22, 0.88)', 'rgba(220, 38, 38, 0.92)'] as const,
  borderColor: ['rgba(194, 65, 12, 1)', 'rgba(153, 27, 27, 1)'] as const,
} as const;

export const ANALYTICS_ACTION_PLAN_PIE = {
  labels: ['WIP — Work In Progress', 'Deferred', 'TBD'] as const,
  data: [80, 4, 1] as const,
  backgroundColor: [
    'rgba(34, 197, 94, 0.85)',
    'rgba(234, 179, 8, 0.88)',
    'rgba(251, 146, 60, 0.85)',
  ] as const,
  borderColor: ['rgba(22, 163, 74, 1)', 'rgba(202, 138, 4, 1)', 'rgba(234, 88, 12, 1)'] as const,
} as const;

/** Rows: Frequent(5) → Rare(1). Cols: Critical(5) → Insignificant(1). */
export const ANALYTICS_LIKELIHOOD_LABELS = [
  'Frequent (5)',
  'Likely (4)',
  'Moderate (3)',
  'Remote (2)',
  'Rare (1)',
] as const;

export const ANALYTICS_CONSEQUENCE_LABELS = [
  'Critical (5)',
  'Major (4)',
  'Significant (3)',
  'Minor (2)',
  'Insignificant (1)',
] as const;

export const ANALYTICS_HEAT_MATRIX: readonly (readonly number[])[] = [
  [1, 0, 0, 0, 0],
  [2, 23, 3, 0, 0],
  [12, 44, 24, 0, 0],
  [3, 5, 4, 1, 0],
  [2, 3, 1, 1, 0],
] as const;

export const ANALYTICS_TOP_CATEGORIES = [
  { name: 'Operational Risk', count: 26 },
  { name: 'Strategic Risk', count: 19 },
  { name: 'Contract Risk', count: 17 },
  { name: 'Talent & Human Capital', count: 7 },
  { name: 'Cybersecurity Risk', count: 4 },
] as const;

export const ANALYTICS_TOP_BUSINESS_UNITS = [
  { name: 'Finance', count: 14 },
  { name: 'SOC', count: 9 },
  { name: 'Tech', count: 9 },
  { name: 'Legal', count: 9 },
  { name: 'India & UK', count: 9 },
] as const;

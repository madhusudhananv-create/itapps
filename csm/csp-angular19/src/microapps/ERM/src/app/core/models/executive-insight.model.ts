/** Risk band for executive insight categories (Neurealm / NeuGAIN context). */
export type ExecutiveInsightRiskLevel = 'High' | 'Medium' | 'Low';

export type ExecutiveInsightCategoryId =
  | 'geopolitical'
  | 'financial'
  | 'business'
  | 'people'
  | 'technical'
  | 'security';

/**
 * Neurealm ERM-style risk register category for section labeling (CEO / board taxonomy).
 */
export type ExecutiveRiskRegisterCategory =
  | 'Financial'
  | 'Business'
  | 'Operational'
  | 'IT'
  | 'Sourcing'
  | 'Procurement'
  | 'Sales'
  | 'Legal'
  | 'Revenue'
  | 'Human Capital'
  | 'Reputation'
  | 'Compliance'
  | 'Security';

export interface ExecutiveInsight {
  readonly id: ExecutiveInsightCategoryId;
  readonly title: string;
  readonly headline: string;
  /** Register category shown in place of a generic "Assessment" label. */
  readonly registerCategory: ExecutiveRiskRegisterCategory;
  /** Key insight statements (bullet list in UI). */
  readonly insightBullets: readonly string[];
  readonly riskLevel: ExecutiveInsightRiskLevel;
  /** At least two items in production bundles. */
  readonly mitigations: readonly string[];
  /** Optional leading indicators or watch items. */
  readonly signals?: readonly string[];
}

export interface ExecutiveInsightBundle {
  /** When this bundle was assembled (client clock). */
  readonly generatedAt: string;
  /** Calendar key used for daily rotation (YYYY-MM-DD, local). */
  readonly effectiveDate: string;
  readonly insights: readonly ExecutiveInsight[];
}

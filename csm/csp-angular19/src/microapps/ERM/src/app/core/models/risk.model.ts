import type { RiskApproverRole } from '../risk-approver.constants';

export type RiskStatus = 'open' | 'closed';

/** Workflow state captured on risk log (register open/closed is derived from this). */
export const RISK_LIFECYCLE_STATUSES = ['Draft', 'Open', 'Closed'] as const;
export type RiskLifecycleStatus = (typeof RISK_LIFECYCLE_STATUSES)[number];

export const RISK_STRATEGY_OPTIONS = [
  'Risk Acceptance',
  'Risk Avoidance',
  'Risk Reduction',
  'Risk Transfer',
] as const;
export type RiskStrategyOption = (typeof RISK_STRATEGY_OPTIONS)[number];

export interface RiskRecord {
  id: string;
  title: string;
  description: string;
  /** Business impact statement captured during risk identification. */
  businessImpact: string;
  /** Threat source facet (risk log dropdown). */
  threat: string;
  /** Weakness or gap that could allow the threat (risk log dropdown). */
  vulnerability: string;
  /** Primary geography / hub (risk log dropdown). */
  location: string;
  /** Planned remediation / treatment narrative. */
  riskRemediationPlan: string;
  /** Individual accountable for executing the risk treatment plan. */
  personResponsibleRiskTreatment: string;
  /** Actual or expected treatment completion date (YYYY-MM-DD). */
  riskTreatmentCompletionDate: string;
  /** Current implementation state for the risk treatment plan. */
  riskTreatmentImplementationStatus: string;
  /** Verification status after risk treatment implementation. */
  riskTreatmentEffectivenessStatus: string;
  /** Person who verified treatment effectiveness. */
  riskTreatmentEffectivenessVerifiedBy: string;
  /** Date treatment effectiveness was verified (YYYY-MM-DD). */
  riskTreatmentEffectivenessVerifiedDate: string;
  /** Free-text verification notes. */
  riskTreatmentEffectivenessComments: string;
  /** Next scheduled risk assessment (YYYY-MM-DD). */
  nextRiskAssessmentDate: string;
  category: string;
  businessUnit: string;
  account: string;
  treatment: string;
  consequence: number;
  likelihood: number;
  /** Optional USD exposure (inherent assessment). */
  inherentRiskExposureUsd: number | null;
  inherentRating: number;
  residualConsequence: number;
  residualLikelihood: number;
  /** Optional USD exposure (treatment / residual). */
  residualRiskExposureUsd: number | null;
  residualRating: number;
  identificationDate: string;
  /** Person who identified / logged the risk (defaults from sign-in). */
  riskIdentifiedBy: string;
  /** Risk owner display name. */
  owner: string;
  /** Risk owner contact email. */
  ownerEmail: string;
  /** Selected approver role; notification is sent to the mapped mailbox on submit. */
  riskApprover: RiskApproverRole;
  /** Named individual for the approver role (may differ from role label). */
  riskApproverName: string;
  /** Approver contact email. */
  riskApproverEmail: string;
  /** Derived for analytics: closed when lifecycle is Closed, otherwise open. */
  status: RiskStatus;
  riskLifecycleStatus: RiskLifecycleStatus;
  riskStrategy: RiskStrategyOption;
  /** Target closure date (YYYY-MM-DD); not in the past at log time. */
  targetClosureDate: string;
  /** Organizational function for analytics (e.g. Finance, IT, Operations). */
  orgFunction: string;
  /** 0–100, higher = stronger controls */
  controlEffectiveness: number;
  loggedAt: string;
}

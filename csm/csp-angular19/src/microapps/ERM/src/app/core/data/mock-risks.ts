import {
  RiskRecord,
  type RiskLifecycleStatus,
  RISK_STRATEGY_OPTIONS,
} from '../models/risk.model';
import {
  RISK_APPROVER_MAILBOX,
  RISK_APPROVER_ROLES,
} from '../risk-approver.constants';
import {
  BUSINESS_UNITS,
  ORG_FUNCTIONS,
  RISK_CATEGORIES,
  RISK_LOG_LOCATION_OPTIONS,
  RISK_LOG_THREAT_OPTIONS,
  RISK_LOG_VULNERABILITY_OPTIONS,
  RISK_TREATMENTS,
} from '../risk-rating.constants';

function isoDate(monthsAgo: number, day = 15): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

const OPEN_LIFECYCLE: RiskLifecycleStatus[] = ['Draft', 'Open'];

function targetClosureYmd(i: number): string {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() + 45 + (i % 120));
  return t.toISOString().slice(0, 10);
}

/** Deterministic mock portfolio for charts and filters. */
export function buildMockRisks(): RiskRecord[] {
  const rows: RiskRecord[] = [];
  let id = 10001;
  for (let i = 0; i < 48; i++) {
    const c = i % 6;
    const l = i % 6;
    const inherent = c * l;
    const rc = Math.max(0, c - (i % 2));
    const rl = Math.max(0, l - ((i + 1) % 2));
    const residual = rc * rl;
    const bu = pick(BUSINESS_UNITS, i);
    const category = pick(RISK_CATEGORIES, i + 3);
    const fn = pick(ORG_FUNCTIONS, i + 1);
    const treatment = pick(RISK_TREATMENTS, i);
    const riskLifecycleStatus: RiskLifecycleStatus =
      i % 4 === 0 ? 'Closed' : OPEN_LIFECYCLE[i % 2];
    const status: RiskRecord['status'] =
      riskLifecycleStatus === 'Closed' ? 'closed' : 'open';
    const riskStrategy = pick(RISK_STRATEGY_OPTIONS, i);
    const targetClosureDate = targetClosureYmd(i);
    const riskApprover = RISK_APPROVER_ROLES[i % RISK_APPROVER_ROLES.length];
    const account = `ACC-${(1000 + (i % 12)).toString()}`;
    const threat = pick(RISK_LOG_THREAT_OPTIONS, i + 2);
    const vulnerability = pick(RISK_LOG_VULNERABILITY_OPTIONS, i + 5);
    const location = pick(RISK_LOG_LOCATION_OPTIONS, i);
    const nextAssessment = targetClosureYmd(i + 7);
    const ce =
      inherent > 0
        ? Math.round(
            Math.min(100, Math.max(35, 100 * (1 - residual / inherent)))
          )
        : 70;

    rows.push({
      id: String(id++),
      title: `Enterprise risk scenario ${i + 1}`,
      description: `Mock narrative for portfolio analytics — ${category.toLowerCase()} exposure in ${bu}.`,
      businessImpact: `Potential ${category.toLowerCase()} impact on delivery, revenue, or client commitments.`,
      threat,
      vulnerability,
      location,
      riskRemediationPlan: `Mitigation track ${i + 1}: ${treatment} with quarterly review.`,
      personResponsibleRiskTreatment: `Treatment owner ${(i % 6) + 1}`,
      riskTreatmentCompletionDate: targetClosureDate,
      riskTreatmentImplementationStatus: i % 4 === 0 ? 'Completed' : 'WIP',
      riskTreatmentEffectivenessStatus: i % 3 === 0 ? 'Effective' : 'Pending verification',
      riskTreatmentEffectivenessVerifiedBy: `Verifier ${(i % 5) + 1}`,
      riskTreatmentEffectivenessVerifiedDate: targetClosureDate,
      riskTreatmentEffectivenessComments: `Verification note ${i + 1}`,
      nextRiskAssessmentDate: nextAssessment,
      category,
      businessUnit: bu,
      account,
      treatment,
      consequence: c,
      likelihood: l,
      inherentRiskExposureUsd: i % 3 === 0 ? null : 10_000 + i * 1_000,
      inherentRating: inherent,
      residualConsequence: rc,
      residualLikelihood: rl,
      residualRiskExposureUsd: i % 2 === 0 ? null : 5_000 + i * 800,
      residualRating: residual,
      identificationDate: isoDate(i % 18, 3 + (i % 25)),
      riskIdentifiedBy: `Portfolio identifier ${(i % 8) + 1}`,
      owner: `Portfolio owner ${(i % 9) + 1}`,
      ownerEmail: `owner.${(i % 9) + 1}@neuronaut.corp`,
      riskApprover,
      riskApproverName: `${riskApprover} approver`,
      riskApproverEmail: RISK_APPROVER_MAILBOX[riskApprover],
      status,
      riskLifecycleStatus,
      riskStrategy,
      targetClosureDate,
      orgFunction: fn,
      controlEffectiveness: ce,
      loggedAt: new Date(2025, i % 12, 5 + (i % 20)).toISOString(),
    });
  }
  return rows;
}

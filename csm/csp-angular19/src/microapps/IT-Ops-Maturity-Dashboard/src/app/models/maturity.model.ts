export type MaturityScore = 'NA' | 1 | 2 | 3 | 4 | 5;

export type DomainStatus = 'Not Started' | 'Draft' | 'In Progress' | 'Pending Review' | 'Approved';

export interface MaturityRubric {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
}

export type FindingStatus = 'Pending' | 'Accepted' | 'Rejected';

/** Lifecycle of a request to push out a finding's target closure date. */
export type RetargetStatus = 'None' | 'Requested' | 'Approved' | 'Rejected';

export interface MaturityParameter {
  id: string;
  category: string;
  name: string;
  definition: string;
  rubric: MaturityRubric;
  minRequiredScore?: number;
  score: MaturityScore | null;
  notes: string;
  /** ITOPS_SCORE.ID backing this parameter's score - created on first save; evidence attaches to this, not the parameter. */
  scoreId?: number;
  /** Every evidence file attached to this parameter's score - any number of them, not just one. */
  evidenceFiles: { id: number; fileName: string }[];
  provider?: string;
  findingStatus?: FindingStatus;
  /** ITOPS_FINDING.ID backing this parameter's finding, when loaded from the real API. */
  findingId?: number;
  /** Mandatory justification captured when the Assessee rejects a finding. */
  findingRejectionComment?: string;
  /** Target date for closing out this finding; retargeting requests a revision to it. */
  findingTargetDate?: string;
  findingRetargetStatus?: RetargetStatus;
  /** Revised date proposed by the Assessee, pending the Reviewer's decision. */
  findingRetargetRequestedDate?: string;
  findingRetargetReason?: string;
  /** Reviewer's reason when approving/rejecting the retarget request. */
  findingRetargetDecisionComment?: string;
  /** Assessee's latest remediation-progress note on an accepted finding. */
  findingActionTaken?: string;
}

export interface TechnologyDomain {
  id: string;
  name: string;
  coeSpoc: string;
  coeSpocEmail?: string;
  reviewer: string;
  reviewerEmail?: string;
  status: DomainStatus;
  parameters: MaturityParameter[];
  returnComment?: string;
  targetDate?: string;
  lastUpdated?: string;
  suspended?: boolean;
}

export type AssessmentStatus = 'Open' | 'Closed' | 'Suspended';
export type DueStatus = 'Past Due' | 'On Target' | null;

export type UserRole = 'SPOC' | 'FunctionHead' | 'GDH' | 'NoAccess';

export interface CurrentUser {
  name: string;
  email: string | null;
  role: UserRole;
  /** Domain ids this identity is allowed to see/act on, resolved alongside role. */
  allowedDomainIds: string[];
  /** Domain ids where this identity is COE SPOC (can submit/edit), independent of reviewDomainIds. */
  spocDomainIds: string[];
  /** Domain ids where this identity is Reviewer/FunctionHead (can approve/return), independent of spocDomainIds. */
  reviewDomainIds: string[];
}

export interface DomainSummary {
  id: string;
  name: string;
  coeSpoc: string;
  coeSpocEmail?: string;
  /** Real EMP_ID of the assigned COE SPOC, when the row came from the DB-backed API rather than the CSV mock. */
  coeSpocEmpId?: string | null;
  reviewer: string;
  reviewerEmail?: string;
  reviewerEmpId?: string | null;
  status: DomainStatus;
  averageScore: number | null;
  maturityPercent: number | null;
  maturityLevel: string | null;
  paramCount: number;
  sumScores: number;
  maxPossible: number;
  /** Which account this row belongs to - the Dashboard now shows every account the viewer is assigned to at once, so each row needs to say which one it's from. */
  accountId?: string;
  accountName?: string;
  /** Whether the viewer is personally the Assessor on this domain for this account, per their own assignment rows. */
  editable?: boolean;
  /** Whether the viewer is personally the Reviewer on this domain for this account, per their own assignment rows. */
  reviewable?: boolean;
}

export interface TopRisk {
  domain: string;
  category: string;
  parameter: string;
  currentScore: number;
  gap: number;
  recommendation: string;
}

export interface EnterpriseSummary {
  overallAverageScore: number;
  overallMaturityPercent: number;
  overallMaturityLevel: string;
  domainsCompleted: number;
  domainsInProgress: number;
  domainsNotStarted: number;
  totalParamCount: number;
  totalSumScores: number;
  totalMaxPossible: number;
}

export const MATURITY_LEVEL_LABELS: Record<number, string> = {
  1: 'Ad Hoc',
  2: 'Developing',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimized',
};

export interface ReportRow {
  accountName: string;
  businessUnit: string;
  domainId: string;
  domainName: string;
  coeSpoc: string;
  reviewer: string;
  coeSpocEmail?: string;
  reviewerEmail?: string;
  assessmentStatus: AssessmentStatus;
  dueStatus: DueStatus;
  targetDate: string | null;
  lastUpdated: string;
  daysSinceUpdate: number;
  draftOver15Days: boolean;
  draftOver30Days: boolean;
  noManagementUpdate: boolean;
  longDated: boolean;
  findingsAccepted: number;
  findingsRejected: number;
  findingsPending: number;
  averageScore: number | null;
  maturityPercent: number | null;
}

export function maturityLevelFromScore(avgScore: number): string {
  const rounded = Math.round(avgScore);
  return MATURITY_LEVEL_LABELS[Math.min(5, Math.max(1, rounded))];
}

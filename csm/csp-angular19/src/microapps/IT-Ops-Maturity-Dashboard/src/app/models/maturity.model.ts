export type MaturityScore = 'NA' | 1 | 2 | 3 | 4 | 5;

export type DomainStatus = 'Not Started' | 'Draft' | 'In Progress' | 'Pending Review' | 'Approved';

export interface MaturityRubric {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
}

export type FindingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Closed';

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
  /** Target date for closing out this finding. */
  findingTargetDate?: string;
  /** Assessee's latest remediation-progress note on an accepted finding. */
  findingActionTaken?: string;
  /** Real name of the employee this finding was assigned to as Assessee. */
  findingAssesseeName?: string;
  /** Assessor's latest dispute reason when they disputed the assessee's rejection, reopening the finding. */
  findingDisputeComment?: string;
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
  /** True once every finding raised on this domain's assessment(s) is Closed - drives showing "Completed" instead of "Approved". */
  allFindingsResolved?: boolean;
}

export interface TopRisk {
  domain: string;
  category: string;
  parameter: string;
  currentScore: number;
  gap: number;
  /** Populated when the Dashboard aggregates across every account ("All accounts"), so the same domain name on two different accounts can be told apart. */
  accountId?: string;
  accountName?: string;
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
  projectName: string;
  businessUnit: string;
  /** Cycle label - lets rows from different cycles be told apart when "All cycles" is selected. */
  period: string;
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

/** One row per (assessment, parameter) - the Reports page's parameter-level detail report. */
export interface ParameterDetailReportRow {
  accountName: string;
  projectName: string;
  businessUnit: string;
  /** Cycle label - lets rows from different cycles be told apart when "All cycles" is selected. */
  period: string;
  domainName: string;
  category: string;
  parameter: string;
  question: string;
  score: number | null;
  /** Comma-joined - an assessment can have more than one assessor/reviewer. */
  assessor: string;
  reviewer: string;
  /** Only set once this parameter raised a finding (score < 5). */
  assessee: string | null;
  findingStatus: string | null;
}

export function maturityLevelFromScore(avgScore: number): string {
  const rounded = Math.round(avgScore);
  return MATURITY_LEVEL_LABELS[Math.min(5, Math.max(1, rounded))];
}

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

export interface MaturityParameter {
  id: string;
  category: string;
  name: string;
  definition: string;
  rubric: MaturityRubric;
  minRequiredScore?: number;
  score: MaturityScore | null;
  notes: string;
  evidenceFileName?: string;
  provider?: string;
  findingStatus?: FindingStatus;
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
}

export interface DomainSummary {
  id: string;
  name: string;
  coeSpoc: string;
  coeSpocEmail?: string;
  reviewer: string;
  reviewerEmail?: string;
  status: DomainStatus;
  averageScore: number | null;
  maturityPercent: number | null;
  maturityLevel: string | null;
  paramCount: number;
  sumScores: number;
  maxPossible: number;
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

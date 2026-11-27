import { aimiApiClient } from '@shared/services/aimiApiClient';
import type { ProjectMapping } from '@shared/projects/types/projectMappingTypes';
import type { EnrichedActivityWithProjectInfo } from '../utils/activityEnrichmentUtils';

// Backs both report entry points usp_AIMI_GetReportData.sql serves - this
// service is used by the Reports page's cross-project "Generate Reports".
// Replaces the old flow of fetching filtered activities + every ProjectInfo +
// every PracticeInfo separately and joining them client-side
// (activityEnrichmentUtils.ts) with the one query the SP already does
// server-side (activities LEFT JOIN AIMI_PROJECT_INFO).

const ENDPOINT = '/api/AllSys/GetAimiReportData';

export interface ReportDataFilters {
  projectId?: string;
  practice?: string;
  businessUnits?: string[];
  accounts?: string[];
  projects?: string[];
  practices?: string[];
}

interface ApiAiTool {
  TOOL_NAME: string;
}

interface ApiReportRow {
  BUSINESS_UNIT: string | null;
  ACCOUNT: string | null;
  PROJECT: string | null;
  PROJECT_ID: string;
  PRACTICE: string;
  PEOPLE_USING_AI: number | null;
  LICENSE_COUNT: number | null;
  LICENSE_PROVIDER: string | null;
  RUNOPS_AUTO_RESOLVED: string | null;
  RUNOPS_MTTR_REDUCTION: string | null;
  RUNOPS_AI_AGENTS: string | null;
  RUNOPS_AUTOMATED_WORKFLOWS: string | null;
  RUNOPS_MTTD: string | null;
  RUNOPS_MTTR: string | null;
  ENGINEER_AI_AGENTS: string | null;
  ENGINEER_DELIVERY_CYCLE_TIME: string | null;
  ENGINEER_CONTRACT_TEST_CASE_PASS_RATE: string | null;
  ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE: string | null;
  COMMON_ADOPTION_WORKFORCE_CERTIFICATION: string | null;
  COMMON_ADOPTION_EFFORTS_SAVED: string | null;
  COMMON_DEPLOYMENT_ENGINEER: string | null;
  ACCEPTED_SCORE: number | null;
  ACCEPTED_SCORE_COMMENT: string | null;
  ACTIVITY_ID: number;
  SDLC_PHASE: string;
  ACTIVITY: string;
  APPLICABILITY: string | null;
  AI_ADOPTION_SCORE: number | null;
  AI_TOOLS: ApiAiTool[];
  ACCELERATORS: string[];
  WORK_DONE_BY_AI: number | null;
  HOURS_SAVED: number | null;
  REVENUE_GENERATED: string | null;
  BENEFIT_TO: string | null;
  QUALITATIVE_BENEFITS: string[];
  COMMENTS: string | null;
  CREATED_DATE: string | null;
  UPDATED_DATE: string | null;
}

/** ApiReportRow (SQL, joined with AIMI_PROJECT_INFO) + client-side project
 * hierarchy (businessHead/accountManager/manager/headcount, not part of the
 * AIMI domain) -> the shape csvExportUtils.ts already renders. */
const fromApiReportRow = (
  row: ApiReportRow,
  projectMapping: Map<string, ProjectMapping>
): EnrichedActivityWithProjectInfo => {
  const mapping = projectMapping.get(row.PROJECT_ID);

  return {
    id: String(row.ACTIVITY_ID),
    sdlcPhase: row.SDLC_PHASE,
    activity: row.ACTIVITY,
    applicability: row.APPLICABILITY || '',
    aiAdoptionScore:
      row.AI_ADOPTION_SCORE === null || row.AI_ADOPTION_SCORE === undefined
        ? ''
        : String(row.AI_ADOPTION_SCORE),
    aiToolUsed: row.AI_TOOLS.map((t) => t.TOOL_NAME),
    acceleratorsUsed: row.ACCELERATORS,
    workDoneByAI: row.WORK_DONE_BY_AI ?? 0,
    hoursSaved: row.HOURS_SAVED ?? 0,
    revenueGenerated: row.REVENUE_GENERATED || '',
    benefitTo: row.BENEFIT_TO || '',
    qualitativeBenefits: row.QUALITATIVE_BENEFITS ?? [],
    comments: row.COMMENTS || '',
    status: 'submitted',
    projectId: row.PROJECT_ID,
    practice: row.PRACTICE,
    project: row.PROJECT || '',
    account: row.ACCOUNT || '',
    businessUnit: row.BUSINESS_UNIT || '',
    createdAt: row.CREATED_DATE ? new Date(row.CREATED_DATE) : new Date(),
    updatedAt: row.UPDATED_DATE ? new Date(row.UPDATED_DATE) : undefined,

    businessHead: mapping?.businessHead ?? '',
    accountManager: mapping?.accountManager ?? '',
    manager: mapping?.manager ?? '',
    headcount: mapping?.headcount,

    peopleUsingAI: row.PEOPLE_USING_AI ?? undefined,
    licenseCount: row.LICENSE_COUNT ?? undefined,
    licenseProvider: row.LICENSE_PROVIDER || '',
    runOpsAutoResolved: row.RUNOPS_AUTO_RESOLVED || '',
    runOpsMTTRReduction: row.RUNOPS_MTTR_REDUCTION || '',
    runOpsAIAgents: row.RUNOPS_AI_AGENTS || '',
    runOpsAutomatedWorkflows: row.RUNOPS_AUTOMATED_WORKFLOWS || '',
    runOpsMTTD: row.RUNOPS_MTTD || '',
    runOpsMTTR: row.RUNOPS_MTTR || '',
    engineerAIAgents: row.ENGINEER_AI_AGENTS || '',
    engineerDeliveryCycleTime: row.ENGINEER_DELIVERY_CYCLE_TIME || '',
    engineerContractTestCasePassRate:
      row.ENGINEER_CONTRACT_TEST_CASE_PASS_RATE || '',
    engineerPerformanceDefectsPreRelease:
      row.ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE || '',
    commonAdoptionWorkforceCertification:
      row.COMMON_ADOPTION_WORKFORCE_CERTIFICATION || '',
    commonAdoptionEffortsSaved: row.COMMON_ADOPTION_EFFORTS_SAVED || '',
    commonDeploymentEngineer: row.COMMON_DEPLOYMENT_ENGINEER || '',
    acceptedScore: row.ACCEPTED_SCORE ?? undefined,
    acceptedScoreComment: row.ACCEPTED_SCORE_COMMENT || '',
  };
};

export const reportService = {
  /** Fetch report rows (activity + joined AI Adoption Metrics) via the SP
   * both report entry points share, enriched with business-head/account-
   * manager/manager/headcount from the already-loaded project hierarchy. */
  getReportData: async (
    filters: ReportDataFilters,
    projectMapping: Map<string, ProjectMapping>
  ): Promise<EnrichedActivityWithProjectInfo[]> => {
    try {
      const rows = await aimiApiClient.post<ApiReportRow[]>(ENDPOINT, {
        projectId: filters.projectId ?? null,
        practice: filters.practice ?? null,
        businessUnits: filters.businessUnits ?? [],
        accounts: filters.accounts ?? [],
        projects: filters.projects ?? [],
        practices: filters.practices ?? [],
      });
      return rows.map((row) => fromApiReportRow(row, projectMapping));
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  },
};

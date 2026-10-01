import { aimiApiClient } from '@shared/services/aimiApiClient';

// Was Firestore-backed (collection 'projectInfo'); now calls the SQL-backed
// AimiController endpoints (usp_AIMI_GetProjectInfo / UpsertAimiProjectInfo).

const ENDPOINTS = {
  GET_PROJECT_INFO: '/api/AllSys/GetAimiProjectInfo',
  UPSERT_PROJECT_INFO: '/api/AllSys/UpsertAimiProjectInfo',
};

// Interface for project info
export interface ProjectInfo {
  projectId: string;
  peopleUsingAI: number;

  isProjectNA?: boolean;
  naComments?: string;

  licenseCount?: number;
  licenseProvider?: string;

  runOpsAutoResolved?: string;
  runOpsMTTRReduction?: string;
  runOpsAIAgents?: string;
  runOpsAutomatedWorkflows?: string;
  runOpsMTTD?: string;
  runOpsMTTR?: string;

  engineerAIAgents?: string;
  engineerDeliveryCycleTime?: string;
  engineerContractTestCasePassRate?: string;
  engineerPerformanceDefectsPreRelease?: string;

  commonAdoptionWorkforceCertification?: string;
  commonAdoptionEffortsSaved?: string;
  commonDeploymentEngineer?: string;

  presentationDone?: boolean;
  projectFY?: string;
  acceptedScore?: number;
  scoreReviewed?: boolean;
  acceptedScoreComment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Row shape returned by GetAimiProjectInfo - mirrors AimiProjectInfoSpRow in
// the C# API, UPPER_SNAKE field names matching the SQL columns.
interface ApiProjectInfoRow {
  ID: number;
  PROJECT_ID: string;
  PEOPLE_USING_AI: number | null;
  IS_PROJECT_NA: boolean;
  NA_COMMENTS: string | null;
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
  PRESENTATION_DONE: boolean;
  PROJECT_FY: string | null;
  ACCEPTED_SCORE: number | null;
  SCORE_REVIEWED: boolean;
  ACCEPTED_SCORE_COMMENT: string | null;
  CREATED_DATE: string | null;
  UPDATED_DATE: string | null;
}

const fromApiProjectInfo = (row: ApiProjectInfoRow): ProjectInfo => ({
  projectId: row.PROJECT_ID,
  peopleUsingAI: row.PEOPLE_USING_AI ?? 0,
  isProjectNA: row.IS_PROJECT_NA ?? false,
  naComments: row.NA_COMMENTS ?? '',
  licenseCount: row.LICENSE_COUNT ?? undefined,
  licenseProvider: row.LICENSE_PROVIDER ?? undefined,
  runOpsAutoResolved: row.RUNOPS_AUTO_RESOLVED ?? undefined,
  runOpsMTTRReduction: row.RUNOPS_MTTR_REDUCTION ?? undefined,
  runOpsAIAgents: row.RUNOPS_AI_AGENTS ?? undefined,
  runOpsAutomatedWorkflows: row.RUNOPS_AUTOMATED_WORKFLOWS ?? undefined,
  runOpsMTTD: row.RUNOPS_MTTD ?? undefined,
  runOpsMTTR: row.RUNOPS_MTTR ?? undefined,
  engineerAIAgents: row.ENGINEER_AI_AGENTS ?? undefined,
  engineerDeliveryCycleTime: row.ENGINEER_DELIVERY_CYCLE_TIME ?? undefined,
  engineerContractTestCasePassRate:
    row.ENGINEER_CONTRACT_TEST_CASE_PASS_RATE ?? undefined,
  engineerPerformanceDefectsPreRelease:
    row.ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE ?? undefined,
  commonAdoptionWorkforceCertification:
    row.COMMON_ADOPTION_WORKFORCE_CERTIFICATION ?? undefined,
  commonAdoptionEffortsSaved: row.COMMON_ADOPTION_EFFORTS_SAVED ?? undefined,
  commonDeploymentEngineer: row.COMMON_DEPLOYMENT_ENGINEER ?? undefined,
  presentationDone: row.PRESENTATION_DONE ?? false,
  projectFY: row.PROJECT_FY ?? '',
  acceptedScore: row.ACCEPTED_SCORE ?? undefined,
  scoreReviewed: row.SCORE_REVIEWED ?? false,
  acceptedScoreComment: row.ACCEPTED_SCORE_COMMENT ?? '',
  createdAt: row.CREATED_DATE ? new Date(row.CREATED_DATE) : new Date(),
  updatedAt: row.UPDATED_DATE ? new Date(row.UPDATED_DATE) : new Date(),
});

const toUpsertPayload = (projectInfo: Omit<ProjectInfo, 'createdAt' | 'updatedAt'>) => ({
  PROJECT_ID: projectInfo.projectId,
  PEOPLE_USING_AI: projectInfo.peopleUsingAI,
  IS_PROJECT_NA: projectInfo.isProjectNA ?? false,
  NA_COMMENTS: projectInfo.naComments,
  LICENSE_COUNT: projectInfo.licenseCount,
  LICENSE_PROVIDER: projectInfo.licenseProvider,
  RUNOPS_AUTO_RESOLVED: projectInfo.runOpsAutoResolved,
  RUNOPS_MTTR_REDUCTION: projectInfo.runOpsMTTRReduction,
  RUNOPS_AI_AGENTS: projectInfo.runOpsAIAgents,
  RUNOPS_AUTOMATED_WORKFLOWS: projectInfo.runOpsAutomatedWorkflows,
  RUNOPS_MTTD: projectInfo.runOpsMTTD,
  RUNOPS_MTTR: projectInfo.runOpsMTTR,
  ENGINEER_AI_AGENTS: projectInfo.engineerAIAgents,
  ENGINEER_DELIVERY_CYCLE_TIME: projectInfo.engineerDeliveryCycleTime,
  ENGINEER_CONTRACT_TEST_CASE_PASS_RATE:
    projectInfo.engineerContractTestCasePassRate,
  ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE:
    projectInfo.engineerPerformanceDefectsPreRelease,
  COMMON_ADOPTION_WORKFORCE_CERTIFICATION:
    projectInfo.commonAdoptionWorkforceCertification,
  COMMON_ADOPTION_EFFORTS_SAVED: projectInfo.commonAdoptionEffortsSaved,
  COMMON_DEPLOYMENT_ENGINEER: projectInfo.commonDeploymentEngineer,
  PRESENTATION_DONE: projectInfo.presentationDone ?? false,
  PROJECT_FY: projectInfo.projectFY,
  ACCEPTED_SCORE: projectInfo.acceptedScore,
  SCORE_REVIEWED: projectInfo.scoreReviewed ?? false,
  ACCEPTED_SCORE_COMMENT: projectInfo.acceptedScoreComment,
});

/**
 * Save or update project info (upsert operation)
 */
const saveOrUpdateProjectInfo = async (
  projectInfo: Omit<ProjectInfo, 'createdAt' | 'updatedAt'>
): Promise<ProjectInfo> => {
  try {
    await aimiApiClient.post(
      ENDPOINTS.UPSERT_PROJECT_INFO,
      toUpsertPayload(projectInfo)
    );

    return {
      ...projectInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error saving or updating project info:', error);
    throw error;
  }
};

/**
 * Get project info by project ID
 */
const getProjectInfo = async (projectId: string): Promise<ProjectInfo> => {
  try {
    const rows = await aimiApiClient.get<ApiProjectInfoRow[]>(
      ENDPOINTS.GET_PROJECT_INFO,
      { projectId }
    );

    if (rows.length === 0) {
      // Return default object when no row exists yet
      return {
        projectId,
        peopleUsingAI: 0,
        isProjectNA: false,
        naComments: '',
        licenseCount: 0,
        licenseProvider: '',
        presentationDone: false,
        projectFY: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return fromApiProjectInfo(rows[0]);
  } catch (error) {
    console.error('Error fetching project info:', error);
    throw error;
  }
};

/**
 * Get all project info
 */
const getAllProjectInfo = async (): Promise<ProjectInfo[]> => {
  try {
    const rows = await aimiApiClient.get<ApiProjectInfoRow[]>(
      ENDPOINTS.GET_PROJECT_INFO
    );
    return rows.map(fromApiProjectInfo);
  } catch (error) {
    console.error('Error fetching all project info:', error);
    throw error;
  }
};

export const projectInfoService = {
  saveOrUpdateProjectInfo,
  getProjectInfo,
  getAllProjectInfo,
};

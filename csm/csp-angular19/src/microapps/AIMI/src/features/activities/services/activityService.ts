import { aimiApiClient, getCurrentEmpId } from '@shared/services/aimiApiClient';
import type {
  ActivityWithProjectInfo,
  ActivityStatus,
} from '../types/activityTypes';

// Was Firestore-backed (collection 'activities'); now calls the SQL-backed
// AimiController endpoints (usp_AIMI_GetActivities / GetActivitiesByFilter /
// UpsertActivity / DeleteActivity). Every exported function here keeps its
// original signature so callers (activityStorageUtils, hooks, components)
// need no changes - only the implementation swapped data sources.
//
// GetAimiActivitiesByFilter takes all four dimensions (business units,
// accounts, projects, practices) as SQL table-valued parameters in one call,
// which is why the old 30-value Firestore 'in' clause batching workaround
// (FIRESTORE_IN_CLAUSE_LIMIT/chunkArray/getActivitiesByFieldValues) is gone -
// TVPs have no such cap, and practice narrowing is now done by SQL itself
// instead of a client-side post-filter.

const ENDPOINTS = {
  GET_ACTIVITIES: '/api/AllSys/GetAimiActivities',
  GET_ACTIVITIES_BY_FILTER: '/api/AllSys/GetAimiActivitiesByFilter',
  UPSERT_ACTIVITY: '/api/AllSys/UpsertAimiActivity',
  DELETE_ACTIVITY: '/api/AllSys/DeleteAimiActivity',
  UPDATE_ACCEPTED_SCORE: '/api/AllSys/UpdateAimiAcceptedScore',
};

// Admin review of a project's Overall Score. Stored on the activity rows (all
// activities of a project + practice carry the same values), not on project info.
export interface AcceptedScoreInfo {
  acceptedScore?: number;
  scoreReviewed: boolean;
  acceptedScoreComment: string;
}

// Row shape returned by GetAimiActivities/GetAimiActivitiesByFilter - mirrors
// AimiActivityResponse in the C# API (GAVS.AllocationSystem.Model.CSP.ViewModels),
// UPPER_SNAKE field names matching the SQL columns.
interface ApiAiTool {
  TOOL_NAME: string;
  ACCESS_TYPE: string | null;
  LICENSE_COUNT: number | null;
  NETWORK_TYPE: string | null;
}

interface ApiActivityRow {
  ID: number;
  PROJECT_ID: string;
  PROJECT: string | null;
  ACCOUNT: string | null;
  BUSINESS_UNIT: string | null;
  PRACTICE: string;
  SDLC_PHASE: string;
  ACTIVITY: string;
  APPLICABILITY: string | null;
  AI_ADOPTION_SCORE: number | null;
  WORK_DONE_BY_AI: number | null;
  HOURS_SAVED: number | null;
  REVENUE_GENERATED: string | null;
  BENEFIT_TO: string | null;
  COMMENTS: string | null;
  STATUS: string | null;
  CREATED_BY: string | null;
  CREATED_DATE: string | null;
  UPDATED_BY: string | null;
  UPDATED_DATE: string | null;
  ACCEPTED_SCORE: number | null;
  SCORE_REVIEWED: boolean;
  ACCEPTED_SCORE_COMMENT: string | null;
  AI_TOOLS: ApiAiTool[];
  ACCELERATORS: string[];
  QUALITATIVE_BENEFITS: string[];
}

const toStringArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

/** ApiActivityRow (SQL) -> ActivityWithProjectInfo (existing client shape). */
const fromApiActivity = (row: ApiActivityRow): ActivityWithProjectInfo => ({
  id: String(row.ID),
  sdlcPhase: row.SDLC_PHASE,
  activity: row.ACTIVITY,
  applicability: row.APPLICABILITY || '',
  aiAdoptionScore:
    row.AI_ADOPTION_SCORE === null || row.AI_ADOPTION_SCORE === undefined
      ? ''
      : String(row.AI_ADOPTION_SCORE),
  aiToolUsed: row.AI_TOOLS.map((t) => t.TOOL_NAME),
  aiToolDetails: Object.fromEntries(
    row.AI_TOOLS.map((t) => [
      t.TOOL_NAME,
      {
        accessType: t.ACCESS_TYPE ?? '',
        licenseCount: t.LICENSE_COUNT ?? 0,
        networkType: t.NETWORK_TYPE ?? '',
      },
    ])
  ),
  acceleratorsUsed: row.ACCELERATORS,
  workDoneByAI: row.WORK_DONE_BY_AI ?? 0,
  hoursSaved: row.HOURS_SAVED ?? 0,
  revenueGenerated: row.REVENUE_GENERATED || '',
  benefitTo: row.BENEFIT_TO || '',
  qualitativeBenefits: row.QUALITATIVE_BENEFITS ?? [],
  comments: row.COMMENTS || '',
  status: (row.STATUS as ActivityStatus) || 'submitted',
  projectId: row.PROJECT_ID,
  practice: row.PRACTICE,
  project: row.PROJECT || '',
  account: row.ACCOUNT || '',
  businessUnit: row.BUSINESS_UNIT || '',
  createdAt: row.CREATED_DATE ? new Date(row.CREATED_DATE) : new Date(),
  updatedAt: row.UPDATED_DATE ? new Date(row.UPDATED_DATE) : undefined,
});

/** ActivityWithProjectInfo (existing client shape) -> UpsertAimiActivity request body. */
const toUpsertPayload = (
  id: string | undefined,
  activity: Omit<ActivityWithProjectInfo, 'id'>
) => ({
  ID: id ? Number(id) : null,
  PROJECT_ID: activity.projectId,
  PROJECT: activity.project,
  ACCOUNT: activity.account,
  BUSINESS_UNIT: activity.businessUnit,
  PRACTICE: activity.practice,
  SDLC_PHASE: activity.sdlcPhase,
  ACTIVITY: activity.activity,
  APPLICABILITY: activity.applicability,
  AI_ADOPTION_SCORE:
    activity.aiAdoptionScore && activity.aiAdoptionScore !== 'N/A'
      ? Number(activity.aiAdoptionScore)
      : null,
  WORK_DONE_BY_AI: activity.workDoneByAI ?? null,
  HOURS_SAVED: activity.hoursSaved ?? null,
  REVENUE_GENERATED: activity.revenueGenerated,
  BENEFIT_TO: activity.benefitTo,
  COMMENTS: activity.comments,
  STATUS: activity.status || 'draft',
  AI_TOOLS: toStringArray(activity.aiToolUsed).map((name) => {
    const details = activity.aiToolDetails?.[name];
    return {
      TOOL_NAME: name,
      ACCESS_TYPE: details?.accessType || null,
      LICENSE_COUNT:
        details?.accessType === 'Licensed' ? details.licenseCount : null,
      NETWORK_TYPE: details?.networkType || null,
    };
  }),
  ACCELERATORS: toStringArray(activity.acceleratorsUsed),
  QUALITATIVE_BENEFITS: activity.qualitativeBenefits ?? [],
});

const upsert = async (
  id: string | undefined,
  activity: Omit<ActivityWithProjectInfo, 'id'>
): Promise<ActivityWithProjectInfo> => {
  const result = await aimiApiClient.post<{ ID: number }>(
    ENDPOINTS.UPSERT_ACTIVITY,
    toUpsertPayload(id, activity)
  );
  return {
    ...activity,
    id: String(result.ID),
  };
};

export const activityService = {
  /** Insert a new activity. */
  saveActivity: async (
    activity: Omit<ActivityWithProjectInfo, 'id'>
  ): Promise<ActivityWithProjectInfo> => {
    try {
      return await upsert(undefined, activity);
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  },

  /** Insert multiple activities one by one (matches existing sequential behaviour). */
  saveActivities: async (
    activities: Omit<ActivityWithProjectInfo, 'id'>[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      const savedActivities: ActivityWithProjectInfo[] = [];
      for (const activity of activities) {
        savedActivities.push(await activityService.saveActivity(activity));
      }
      return savedActivities;
    } catch (error) {
      console.error('Error saving activities:', error);
      throw error;
    }
  },

  /**
   * Update an existing activity. UpsertAimiActivity replaces the row (and its
   * AI tool/accelerator/qualitative benefit selections) wholesale, so - same
   * as every call site of this function today - `updates` must carry the
   * activity's full field set, not a partial patch.
   */
  updateActivity: async (
    activityId: string,
    updates: Partial<Omit<ActivityWithProjectInfo, 'id' | 'createdAt'>>
  ): Promise<ActivityWithProjectInfo> => {
    try {
      return await upsert(
        activityId,
        updates as Omit<ActivityWithProjectInfo, 'id'>
      );
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  /** Soft-delete a single activity. */
  deleteActivity: async (activityId: string): Promise<void> => {
    try {
      await aimiApiClient.post(ENDPOINTS.DELETE_ACTIVITY, {
        ID: Number(activityId),
        IDS: [],
        EMP_ID: getCurrentEmpId(),
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  /** Soft-delete several activities in one call (ISACTIVE = 0). */
  deleteActivities: async (activityIds: string[]): Promise<void> => {
    if (activityIds.length === 0) return;
    try {
      await aimiApiClient.post(ENDPOINTS.DELETE_ACTIVITY, {
        ID: null,
        IDS: activityIds.map(Number),
      });
    } catch (error) {
      console.error('Error deleting activities:', error);
      throw error;
    }
  },

  /** Fetch activities for one project + practice. */
  getActivitiesByProjectIdAndPractice: async (
    projectId: string,
    practice: string
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      const rows = await aimiApiClient.get<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES,
        { projectId, practice }
      );
      return rows.map(fromApiActivity);
    } catch (error) {
      console.error(
        'Error fetching activities by project ID and practice:',
        error
      );
      throw error;
    }
  },

  /**
   * Read the Accepted Score review for one project + practice. Every activity row
   * carries the same values, so the first row that has any review data is used.
   */
  getAcceptedScore: async (
    projectId: string,
    practice: string
  ): Promise<AcceptedScoreInfo> => {
    try {
      const rows = await aimiApiClient.get<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES,
        { projectId, practice }
      );
      const reviewed = rows.find(
        (row) =>
          row.ACCEPTED_SCORE !== null ||
          row.SCORE_REVIEWED ||
          !!row.ACCEPTED_SCORE_COMMENT
      );
      return {
        acceptedScore: reviewed?.ACCEPTED_SCORE ?? undefined,
        scoreReviewed: reviewed?.SCORE_REVIEWED ?? false,
        acceptedScoreComment: reviewed?.ACCEPTED_SCORE_COMMENT ?? '',
      };
    } catch (error) {
      console.error('Error fetching accepted score:', error);
      throw error;
    }
  },

  /** Save the Accepted Score review onto the project + practice's activities. */
  updateAcceptedScore: async (
    projectId: string,
    practice: string,
    review: AcceptedScoreInfo
  ): Promise<void> => {
    try {
      const result = await aimiApiClient.post<{ ID: number }>(
        ENDPOINTS.UPDATE_ACCEPTED_SCORE,
        {
          PROJECT_ID: projectId,
          PRACTICE: practice,
          ACCEPTED_SCORE: review.acceptedScore ?? null,
          SCORE_REVIEWED: review.scoreReviewed,
          ACCEPTED_SCORE_COMMENT: review.acceptedScoreComment,
        }
      );
      if (!result?.ID) {
        throw new Error('No saved activities found to attach the review to');
      }
    } catch (error) {
      console.error('Error updating accepted score:', error);
      throw error;
    }
  },

  /** Fetch all activities for one project. */
  getActivitiesByProjectId: async (
    projectId: string
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      const rows = await aimiApiClient.get<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES,
        { projectId }
      );
      return rows.map(fromApiActivity);
    } catch (error) {
      console.error('Error fetching activities by project ID:', error);
      throw error;
    }
  },

  /** Fetch a single activity by ID. */
  getActivityById: async (
    activityId: string
  ): Promise<ActivityWithProjectInfo> => {
    try {
      const rows = await aimiApiClient.get<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES,
        { id: activityId }
      );
      if (rows.length === 0) {
        throw new Error(`Activity with ID ${activityId} not found`);
      }
      return fromApiActivity(rows[0]);
    } catch (error) {
      console.error('Error fetching activity by ID:', error);
      throw error;
    }
  },

  /** Fetch every activity across every project. */
  getAllActivities: async (): Promise<ActivityWithProjectInfo[]> => {
    try {
      const rows = await aimiApiClient.get<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES
      );
      return rows.map(fromApiActivity);
    } catch (error) {
      console.error('Error fetching all activities:', error);
      throw error;
    }
  },

  /**
   * Upsert activities for a specific project and practice.
   * Updates existing activities and creates new ones efficiently.
   */
  upsertActivitiesForProject: async (
    activities: ActivityWithProjectInfo[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (activities.length === 0) return [];

      const projectId = activities[0].projectId;
      const practice = activities[0].practice;

      const existingActivities =
        await activityService.getActivitiesByProjectIdAndPractice(
          projectId,
          practice
        );
      const existingActivityMap = new Map(
        existingActivities.map((activity) => [activity.id, activity])
      );

      const upsertedActivities: ActivityWithProjectInfo[] = [];

      for (const activity of activities) {
        if (activity.id && existingActivityMap.has(activity.id)) {
          const { id, ...updateData } = activity;
          const updatedActivity = await activityService.updateActivity(
            id,
            updateData
          );
          upsertedActivities.push(updatedActivity);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...activityWithoutId } = activity;
          const savedActivity =
            await activityService.saveActivity(activityWithoutId);
          upsertedActivities.push(savedActivity);
        }
      }

      return upsertedActivities;
    } catch (error) {
      console.error('Error upserting activities for project:', error);
      throw error;
    }
  },

  /**
   * Clear all activities (use with caution!). No bulk "clear everything"
   * proc exists server-side, so this deletes every currently-known activity
   * one by one - matches the old Firestore behaviour's effect, just phrased
   * as N calls instead of N Firestore deletes.
   */
  clearAllActivities: async (): Promise<void> => {
    try {
      const all = await activityService.getAllActivities();
      await Promise.all(all.map((a) => activityService.deleteActivity(a.id)));
    } catch (error) {
      console.error('Error clearing all activities:', error);
      throw error;
    }
  },

  /** Fetch activities across multiple business units (and optionally practices). */
  getActivitiesByBusinessUnits: async (
    businessUnits: string[],
    practices?: string[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (businessUnits.length === 0) return [];
      const rows = await aimiApiClient.post<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES_BY_FILTER,
        { businessUnits, practices: practices ?? [] }
      );
      return rows.map(fromApiActivity);
    } catch (error) {
      console.error('Error fetching activities by business units:', error);
      throw error;
    }
  },

  /** Fetch activities across multiple accounts (and optionally practices). */
  getActivitiesByAccounts: async (
    accounts: string[],
    practices?: string[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (accounts.length === 0) return [];
      const rows = await aimiApiClient.post<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES_BY_FILTER,
        { accounts, practices: practices ?? [] }
      );
      return rows.map(fromApiActivity);
    } catch (error) {
      console.error('Error fetching activities by accounts:', error);
      throw error;
    }
  },

  /** Fetch activities across multiple projects (and optionally practices). */
  getActivitiesByProjects: async (
    projects: string[],
    practices?: string[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (projects.length === 0) return [];
      const rows = await aimiApiClient.post<ApiActivityRow[]>(
        ENDPOINTS.GET_ACTIVITIES_BY_FILTER,
        { projects, practices: practices ?? [] }
      );
      return rows.map(fromApiActivity);
    } catch (error) {
      console.error('Error fetching activities by projects:', error);
      throw error;
    }
  },
};

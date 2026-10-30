import { aimiApiClient } from '@shared/services/aimiApiClient';

// Was Firestore-backed (collection 'practiceInfo'); now calls the SQL-backed
// AimiController endpoints (usp_AIMI_GetPracticeInfo / UpsertAimiPracticeInfo).

const ENDPOINTS = {
  GET_PRACTICE_INFO: '/api/AllSys/GetAimiPracticeInfo',
  UPSERT_PRACTICE_INFO: '/api/AllSys/UpsertAimiPracticeInfo',
};

// Interface for practice info
export interface PracticeInfo {
  projectId: string;
  practice: string;
  currentPhase: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Row shape returned by GetAimiPracticeInfo - mirrors AimiPracticeInfoSpRow in
// the C# API, UPPER_SNAKE field names matching the SQL columns.
interface ApiPracticeInfoRow {
  ID: number;
  PROJECT_ID: string;
  PRACTICE: string;
  CURRENT_PHASE: string | null;
  CREATED_DATE: string | null;
  UPDATED_DATE: string | null;
}

const fromApiPracticeInfo = (row: ApiPracticeInfoRow): PracticeInfo => ({
  projectId: row.PROJECT_ID,
  practice: row.PRACTICE,
  currentPhase: row.CURRENT_PHASE || '',
  createdAt: row.CREATED_DATE ? new Date(row.CREATED_DATE) : new Date(),
  updatedAt: row.UPDATED_DATE ? new Date(row.UPDATED_DATE) : new Date(),
});

/**
 * Save or update practice info (upsert operation)
 */
const saveOrUpdatePracticeInfo = async (
  practiceInfo: Omit<PracticeInfo, 'createdAt' | 'updatedAt'>
): Promise<PracticeInfo> => {
  try {
    await aimiApiClient.post(ENDPOINTS.UPSERT_PRACTICE_INFO, {
      PROJECT_ID: practiceInfo.projectId,
      PRACTICE: practiceInfo.practice,
      CURRENT_PHASE: practiceInfo.currentPhase,
    });

    return {
      ...practiceInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error saving or updating practice info:', error);
    throw error;
  }
};

/**
 * Get practice info by project ID and practice
 */
const getPracticeInfo = async (
  projectId: string,
  practice: string
): Promise<PracticeInfo | null> => {
  try {
    const rows = await aimiApiClient.get<ApiPracticeInfoRow[]>(
      ENDPOINTS.GET_PRACTICE_INFO,
      { projectId, practice }
    );

    if (rows.length === 0) {
      return null;
    }

    return fromApiPracticeInfo(rows[0]);
  } catch (error) {
    console.error('Error fetching practice info:', error);
    throw error;
  }
};

/**
 * Get all practice info
 */
const getAllPracticeInfo = async (): Promise<PracticeInfo[]> => {
  try {
    const rows = await aimiApiClient.get<ApiPracticeInfoRow[]>(
      ENDPOINTS.GET_PRACTICE_INFO
    );
    return rows.map(fromApiPracticeInfo);
  } catch (error) {
    console.error('Error fetching all practice info:', error);
    throw error;
  }
};

export const practiceInfoService = {
  saveOrUpdatePracticeInfo,
  getPracticeInfo,
  getAllPracticeInfo,
};

import { aimiApiClient } from '@shared/services/aimiApiClient';

// Restore of an AIMI backup (see backupUtils.ts) into SQL through the AllSys API - the same
// upsert / delete endpoints the app itself uses, so every stored-proc rule still applies.
//
//  - projectInfo / practiceInfo: upserted per project (per project + practice). Rows already
//    in SQL for those keys are overwritten; projects that are not in the file are left alone.
//  - activities: the backup's activities are inserted as new rows first; only if every insert
//    succeeded are the activities that were active before the restore soft-deleted
//    (ISACTIVE = 0). A failure part-way therefore leaves duplicates, never a gap.
//    Row ids and created dates are not preserved (rows get new ids and today's date).

const ENDPOINTS = {
  GET_ACTIVITIES: '/api/AllSys/GetAimiActivities',
  UPSERT_ACTIVITY: '/api/AllSys/UpsertAimiActivity',
  DELETE_ACTIVITY: '/api/AllSys/DeleteAimiActivity',
  UPDATE_ACCEPTED_SCORE: '/api/AllSys/UpdateAimiAcceptedScore',
  UPSERT_PROJECT_INFO: '/api/AllSys/UpsertAimiProjectInfo',
  UPSERT_PRACTICE_INFO: '/api/AllSys/UpsertAimiPracticeInfo',
};

// Restore order: project / practice info first, then activities
const RESTORE_ORDER = ['projectInfo', 'practiceInfo', 'activities'];

const DELETE_CHUNK_SIZE = 200;

interface RestoreDocument {
  id: string;
  [key: string]: unknown;
}

interface RestoreCollection {
  count: number;
  documents: RestoreDocument[];
  error?: string;
}

interface RestoreData {
  metadata: {
    backupDate: string;
    collections: string[];
    version?: string;
    source?: string;
  };
  collections: Record<string, RestoreCollection>;
}

type Progress = { current: number; total: number };
type CollectionResult = { success: number; errors: string[] };

const errorText = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

/**
 * Parse and validate the uploaded JSON file
 */
export const parseRestoreFile = async (file: File): Promise<RestoreData> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as RestoreData;

    // Basic validation
    if (!data.metadata || !data.collections) {
      throw new Error('Invalid backup file structure');
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to parse backup file: ${errorText(error)}`);
  }
};

/**
 * Only SQL-format backups (version 2.x, made by this screen) can be restored. Old Firebase
 * backups have a different document shape and were loaded with scripts/firestoreToSql.js.
 */
const assertSqlBackup = (data: RestoreData): void => {
  const version = data.metadata.version ?? '';
  if (!version.startsWith('2.')) {
    throw new Error(
      'This backup was created from the old Firebase version and cannot be restored here. ' +
        'Use a backup created from this screen (format version 2.x).'
    );
  }
};

// ---- helpers ---------------------------------------------------------------

const toText = (value: unknown): string | null =>
  value === undefined || value === null ? null : String(value);

const toNumber = (value: unknown): number | null =>
  value === undefined || value === null || value === '' ? null : Number(value);

const toFlag = (value: unknown): boolean => value === true;

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

// ---- per-collection restore ------------------------------------------------

const restoreProjectInfo = async (
  documents: RestoreDocument[],
  onProgress?: (progress: Progress) => void
): Promise<CollectionResult> => {
  const result: CollectionResult = { success: 0, errors: [] };

  for (let i = 0; i < documents.length; i++) {
    const row = documents[i];
    try {
      if (!row.PROJECT_ID) throw new Error('PROJECT_ID is missing');

      await aimiApiClient.post(ENDPOINTS.UPSERT_PROJECT_INFO, {
        PROJECT_ID: toText(row.PROJECT_ID),
        PEOPLE_USING_AI: toNumber(row.PEOPLE_USING_AI),
        IS_PROJECT_NA: toFlag(row.IS_PROJECT_NA),
        NA_COMMENTS: toText(row.NA_COMMENTS),
        LICENSE_COUNT: toNumber(row.LICENSE_COUNT),
        LICENSE_PROVIDER: toText(row.LICENSE_PROVIDER),
        RUNOPS_AUTO_RESOLVED: toText(row.RUNOPS_AUTO_RESOLVED),
        RUNOPS_MTTR_REDUCTION: toText(row.RUNOPS_MTTR_REDUCTION),
        RUNOPS_AI_AGENTS: toText(row.RUNOPS_AI_AGENTS),
        RUNOPS_AUTOMATED_WORKFLOWS: toText(row.RUNOPS_AUTOMATED_WORKFLOWS),
        RUNOPS_MTTD: toText(row.RUNOPS_MTTD),
        RUNOPS_MTTR: toText(row.RUNOPS_MTTR),
        ENGINEER_AI_AGENTS: toText(row.ENGINEER_AI_AGENTS),
        ENGINEER_DELIVERY_CYCLE_TIME: toText(row.ENGINEER_DELIVERY_CYCLE_TIME),
        ENGINEER_CONTRACT_TEST_CASE_PASS_RATE: toText(
          row.ENGINEER_CONTRACT_TEST_CASE_PASS_RATE
        ),
        ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE: toText(
          row.ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE
        ),
        COMMON_ADOPTION_WORKFORCE_CERTIFICATION: toText(
          row.COMMON_ADOPTION_WORKFORCE_CERTIFICATION
        ),
        COMMON_ADOPTION_EFFORTS_SAVED: toText(row.COMMON_ADOPTION_EFFORTS_SAVED),
        COMMON_DEPLOYMENT_ENGINEER: toText(row.COMMON_DEPLOYMENT_ENGINEER),
        PRESENTATION_DONE: toFlag(row.PRESENTATION_DONE),
        PROJECT_FY: toText(row.PROJECT_FY),
      });
      result.success++;
    } catch (error) {
      result.errors.push(
        `Project info ${row.PROJECT_ID ?? row.id}: ${errorText(error)}`
      );
    }
    onProgress?.({ current: i + 1, total: documents.length });
  }

  return result;
};

const restorePracticeInfo = async (
  documents: RestoreDocument[],
  onProgress?: (progress: Progress) => void
): Promise<CollectionResult> => {
  const result: CollectionResult = { success: 0, errors: [] };

  for (let i = 0; i < documents.length; i++) {
    const row = documents[i];
    try {
      if (!row.PROJECT_ID || !row.PRACTICE) {
        throw new Error('PROJECT_ID and PRACTICE are required');
      }
      await aimiApiClient.post(ENDPOINTS.UPSERT_PRACTICE_INFO, {
        PROJECT_ID: toText(row.PROJECT_ID),
        PRACTICE: toText(row.PRACTICE),
        CURRENT_PHASE: toText(row.CURRENT_PHASE),
      });
      result.success++;
    } catch (error) {
      result.errors.push(
        `Practice info ${row.PROJECT_ID ?? row.id} / ${row.PRACTICE ?? ''}: ${errorText(error)}`
      );
    }
    onProgress?.({ current: i + 1, total: documents.length });
  }

  return result;
};

const restoreActivities = async (
  documents: RestoreDocument[],
  onProgress?: (progress: Progress) => void
): Promise<CollectionResult> => {
  const result: CollectionResult = { success: 0, errors: [] };

  // Activities that are active right now - removed only after the restore succeeded
  const existing = await aimiApiClient.get<{ ID: number }[]>(
    ENDPOINTS.GET_ACTIVITIES
  );
  const previousIds = existing.map((row) => row.ID);

  // 1. Insert every activity from the backup as a new row
  for (let i = 0; i < documents.length; i++) {
    const row = documents[i];
    try {
      const missing = ['PROJECT_ID', 'PRACTICE', 'SDLC_PHASE', 'ACTIVITY'].filter(
        (key) => !row[key]
      );
      if (missing.length > 0) throw new Error(`${missing.join(', ')} missing`);

      await aimiApiClient.post(ENDPOINTS.UPSERT_ACTIVITY, {
        ID: null,
        PROJECT_ID: toText(row.PROJECT_ID),
        PROJECT: toText(row.PROJECT),
        ACCOUNT: toText(row.ACCOUNT),
        BUSINESS_UNIT: toText(row.BUSINESS_UNIT),
        PRACTICE: toText(row.PRACTICE),
        SDLC_PHASE: toText(row.SDLC_PHASE),
        ACTIVITY: toText(row.ACTIVITY),
        APPLICABILITY: toText(row.APPLICABILITY),
        AI_ADOPTION_SCORE: toNumber(row.AI_ADOPTION_SCORE),
        WORK_DONE_BY_AI: toNumber(row.WORK_DONE_BY_AI),
        HOURS_SAVED: toNumber(row.HOURS_SAVED),
        REVENUE_GENERATED: toText(row.REVENUE_GENERATED),
        BENEFIT_TO: toText(row.BENEFIT_TO),
        COMMENTS: toText(row.COMMENTS),
        STATUS: toText(row.STATUS),
        AI_TOOLS: Array.isArray(row.AI_TOOLS) ? row.AI_TOOLS : [],
        ACCELERATORS: stringList(row.ACCELERATORS),
        QUALITATIVE_BENEFITS: stringList(row.QUALITATIVE_BENEFITS),
      });
      result.success++;
    } catch (error) {
      result.errors.push(
        `Activity ${row.PROJECT_ID ?? row.id} / ${row.SDLC_PHASE ?? ''} / ${String(row.ACTIVITY ?? '').slice(0, 60)}: ${errorText(error)}`
      );
    }
    onProgress?.({ current: i + 1, total: documents.length });
  }

  // 2. Accepted Score review (stored on the activity rows, one value set per project + practice)
  const reviews = new Map<string, RestoreDocument>();
  documents.forEach((row) => {
    const hasReview =
      row.ACCEPTED_SCORE !== null && row.ACCEPTED_SCORE !== undefined
        ? true
        : toFlag(row.SCORE_REVIEWED) || !!row.ACCEPTED_SCORE_COMMENT;
    if (hasReview && row.PROJECT_ID && row.PRACTICE) {
      reviews.set(`${row.PROJECT_ID}|${row.PRACTICE}`, row);
    }
  });
  for (const row of reviews.values()) {
    try {
      await aimiApiClient.post(ENDPOINTS.UPDATE_ACCEPTED_SCORE, {
        PROJECT_ID: toText(row.PROJECT_ID),
        PRACTICE: toText(row.PRACTICE),
        ACCEPTED_SCORE: toNumber(row.ACCEPTED_SCORE),
        SCORE_REVIEWED: toFlag(row.SCORE_REVIEWED),
        ACCEPTED_SCORE_COMMENT: toText(row.ACCEPTED_SCORE_COMMENT),
      });
    } catch (error) {
      result.errors.push(
        `Accepted score ${row.PROJECT_ID} / ${row.PRACTICE}: ${errorText(error)}`
      );
    }
  }

  // 3. Only now remove the previous activities - and only if nothing failed above, so a
  //    problem never leaves the project with fewer activities than before.
  if (result.errors.length === 0) {
    try {
      for (let i = 0; i < previousIds.length; i += DELETE_CHUNK_SIZE) {
        await aimiApiClient.post(ENDPOINTS.DELETE_ACTIVITY, {
          ID: null,
          IDS: previousIds.slice(i, i + DELETE_CHUNK_SIZE),
        });
      }
    } catch (error) {
      result.errors.push(
        `Could not remove the previous activities (the restored copies are in place, so activities may appear twice): ${errorText(error)}`
      );
    }
  } else {
    result.errors.push(
      'The previous activities were NOT removed because some restores failed. Fix the errors above and run the restore again.'
    );
  }

  return result;
};

/**
 * Main restore function
 */
export const performRestore = async (
  file: File,
  selectedCollections: string[],
  onProgress?: (progress: {
    collection: string;
    current: number;
    total: number;
  }) => void
): Promise<{
  success: boolean;
  message: string;
  results: Record<string, { success: number; errors: string[] }>;
  totalRestored: number;
  totalErrors: number;
}> => {
  try {
    const restoreData = await parseRestoreFile(file);
    assertSqlBackup(restoreData);

    const results: Record<string, CollectionResult> = {};
    let totalRestored = 0;
    let totalErrors = 0;

    const toRestore = RESTORE_ORDER.filter((name) =>
      selectedCollections.includes(name)
    );

    for (const collectionName of toRestore) {
      const collectionData = restoreData.collections[collectionName];

      if (!collectionData?.documents) {
        results[collectionName] = {
          success: 0,
          errors: [`Collection ${collectionName} not found in backup file`],
        };
        totalErrors++;
        continue;
      }

      if (collectionData.error) {
        results[collectionName] = {
          success: 0,
          errors: [
            `Collection ${collectionName} has errors: ${collectionData.error}`,
          ],
        };
        totalErrors++;
        continue;
      }

      const report = (progress: Progress) =>
        onProgress?.({ collection: collectionName, ...progress });

      try {
        const collectionResult =
          collectionName === 'projectInfo'
            ? await restoreProjectInfo(collectionData.documents, report)
            : collectionName === 'practiceInfo'
              ? await restorePracticeInfo(collectionData.documents, report)
              : await restoreActivities(collectionData.documents, report);

        results[collectionName] = collectionResult;
        totalRestored += collectionResult.success;
        totalErrors += collectionResult.errors.length;
      } catch (error) {
        results[collectionName] = {
          success: 0,
          errors: [`Failed to restore ${collectionName}: ${errorText(error)}`],
        };
        totalErrors++;
      }
    }

    const success = totalErrors === 0;
    const message = success
      ? `Restore completed successfully! Restored ${totalRestored} records across ${toRestore.length} collections.`
      : `Restore completed with ${totalErrors} errors. Restored ${totalRestored} records.`;

    return { success, message, results, totalRestored, totalErrors };
  } catch (error) {
    console.error('Restore failed:', error);
    return {
      success: false,
      message: errorText(error),
      results: {},
      totalRestored: 0,
      totalErrors: 1,
    };
  }
};

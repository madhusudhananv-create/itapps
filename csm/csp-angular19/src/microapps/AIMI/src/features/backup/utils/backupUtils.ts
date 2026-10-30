import { aimiApiClient } from '@shared/services/aimiApiClient';

// Backup of the AIMI data, read from SQL through the AllSys API (the usp_AIMI_Get* procs)
// instead of straight from Firestore. The file keeps the same overall shape the Backup /
// Restore screens already understand - metadata + collections.{activities, projectInfo,
// practiceInfo}.documents[] with an `id` on every document - but each document is now the
// SQL row as the API returns it (UPPER_SNAKE column names). Activities carry their AI tools,
// accelerators and qualitative benefits plus the Accepted Score review.

/** Backup file format version. 2.x = SQL rows; the old Firestore backups had no version. */
export const BACKUP_FORMAT_VERSION = '2.0.0';

// Collection name (kept from the Firestore days, so the UI and old file names still line up)
// -> endpoint returning every active row of that table when called without filters.
const COLLECTION_ENDPOINTS = {
  activities: '/api/AllSys/GetAimiActivities',
  projectInfo: '/api/AllSys/GetAimiProjectInfo',
  practiceInfo: '/api/AllSys/GetAimiPracticeInfo',
} as const;

type CollectionName = keyof typeof COLLECTION_ENDPOINTS;

interface SqlRow {
  ID: number;
  [column: string]: unknown;
}

/**
 * Backup a single collection (all active rows of its table)
 */
const backupCollection = async (
  collectionName: CollectionName
): Promise<Record<string, unknown>[]> => {
  try {
    const rows = await aimiApiClient.get<SqlRow[]>(
      COLLECTION_ENDPOINTS[collectionName]
    );
    // `id` is what the Restore screen's validation expects on every document
    return rows.map((row) => ({ id: String(row.ID), ...row }));
  } catch (error) {
    console.error(`Error backing up ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generate backup filename with timestamp
 */
const generateBackupFilename = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `ai-maturity-backup-${timestamp}-${time}.json`;
};

/**
 * Download data as JSON file
 */
const downloadJSON = (
  data: Record<string, unknown>,
  filename: string
): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Main backup function that downloads the backup as JSON
 */
export const performClientBackup = async (): Promise<{
  success: boolean;
  message: string;
  totalDocuments: number;
  collections: Record<string, { count: number; error?: string }>;
}> => {
  try {
    const collectionNames = Object.keys(COLLECTION_ENDPOINTS) as CollectionName[];

    const backupData = {
      metadata: {
        backupDate: new Date().toISOString(),
        collections: collectionNames as string[],
        version: BACKUP_FORMAT_VERSION,
        source: 'AI Maturity Index Platform (SQL)',
      },
      collections: {} as Record<
        string,
        { count: number; documents: Record<string, unknown>[]; error?: string }
      >,
    };

    const collectionStats: Record<string, { count: number; error?: string }> =
      {};

    for (const collectionName of collectionNames) {
      try {
        const documents = await backupCollection(collectionName);
        backupData.collections[collectionName] = {
          count: documents.length,
          documents,
        };
        collectionStats[collectionName] = { count: documents.length };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        backupData.collections[collectionName] = {
          count: 0,
          documents: [],
          error: message,
        };
        collectionStats[collectionName] = { count: 0, error: message };
      }
    }

    const totalDocuments = Object.values(collectionStats).reduce(
      (total, collection) => total + collection.count,
      0
    );

    // A backup with a failed collection would silently lose that data on restore, so
    // don't hand out a file when anything failed.
    const failed = Object.entries(collectionStats).filter(
      ([, stats]) => stats.error
    );
    if (failed.length > 0) {
      return {
        success: false,
        message: `Backup failed for: ${failed.map(([name]) => name).join(', ')}. No file was created.`,
        totalDocuments,
        collections: collectionStats,
      };
    }

    downloadJSON(backupData, generateBackupFilename());

    return {
      success: true,
      message: 'Backup completed successfully and downloaded',
      totalDocuments,
      collections: collectionStats,
    };
  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      totalDocuments: 0,
      collections: {},
    };
  }
};

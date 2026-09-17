import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@shared/config/firebaseConfig';

// Collection names from your codebase
const COLLECTIONS = {
  ACTIVITIES: 'activities',
  PROJECT_INFO: 'projectInfo',
  PRACTICE_INFO: 'practiceInfo',
};

interface FirestoreTimestamp {
  toDate: () => Date;
}

/**
 * Convert Firestore timestamp to ISO string
 */
const convertTimestamp = (timestamp: unknown): string | null => {
  if (!timestamp) return null;

  // Handle Firestore Timestamps
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toDate' in timestamp &&
    typeof (timestamp as FirestoreTimestamp).toDate === 'function'
  ) {
    return (timestamp as FirestoreTimestamp).toDate().toISOString();
  }

  // Handle native Date objects
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  // Handle numbers (milliseconds or seconds since epoch)
  if (typeof timestamp === 'number') {
    // If too small, assume it's in seconds
    return new Date(
      timestamp < 1e12 ? timestamp * 1000 : timestamp
    ).toISOString();
  }

  // Handle strings that could be ISO dates
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
};

/**
 * Convert Firestore document to plain object
 */
const convertDocument = (doc: {
  id: string;
  data: () => Record<string, unknown>;
}) => {
  const data = doc.data();
  const converted: Record<string, unknown> = {
    id: doc.id,
    ...data,
  };

  // Convert timestamps
  if (data.createdAt) {
    converted.createdAt = convertTimestamp(data.createdAt);
  }

  if (data.updatedAt) {
    converted.updatedAt = convertTimestamp(data.updatedAt);
  }

  return converted;
};

/**
 * Backup a single collection
 */
const backupCollection = async (collectionName: string) => {
  try {
    console.log(`📦 Backing up collection: ${collectionName}`);

    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const documents: Record<string, unknown>[] = [];
    querySnapshot.forEach((doc) => {
      documents.push(convertDocument(doc));
    });

    console.log(
      `✅ Successfully backed up ${documents.length} documents from ${collectionName}`
    );
    return documents;
  } catch (error) {
    console.error(`❌ Error backing up collection ${collectionName}:`, error);
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
    console.log('🚀 Starting client-side Firestore backup...');

    // Backup all collections
    const backupData = {
      metadata: {
        backupDate: new Date().toISOString(),
        collections: Object.keys(COLLECTIONS),
        version: '1.0.0',
        source: 'AI Maturity Index Platform',
      },
      collections: {} as Record<
        string,
        { count: number; documents: Record<string, unknown>[]; error?: string }
      >,
    };

    const collectionStats: Record<string, { count: number; error?: string }> =
      {};

    // Backup each collection
    for (const [, collectionName] of Object.entries(COLLECTIONS)) {
      try {
        const documents = await backupCollection(collectionName);
        backupData.collections[collectionName] = {
          count: documents.length,
          documents: documents,
        };
        collectionStats[collectionName] = { count: documents.length };
      } catch (error) {
        console.error(`Failed to backup collection ${collectionName}:`, error);
        backupData.collections[collectionName] = {
          count: 0,
          documents: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        collectionStats[collectionName] = {
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Calculate total documents
    const totalDocuments = Object.values(collectionStats).reduce(
      (total, collection) => total + collection.count,
      0
    );

    // Generate filename and download backup
    const filename = generateBackupFilename();
    downloadJSON(backupData, filename);

    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup downloaded as: ${filename}`);
    console.log(`📊 Total documents backed up: ${totalDocuments}`);
    console.log(
      `📋 Collections backed up: ${Object.keys(COLLECTIONS).join(', ')}`
    );

    // Print collection statistics
    console.log('\n📈 Collection Statistics:');
    for (const [collectionName, stats] of Object.entries(collectionStats)) {
      if (stats.error) {
        console.log(`  ❌ ${collectionName}: ${stats.error}`);
      } else {
        console.log(`  ✅ ${collectionName}: ${stats.count} documents`);
      }
    }

    return {
      success: true,
      message: 'Backup completed successfully and downloaded',
      totalDocuments,
      collections: collectionStats,
    };
  } catch (error) {
    console.error('💥 Backup failed:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      totalDocuments: 0,
      collections: {},
    };
  }
};

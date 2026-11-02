import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@shared/config/firebaseConfig';

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
    throw new Error(
      `Failed to parse backup file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Convert ISO timestamp back to Firestore timestamp format
 */
const convertToFirestoreTimestamp = (isoString: string | null): unknown => {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
};

/**
 * Prepare document for Firestore (remove id and convert timestamps)
 */
const prepareDocumentForFirestore = (
  doc: RestoreDocument
): Record<string, unknown> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = doc;

  // Convert timestamp fields back to Date objects
  const preparedData: Record<string, unknown> = { ...data };

  if (preparedData.createdAt) {
    preparedData.createdAt = convertToFirestoreTimestamp(
      preparedData.createdAt as string
    );
  }

  if (preparedData.updatedAt) {
    preparedData.updatedAt = convertToFirestoreTimestamp(
      preparedData.updatedAt as string
    );
  }

  // Add server timestamp for new documents
  preparedData.createdAt ??= serverTimestamp();
  preparedData.updatedAt = serverTimestamp();

  return preparedData;
};

/**
 * Clear all documents from a collection
 */
const clearCollection = async (
  collectionName: string
): Promise<{ deleted: number; errors: string[] }> => {
  const results = { deleted: 0, errors: [] as string[] };

  try {
    console.log(`🗑️ Clearing collection: ${collectionName}`);

    // Get all documents in the collection
    const querySnapshot = await getDocs(collection(db, collectionName));

    if (querySnapshot.empty) {
      console.log(`📭 Collection ${collectionName} is already empty`);
      return results;
    }

    // Use batch deletes for better performance
    const batch = writeBatch(db);
    const batchSize = 500; // Firestore batch limit
    let batchCount = 0;

    querySnapshot.forEach((docSnapshot) => {
      try {
        batch.delete(docSnapshot.ref);
        batchCount++;

        // Commit batch when it reaches the limit
        if (batchCount >= batchSize) {
          batch.commit();
          results.deleted += batchCount;
          batchCount = 0;
        }
      } catch (error) {
        const errorMsg = `Failed to delete document ${docSnapshot.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    });

    // Commit any remaining documents
    if (batchCount > 0) {
      await batch.commit();
      results.deleted += batchCount;
    }

    console.log(
      `✅ Successfully deleted ${results.deleted} documents from ${collectionName}`
    );
  } catch (error) {
    const errorMsg = `Failed to clear collection ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
  }

  return results;
};

/**
 * Restore a single collection
 */
const restoreCollection = async (
  collectionName: string,
  documents: RestoreDocument[],
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<{ success: number; errors: string[] }> => {
  const results = { success: 0, errors: [] as string[] };

  try {
    console.log(`🔄 Starting restore for collection: ${collectionName}`);

    // Use batch writes for better performance
    const batch = writeBatch(db);
    const batchSize = 500; // Firestore batch limit
    let batchCount = 0;

    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];

      try {
        const preparedData = prepareDocumentForFirestore(document);
        const docRef = doc(collection(db, collectionName), document.id);

        // Use setDoc to preserve the original document ID
        batch.set(docRef, preparedData);
        batchCount++;

        // Commit batch when it reaches the limit or at the end
        if (batchCount >= batchSize || i === documents.length - 1) {
          await batch.commit();
          results.success += batchCount;
          batchCount = 0;

          // Report progress
          if (onProgress) {
            onProgress({ current: i + 1, total: documents.length });
          }
        }
      } catch (error) {
        const errorMsg = `Failed to restore document ${document.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(
      `✅ Successfully restored ${results.success} documents to ${collectionName}`
    );
  } catch (error) {
    const errorMsg = `Failed to restore collection ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
  }

  return results;
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
    console.log('🚀 Starting restore process...');

    // Parse the backup file
    const restoreData = await parseRestoreFile(file);

    const results: Record<string, { success: number; errors: string[] }> = {};
    let totalRestored = 0;
    let totalErrors = 0;

    // Restore each selected collection
    for (const collectionName of selectedCollections) {
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

      // Step 1: Clear the existing collection
      console.log(
        `🗑️ Clearing existing data from collection: ${collectionName}`
      );
      const clearResults = await clearCollection(collectionName);

      if (clearResults.errors.length > 0) {
        console.warn(
          `⚠️ Some errors occurred while clearing ${collectionName}:`,
          clearResults.errors
        );
        // Continue with restore even if some deletions failed
      }

      // Step 2: Restore the backup data
      console.log(`📥 Restoring backup data to collection: ${collectionName}`);
      const collectionResults = await restoreCollection(
        collectionName,
        collectionData.documents,
        (progress) => {
          if (onProgress) {
            onProgress({
              collection: collectionName,
              current: progress.current,
              total: progress.total,
            });
          }
        }
      );

      // Combine clear and restore results
      results[collectionName] = {
        success: collectionResults.success,
        errors: [...clearResults.errors, ...collectionResults.errors],
      };

      totalRestored += collectionResults.success;
      totalErrors +=
        clearResults.errors.length + collectionResults.errors.length;
    }

    const success = totalErrors === 0;
    const message = success
      ? `Restore completed successfully! Restored ${totalRestored} documents across ${selectedCollections.length} collections.`
      : `Restore completed with ${totalErrors} errors. Restored ${totalRestored} documents.`;

    console.log('🎉 Restore process completed');
    console.log(`📊 Total documents restored: ${totalRestored}`);
    console.log(`❌ Total errors: ${totalErrors}`);

    return {
      success,
      message,
      results,
      totalRestored,
      totalErrors,
    };
  } catch (error) {
    console.error('💥 Restore failed:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during restore',
      results: {},
      totalRestored: 0,
      totalErrors: 1,
    };
  }
};

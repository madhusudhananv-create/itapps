import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
import dotenv from 'dotenv';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });

// Firebase configuration - you'll need to set these environment variables
const firebaseConfig = {
  apiKey: process.env.AIMI_FIREBASE_API_KEY,
  authDomain: process.env.AIMI_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.AIMI_FIREBASE_PROJECT_ID,
  storageBucket: process.env.AIMI_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.AIMI_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.AIMI_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection names from your codebase
const COLLECTIONS = {
  ACTIVITIES: 'activities',
  PROJECT_INFO: 'projectInfo',
  PRACTICE_INFO: 'practiceInfo',
};

/**
 * Convert Firestore timestamp to ISO string
 */
const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;

  if (typeof timestamp === 'object' && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }

  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  return timestamp;
};

/**
 * Convert Firestore document to plain object
 */
const convertDocument = (doc) => {
  const data = doc.data();
  const converted = {
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
const backupCollection = async (collectionName) => {
  try {
    console.log(`📦 Backing up collection: ${collectionName}`);

    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const documents = [];
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
 * Create backup directory if it doesn't exist
 */
const ensureBackupDirectory = () => {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

/**
 * Generate backup filename with timestamp
 */
const generateBackupFilename = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `firestore-backup-${timestamp}-${time}.json`;
};

/**
 * Main backup function
 */
const performBackup = async () => {
  try {
    console.log('🚀 Starting Firestore backup...');

    // Check if Firebase config is available
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error(
        'Firebase configuration not found. Please set the required environment variables.'
      );
    }

    console.log(`📋 Project ID: ${firebaseConfig.projectId}`);

    // Create backup directory
    const backupDir = ensureBackupDirectory();

    // Backup all collections
    const backupData = {
      metadata: {
        projectId: firebaseConfig.projectId,
        backupDate: new Date().toISOString(),
        collections: Object.keys(COLLECTIONS),
      },
      collections: {},
    };

    // Backup each collection
    for (const [, collectionName] of Object.entries(COLLECTIONS)) {
      try {
        const documents = await backupCollection(collectionName);
        backupData.collections[collectionName] = {
          count: documents.length,
          documents: documents,
        };
      } catch (error) {
        console.error(`Failed to backup collection ${collectionName}:`, error);
        backupData.collections[collectionName] = {
          count: 0,
          documents: [],
          error: error.message,
        };
      }
    }

    // Generate filename and save backup
    const filename = generateBackupFilename();
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    // Calculate total documents
    const totalDocuments = Object.values(backupData.collections).reduce(
      (total, collection) => total + collection.count,
      0
    );

    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup saved to: ${filepath}`);
    console.log(`📊 Total documents backed up: ${totalDocuments}`);
    console.log(
      `📋 Collections backed up: ${Object.keys(COLLECTIONS).join(', ')}`
    );

    // Print collection statistics
    console.log('\n📈 Collection Statistics:');
    for (const [collectionName, data] of Object.entries(
      backupData.collections
    )) {
      if (data.error) {
        console.log(`  ❌ ${collectionName}: ${data.error}`);
      } else {
        console.log(`  ✅ ${collectionName}: ${data.count} documents`);
      }
    }

    return filepath;
  } catch (error) {
    console.error('💥 Backup failed:', error);
    process.exit(1);
  }
};

/**
 * Validate backup file
 */
const validateBackup = (filepath) => {
  try {
    const backupData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    console.log('\n🔍 Validating backup file...');

    // Check metadata
    if (!backupData.metadata) {
      throw new Error('Backup file is missing metadata');
    }

    if (!backupData.collections) {
      throw new Error('Backup file is missing collections data');
    }

    // Validate each collection
    for (const [collectionName, data] of Object.entries(
      backupData.collections
    )) {
      if (!data.documents || !Array.isArray(data.documents)) {
        throw new Error(
          `Collection ${collectionName} has invalid documents array`
        );
      }

      if (data.count !== data.documents.length) {
        console.warn(
          `⚠️  Warning: Collection ${collectionName} count mismatch (${data.count} vs ${data.documents.length})`
        );
      }
    }

    console.log('✅ Backup file validation passed');
    return true;
  } catch (error) {
    console.error('❌ Backup file validation failed:', error);
    return false;
  }
};

// Run backup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  performBackup()
    .then((filepath) => {
      validateBackup(filepath);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Backup failed:', error);
      process.exit(1);
    });
}

export { performBackup, validateBackup };

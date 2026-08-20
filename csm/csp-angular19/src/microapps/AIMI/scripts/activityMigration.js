import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
import dotenv from 'dotenv';

// Firebase imports
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  writeBatch,
  doc,
} from 'firebase/firestore';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });

// Firebase configuration
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

// API Configuration (matching apiConfig.ts)
const API_CONFIG = {
  BASE_URL: process.env.AIMI_API_BASE_URL,
  ENDPOINTS: {
    PROJECTS: '/api/auth/GetProjectListTemp',
  },
  TIMEOUT: parseInt(process.env.AIMI_API_TIMEOUT) || 10000, // 10 seconds timeout
};

const getApiUrl = (endpoint = API_CONFIG.ENDPOINTS.PROJECTS) => {
  const baseUrl = API_CONFIG.BASE_URL;
  return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
};

// Project data field mappings (matching your existing schema)
const PROJECT_DATA_FIELDS = {
  CUST_NM: 'cust_nm',
  PROJ_NM: 'proj_nm',
  BUSINESS_UNIT: 'BUSINESS_UNIT',
  PROJ_ID: 'proj_id',
};

/**
 * Convert API response to project data
 */
const mapApiResponseToProjectData = (apiResponseItem) => {
  return {
    customerName: String(apiResponseItem[PROJECT_DATA_FIELDS.CUST_NM] || ''),
    projectName: String(apiResponseItem[PROJECT_DATA_FIELDS.PROJ_NM] || ''),
    businessUnit: String(
      apiResponseItem[PROJECT_DATA_FIELDS.BUSINESS_UNIT] || ''
    ),
    projectId: String(apiResponseItem[PROJECT_DATA_FIELDS.PROJ_ID] || ''),
  };
};

/**
 * Fetch project data from API
 */
const fetchProjectData = async () => {
  if (!API_CONFIG.BASE_URL) {
    throw new Error('AIMI_API_BASE_URL not found in environment variables');
  }

  const apiUrl = getApiUrl();

  // Create fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch data from API: ${response.status} ${response.statusText}`
    );
  }

  const stringData = await response.json();
  const jsonData = JSON.parse(stringData);

  if (!Array.isArray(jsonData)) {
    throw new Error('API response does not contain an array of projects');
  }

  const parsedData = [];

  for (const item of jsonData) {
    try {
      const projectData = mapApiResponseToProjectData(item);
      if (projectData.projectId) {
        parsedData.push(projectData);
      }
    } catch (itemError) {
      // Silently skip invalid items
      console.warn('Skipping invalid item:', item, itemError.message);
    }
  }

  return parsedData;
};

/**
 * Create project mapping from API data
 */
const createProjectMapping = (projectData) => {
  const projectMapping = {};

  for (const project of projectData) {
    if (!project.projectId || project.projectId.trim() === '') {
      continue;
    }

    if (!projectMapping[project.projectId]) {
      projectMapping[project.projectId] = {
        account: project.customerName || 'Unknown Account',
        businessUnit: project.businessUnit || 'Unknown Business Unit',
        projectName: project.projectName || 'Unknown Project',
        projectId: project.projectId || 'Unknown Project ID',
      };
    }
  }

  return projectMapping;
};

/**
 * Save project mapping to JSON file
 */
const saveProjectMapping = (projectMapping) => {
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generate filename with timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `project-mapping-${timestamp}-${time}.json`;
  const filepath = path.join(dataDir, filename);

  // Create the data structure
  const mappingData = {
    projectMapping: projectMapping,
  };

  // Save to file
  fs.writeFileSync(filepath, JSON.stringify(mappingData, null, 2));

  return filepath;
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
 * Fetch all activities from Firestore
 */
const fetchActivities = async () => {
  const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  const activities = [];
  querySnapshot.forEach((doc) => {
    activities.push(convertDocument(doc));
  });

  return activities;
};

/**
 * Update activities with project mapping data
 */
const updateActivitiesWithProjectData = (activities, projectMapping) => {
  const updatedActivities = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let missingMappingCount = 0;

  for (const activity of activities) {
    const projectId = activity.projectId;

    if (!projectId) {
      skippedCount++;
      continue;
    }

    const projectInfo = projectMapping[projectId];

    if (!projectInfo) {
      missingMappingCount++;
      continue;
    }

    // Check if activity already has account and businessUnit fields
    const hasAccount = activity.account && activity.account.trim() !== '';
    const hasBusinessUnit =
      activity.businessUnit && activity.businessUnit.trim() !== '';

    if (hasAccount && hasBusinessUnit) {
      // Activity already has the fields, keep as is
      updatedActivities.push(activity);
      skippedCount++;
    } else {
      // Update activity with project data
      const updatedActivity = {
        ...activity,
        account: hasAccount ? activity.account : projectInfo.account,
        businessUnit: hasBusinessUnit
          ? activity.businessUnit
          : projectInfo.businessUnit,
      };

      updatedActivities.push(updatedActivity);
      updatedCount++;
    }
  }

  return {
    activities: updatedActivities,
    stats: {
      total: activities.length,
      updated: updatedCount,
      skipped: skippedCount,
      missingMapping: missingMappingCount,
    },
  };
};

/**
 * Save updated activities to JSON file
 */
const saveUpdatedActivities = (activities, stats) => {
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generate filename with timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `updated-activities-${timestamp}-${time}.json`;
  const filepath = path.join(dataDir, filename);

  // Create the data structure
  const activitiesData = {
    stats: stats,
    activities: activities,
  };

  // Save to file
  fs.writeFileSync(filepath, JSON.stringify(activitiesData, null, 2));

  return filepath;
};

/**
 * Update activities in Firestore using batch operations
 */
const updateActivitiesInFirestore = async (activities, stats) => {
  let batchCount = 0;
  let totalBatches = 0;
  const BATCH_SIZE = 100; // Firestore batch limit is 100 operations

  // Group activities into batches
  const batches = [];
  for (let i = 0; i < activities.length; i += BATCH_SIZE) {
    batches.push(activities.slice(i, i + BATCH_SIZE));
  }

  totalBatches = batches.length;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const currentBatch = batches[batchIndex];

    // Create a new batch for each group
    const currentWriteBatch = writeBatch(db);

    for (const activity of currentBatch) {
      const { id, ...activityData } = activity;

      // Only update if the activity has an ID and needs updating
      if (id && (activityData.account || activityData.businessUnit)) {
        const activityRef = doc(db, 'activities', id);

        // Prepare update data - only include fields that need updating
        const updateData = {};

        if (activityData.account) {
          updateData.account = activityData.account;
        }

        if (activityData.businessUnit) {
          updateData.businessUnit = activityData.businessUnit;
        }

        // Add updatedAt timestamp
        // updateData.updatedAt = new Date();

        // Update the document
        currentWriteBatch.update(activityRef, updateData);
        batchCount++;
      }
    }

    // Commit the current batch
    await currentWriteBatch.commit();

    // Log progress
    console.log(
      `Batch ${batchIndex + 1}/${totalBatches} committed (${currentBatch.length} activities)`
    );
  }

  return {
    totalBatches,
    totalUpdates: batchCount,
  };
};

/**
 * Validate that all activities were properly updated in Firestore
 */
const validateFirestoreUpdates = async (activities) => {
  const validationResults = [];
  let validCount = 0;
  let invalidCount = 0;

  // Sample validation - check a subset of activities
  const sampleSize = Math.min(10, activities.length);
  const sampleActivities = activities.slice(0, sampleSize);

  for (const activity of sampleActivities) {
    try {
      const activityRef = doc(db, 'activities', activity.id);
      const activityDoc = await getDoc(activityRef);

      if (activityDoc.exists()) {
        const data = activityDoc.data();
        const isValid = data.account && data.businessUnit;

        validationResults.push({
          id: activity.id,
          hasAccount: !!data.account,
          hasBusinessUnit: !!data.businessUnit,
          isValid,
        });

        if (isValid) {
          validCount++;
        } else {
          invalidCount++;
        }
      }
    } catch (error) {
      validationResults.push({
        id: activity.id,
        error: error.message,
        isValid: false,
      });
      invalidCount++;
    }
  }

  return {
    sampleSize,
    validCount,
    invalidCount,
    validationResults,
  };
};

/**
 * Main function
 */
const performActivityMigration = async () => {
  try {
    // Step 1: Fetch project data from API
    const projectData = await fetchProjectData();

    if (projectData.length === 0) {
      throw new Error('No project data received from API');
    }

    // Step 2: Create project mapping
    const projectMapping = createProjectMapping(projectData);

    if (Object.keys(projectMapping).length === 0) {
      throw new Error('No valid project mappings created');
    }

    // Step 3: Save project mapping to JSON file
    const mappingFilepath = saveProjectMapping(projectMapping);

    // Step 4: Fetch activities from Firestore
    const activities = await fetchActivities();

    if (activities.length === 0) {
      throw new Error('No activities found in Firestore');
    }

    // Step 5: Update activities with project mapping data
    const { activities: updatedActivities, stats } =
      updateActivitiesWithProjectData(activities, projectMapping);

    // Step 6: Save updated activities to JSON file
    const activitiesFilepath = saveUpdatedActivities(updatedActivities, stats);

    // Step 7: Update activities in Firestore
    console.log('Updating activities in Firestore...');
    const firestoreUpdateResult = await updateActivitiesInFirestore(
      updatedActivities,
      stats
    );

    // Step 8: Validate Firestore updates
    console.log('Validating Firestore updates...');
    const validationResult = await validateFirestoreUpdates(updatedActivities);

    return {
      mappingFilepath,
      activitiesFilepath,
      projectMapping,
      updatedActivities,
      stats,
      firestoreUpdateResult,
      validationResult,
    };
  } catch (error) {
    console.error('Activity migration failed:', error);
    throw error;
  }
};

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  performActivityMigration()
    .then(
      ({
        projectMapping,
        updatedActivities,
        stats,
        firestoreUpdateResult,
        validationResult,
      }) => {
        console.log('\n=== MIGRATION SUMMARY ===');
        console.log(`Total projects: ${Object.keys(projectMapping).length}`);
        console.log(`Total activities: ${stats.total}`);
        console.log(`Activities updated: ${stats.updated}`);
        console.log(`Activities skipped: ${stats.skipped}`);
        console.log(`Activities missing mapping: ${stats.missingMapping}`);

        console.log('\n=== FIRESTORE UPDATE RESULTS ===');
        console.log(`Total batches: ${firestoreUpdateResult.totalBatches}`);
        console.log(`Total updates: ${firestoreUpdateResult.totalUpdates}`);

        console.log('\n=== VALIDATION RESULTS ===');
        console.log(`Sample size: ${validationResult.sampleSize}`);
        console.log(`Valid updates: ${validationResult.validCount}`);
        console.log(`Invalid updates: ${validationResult.invalidCount}`);

        if (validationResult.invalidCount > 0) {
          console.log(
            '\n⚠️  Some validation issues found. Check the validation results.'
          );
        } else {
          console.log('\n✅ All sampled activities validated successfully!');
        }

        process.exit(0);
      }
    )
    .catch((error) => {
      console.error('Activity migration failed:', error);
      process.exit(1);
    });
}

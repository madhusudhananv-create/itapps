import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.AIMI_FIREBASE_API_KEY,
  authDomain: import.meta.env.AIMI_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.AIMI_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.AIMI_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.AIMI_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.AIMI_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firebase project IDs used to identify which environment the app is pointing to
const DEV_FIREBASE_PROJECT_ID = 'fir-quality-396a7';
const LIVE_FIREBASE_PROJECT_ID = 'ai-maturity-index';

export type AppEnvironment = 'dev' | 'live' | 'unknown';

// Determines whether the app is currently connected to the dev or live Firebase project
export function getAppEnvironment(): AppEnvironment {
  switch (firebaseConfig.projectId) {
    case DEV_FIREBASE_PROJECT_ID:
      return 'dev';
    case LIVE_FIREBASE_PROJECT_ID:
      return 'live';
    default:
      return 'unknown';
  }
}

export default app;

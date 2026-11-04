import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@shared/config/firebaseConfig';

// Collection name
const PRACTICE_INFO_COLLECTION = 'practiceInfo';

// Interface for practice info document
export interface PracticeInfo {
  projectId: string;
  practice: string;
  currentPhase: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Firestore documents
interface FirestorePracticeInfo
  extends Omit<PracticeInfo, 'createdAt' | 'updatedAt'> {
  createdAt: unknown; // Firestore timestamp
  updatedAt: unknown; // Firestore timestamp
}

/**
 * Convert Firestore document to PracticeInfo
 */
const convertFirestoreToPracticeInfo = (
  doc: QueryDocumentSnapshot<DocumentData>
): PracticeInfo => {
  const data = doc.data() as FirestorePracticeInfo;
  return {
    projectId: data.projectId,
    practice: data.practice,
    currentPhase: data.currentPhase,
    createdAt:
      data.createdAt &&
      typeof data.createdAt === 'object' &&
      'toDate' in data.createdAt
        ? (data.createdAt as { toDate(): Date }).toDate()
        : new Date(),
    updatedAt:
      data.updatedAt &&
      typeof data.updatedAt === 'object' &&
      'toDate' in data.updatedAt
        ? (data.updatedAt as { toDate(): Date }).toDate()
        : new Date(),
  };
};

/**
 * Convert PracticeInfo to Firestore document
 */
const convertPracticeInfoToFirestore = (
  practiceInfo: Omit<PracticeInfo, 'createdAt' | 'updatedAt'>
): Omit<FirestorePracticeInfo, 'createdAt' | 'updatedAt'> => {
  return {
    projectId: practiceInfo.projectId,
    practice: practiceInfo.practice,
    currentPhase: practiceInfo.currentPhase,
  };
};

/**
 * Save or update practice info (upsert operation)
 */
const saveOrUpdatePracticeInfo = async (
  practiceInfo: Omit<PracticeInfo, 'createdAt' | 'updatedAt'>
): Promise<PracticeInfo> => {
  try {
    // Check if info already exists
    const q = query(
      collection(db, PRACTICE_INFO_COLLECTION),
      where('projectId', '==', practiceInfo.projectId),
      where('practice', '==', practiceInfo.practice)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new document
      const infoData = convertPracticeInfoToFirestore(practiceInfo);
      await addDoc(collection(db, PRACTICE_INFO_COLLECTION), {
        ...infoData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        ...practiceInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      // Update existing document
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        currentPhase: practiceInfo.currentPhase,
        updatedAt: serverTimestamp(),
      });

      return {
        ...practiceInfo,
        createdAt:
          querySnapshot.docs[0].data().createdAt?.toDate() ?? new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    console.error(
      'Error saving or updating practice info in Firestore:',
      error
    );
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
    const q = query(
      collection(db, PRACTICE_INFO_COLLECTION),
      where('projectId', '==', projectId),
      where('practice', '==', practice)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return convertFirestoreToPracticeInfo(querySnapshot.docs[0]);
  } catch (error) {
    console.error('Error fetching practice info from Firestore:', error);
    throw error;
  }
};

/**
 * Get all practice info from Firestore
 */
const getAllPracticeInfo = async (): Promise<PracticeInfo[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, PRACTICE_INFO_COLLECTION)
    );
    const practiceInfoList: PracticeInfo[] = [];

    querySnapshot.forEach((doc) => {
      practiceInfoList.push(convertFirestoreToPracticeInfo(doc));
    });

    return practiceInfoList;
  } catch (error) {
    console.error('Error fetching all practice info from Firestore:', error);
    throw error;
  }
};

export const practiceInfoService = {
  saveOrUpdatePracticeInfo,
  getPracticeInfo,
  getAllPracticeInfo,
};

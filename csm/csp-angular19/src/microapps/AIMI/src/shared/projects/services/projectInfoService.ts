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
const PROJECT_INFO_COLLECTION = 'projectInfo';

// Interface for project info document
export interface ProjectInfo {
  projectId: string;
  peopleUsingAI: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Firestore documents
interface FirestoreProjectInfo
  extends Omit<ProjectInfo, 'createdAt' | 'updatedAt'> {
  createdAt: unknown; // Firestore timestamp
  updatedAt: unknown; // Firestore timestamp
}

/**
 * Convert Firestore document to ProjectInfo
 */
const convertFirestoreToProjectInfo = (
  doc: QueryDocumentSnapshot<DocumentData>
): ProjectInfo => {
  const data = doc.data() as FirestoreProjectInfo;
  return {
    projectId: data.projectId,
    peopleUsingAI: data.peopleUsingAI,
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
 * Convert ProjectInfo to Firestore document
 */
const convertProjectInfoToFirestore = (
  projectInfo: Omit<ProjectInfo, 'createdAt' | 'updatedAt'>
): Omit<FirestoreProjectInfo, 'createdAt' | 'updatedAt'> => {
  return {
    projectId: projectInfo.projectId,
    peopleUsingAI: projectInfo.peopleUsingAI,
  };
};

/**
 * Save or update project info (upsert operation)
 */
const saveOrUpdateProjectInfo = async (
  projectInfo: Omit<ProjectInfo, 'createdAt' | 'updatedAt'>
): Promise<ProjectInfo> => {
  try {
    // Check if info already exists
    const q = query(
      collection(db, PROJECT_INFO_COLLECTION),
      where('projectId', '==', projectInfo.projectId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new document
      const infoData = convertProjectInfoToFirestore(projectInfo);
      await addDoc(collection(db, PROJECT_INFO_COLLECTION), {
        ...infoData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        ...projectInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      // Update existing document
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        peopleUsingAI: projectInfo.peopleUsingAI,
        updatedAt: serverTimestamp(),
      });

      return {
        ...projectInfo,
        createdAt:
          querySnapshot.docs[0].data().createdAt?.toDate() ?? new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    console.error('Error saving or updating project info in Firestore:', error);
    throw error;
  }
};

/**
 * Get project info by project ID
 */
const getProjectInfo = async (projectId: string): Promise<ProjectInfo> => {
  try {
    const q = query(
      collection(db, PROJECT_INFO_COLLECTION),
      where('projectId', '==', projectId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Return default object when no document exists
      return {
        projectId,
        peopleUsingAI: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const projectInfo = convertFirestoreToProjectInfo(querySnapshot.docs[0]);

    // Return default object if peopleUsingAI is undefined
    if (
      projectInfo.peopleUsingAI === undefined ||
      projectInfo.peopleUsingAI === null
    ) {
      return {
        projectId,
        peopleUsingAI: 0,
        createdAt: projectInfo.createdAt || new Date(),
        updatedAt: projectInfo.updatedAt || new Date(),
      };
    }

    return projectInfo;
  } catch (error) {
    console.error('Error fetching project info from Firestore:', error);
    throw error;
  }
};

/**
 * Get all project info from Firestore
 */
const getAllProjectInfo = async (): Promise<ProjectInfo[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, PROJECT_INFO_COLLECTION)
    );
    const projectInfoList: ProjectInfo[] = [];

    querySnapshot.forEach((doc) => {
      projectInfoList.push(convertFirestoreToProjectInfo(doc));
    });

    return projectInfoList;
  } catch (error) {
    console.error('Error fetching all project info from Firestore:', error);
    throw error;
  }
};

export const projectInfoService = {
  saveOrUpdateProjectInfo,
  getProjectInfo,
  getAllProjectInfo,
};

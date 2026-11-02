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

  isProjectNA?: boolean;
  naComments?: string;

  licenseCount?: number;
  licenseProvider?: string;

  runOpsAutoResolved?: string;
  runOpsMTTRReduction?: string;
  runOpsAIAgents?: string;
  runOpsAutomatedWorkflows?: string;
  runOpsMTTD?: string;
  runOpsMTTR?: string;

  engineerAIAgents?: string;
  engineerDeliveryCycleTime?: string;
  engineerContractTestCasePassRate?: string;
  engineerPerformanceDefectsPreRelease?: string;

  commonAdoptionWorkforceCertification?: string;
  commonAdoptionEffortsSaved?: string;
  commonDeploymentEngineer?: string;
  commonGrossMarginUplift?: string;
  commonRevenuePerFTE?: string;
  commonMarginDifferential?: string;

  presentationDone?: boolean;
  projectFY?: string;
  acceptedScore?: number;
scoreReviewed?: boolean;
acceptedScoreComment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


// Interface for Firestore documents
interface FirestoreProjectInfo
  extends Omit<ProjectInfo, 'createdAt' | 'updatedAt'> {
  createdAt: unknown; // Firestore timestamp
  updatedAt: unknown; // Firestore timestamp
  acceptedScore?: number;
  scoreReviewed?: boolean;
  acceptedScoreComment?: string;
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

  isProjectNA: data.isProjectNA ?? false,
  naComments: data.naComments ?? '',

  licenseCount: data.licenseCount,
  licenseProvider: data.licenseProvider,

  runOpsAutoResolved: data.runOpsAutoResolved,
  runOpsMTTRReduction: data.runOpsMTTRReduction,
  runOpsAIAgents: data.runOpsAIAgents,
  runOpsAutomatedWorkflows: data.runOpsAutomatedWorkflows,
  runOpsMTTD: data.runOpsMTTD,
  runOpsMTTR: data.runOpsMTTR,

  engineerAIAgents: data.engineerAIAgents,
  engineerDeliveryCycleTime:
    data.engineerDeliveryCycleTime,
  engineerContractTestCasePassRate:
    data.engineerContractTestCasePassRate,
  engineerPerformanceDefectsPreRelease:
    data.engineerPerformanceDefectsPreRelease,

  commonAdoptionWorkforceCertification:
    data.commonAdoptionWorkforceCertification,
  commonAdoptionEffortsSaved:
    data.commonAdoptionEffortsSaved,

  commonDeploymentEngineer:
    data.commonDeploymentEngineer,

  commonGrossMarginUplift:
    data.commonGrossMarginUplift,

  commonRevenuePerFTE:
    data.commonRevenuePerFTE,

  commonMarginDifferential:
    data.commonMarginDifferential,

  presentationDone:
    data.presentationDone ?? false,

  projectFY:
    data.projectFY ?? '',
    acceptedScore: data.acceptedScore,
    scoreReviewed: data.scoreReviewed ?? false,
    acceptedScoreComment: data.acceptedScoreComment ?? '',

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
/**
 * Convert ProjectInfo to Firestore document
 */
const convertProjectInfoToFirestore = (
  projectInfo: Omit<ProjectInfo, 'createdAt' | 'updatedAt'>
): Record<string, unknown> => {
  const data: Record<string, unknown> = {
    projectId: projectInfo.projectId,
    peopleUsingAI: projectInfo.peopleUsingAI,

    isProjectNA: projectInfo.isProjectNA ?? false,
    naComments: projectInfo.naComments ?? '',

    licenseCount: projectInfo.licenseCount,
    licenseProvider: projectInfo.licenseProvider,

    runOpsAutoResolved: projectInfo.runOpsAutoResolved,
    runOpsMTTRReduction: projectInfo.runOpsMTTRReduction,
    runOpsAIAgents: projectInfo.runOpsAIAgents,
    runOpsAutomatedWorkflows:
      projectInfo.runOpsAutomatedWorkflows,
    runOpsMTTD: projectInfo.runOpsMTTD,
    runOpsMTTR: projectInfo.runOpsMTTR,

    engineerAIAgents: projectInfo.engineerAIAgents,
    engineerDeliveryCycleTime:
      projectInfo.engineerDeliveryCycleTime,
    engineerContractTestCasePassRate:
      projectInfo.engineerContractTestCasePassRate,
    engineerPerformanceDefectsPreRelease:
      projectInfo.engineerPerformanceDefectsPreRelease,

    commonAdoptionWorkforceCertification:
      projectInfo.commonAdoptionWorkforceCertification,
    commonAdoptionEffortsSaved:
      projectInfo.commonAdoptionEffortsSaved,
    commonDeploymentEngineer:
      projectInfo.commonDeploymentEngineer,
    commonGrossMarginUplift:
      projectInfo.commonGrossMarginUplift,
    commonRevenuePerFTE:
      projectInfo.commonRevenuePerFTE,
    commonMarginDifferential:
      projectInfo.commonMarginDifferential,

    presentationDone:
      projectInfo.presentationDone,

    projectFY:
      projectInfo.projectFY,
      acceptedScore: projectInfo.acceptedScore,
      scoreReviewed: projectInfo.scoreReviewed,
      acceptedScoreComment: projectInfo.acceptedScoreComment,
  };

  // Remove undefined values because Firestore doesn't support them
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });

  return data;
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
      const projectData =
  convertProjectInfoToFirestore(projectInfo);
console.log(
  'Saving Payload',
  convertProjectInfoToFirestore(projectInfo)
);
await updateDoc(docRef, {
  ...projectData,
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

        isProjectNA: false,
        naComments: '',

        licenseCount: 0,
        licenseProvider: '',

        presentationDone: false,
        projectFY: '',

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
        isProjectNA: projectInfo.isProjectNA ?? false,
        naComments: projectInfo.naComments ?? '',
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

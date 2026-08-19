import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@shared/config/firebaseConfig';
import type { ActivityWithProjectInfo } from '../types/activityTypes';

// Collection name for activities
const ACTIVITIES_COLLECTION = 'activities';

// Interface for Firestore activity document
interface FirestoreActivity
  extends Omit<ActivityWithProjectInfo, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: unknown; // Firestore timestamp
  updatedAt: unknown; // Firestore timestamp
}

/**
 * Convert Firestore document to ActivityWithProjectInfo
 */
const convertFirestoreToActivity = (
  doc: QueryDocumentSnapshot<DocumentData>
): ActivityWithProjectInfo => {
  const data = doc.data() as FirestoreActivity;
  return {
    id: doc.id,
    sdlcPhase: data.sdlcPhase,
    activity: data.activity,
    applicability: data.applicability,
    aiAdoptionScore: data.aiAdoptionScore,
    aiToolUsed: data.aiToolUsed,
    clientApproved: data.clientApproved || '',
    acceleratorsUsed: data.acceleratorsUsed || '',
    workDoneByAI: data.workDoneByAI,
    hoursSaved: data.hoursSaved,
    revenueGenerated: data.revenueGenerated,
    benefitTo: data.benefitTo,
    qualitativeBenefits: data.qualitativeBenefits,
    comments: data.comments,
    status: data.status || 'submitted',
    projectId: data.projectId,
    practice: data.practice,
    project: data.project,
    account: data.account,
    businessUnit: data.businessUnit,
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
        : undefined,
  };
};

/**
 * Convert ActivityWithProjectInfo to Firestore document
 */
const convertActivityToFirestore = (
  activity: Omit<ActivityWithProjectInfo, 'id'>
): Omit<FirestoreActivity, 'createdAt' | 'updatedAt'> => {
  return {
    sdlcPhase: activity.sdlcPhase,
    activity: activity.activity,
    applicability: activity.applicability,
    aiAdoptionScore: activity.aiAdoptionScore,
    aiToolUsed: activity.aiToolUsed,
    clientApproved: activity.clientApproved || '',
    acceleratorsUsed: activity.acceleratorsUsed || '',
    workDoneByAI: activity.workDoneByAI,
    hoursSaved: activity.hoursSaved,
    revenueGenerated: activity.revenueGenerated,
    benefitTo: activity.benefitTo,
    qualitativeBenefits: activity.qualitativeBenefits,
    comments: activity.comments,
    status: activity.status || 'submitted',
    projectId: activity.projectId,
    practice: activity.practice,
    project: activity.project,
    account: activity.account,
    businessUnit: activity.businessUnit,
  };
};

export const activityService = {
  /**
   * Save a new activity to Firestore
   */
  saveActivity: async (
    activity: Omit<ActivityWithProjectInfo, 'id'>
  ): Promise<ActivityWithProjectInfo> => {
    try {
      const activityData = convertActivityToFirestore(activity);
      const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), {
        ...activityData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Return the created activity with the generated ID
      return {
        ...activity,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error saving activity to Firestore:', error);
      throw error;
    }
  },

  /**
   * Save multiple activities to Firestore
   */
  saveActivities: async (
    activities: Omit<ActivityWithProjectInfo, 'id'>[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      const savedActivities: ActivityWithProjectInfo[] = [];

      // Save activities one by one (for better error handling)
      for (const activity of activities) {
        const savedActivity = await activityService.saveActivity(activity);
        savedActivities.push(savedActivity);
      }

      return savedActivities;
    } catch (error) {
      console.error('Error saving activities to Firestore:', error);
      throw error;
    }
  },

  /**
   * Update an existing activity in Firestore
   */
  updateActivity: async (
    activityId: string,
    updates: Partial<Omit<ActivityWithProjectInfo, 'id' | 'createdAt'>>
  ): Promise<ActivityWithProjectInfo> => {
    try {
      const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
      await updateDoc(activityRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Return the updated activity
      return await activityService.getActivityById(activityId);
    } catch (error) {
      console.error('Error updating activity in Firestore:', error);
      throw error;
    }
  },

  /**
   * Delete an activity from Firestore
   */
  deleteActivity: async (activityId: string): Promise<void> => {
    try {
      const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
      await deleteDoc(activityRef);
    } catch (error) {
      console.error('Error deleting activity from Firestore:', error);
      throw error;
    }
  },

  /**
   * Fetch activities by project ID and practice from Firestore
   */
  getActivitiesByProjectIdAndPractice: async (
    projectId: string,
    practice: string
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where('projectId', '==', projectId),
        where('practice', '==', practice),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const activities: ActivityWithProjectInfo[] = [];

      querySnapshot.forEach((doc) => {
        activities.push(convertFirestoreToActivity(doc));
      });

      return activities;
    } catch (error) {
      console.error(
        'Error fetching activities by project ID and practice from Firestore:',
        error
      );
      throw error;
    }
  },

  /**
   * Fetch all activities by project ID from Firestore
   */
  getActivitiesByProjectId: async (
    projectId: string
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const activities: ActivityWithProjectInfo[] = [];

      querySnapshot.forEach((doc) => {
        activities.push(convertFirestoreToActivity(doc));
      });

      return activities;
    } catch (error) {
      console.error(
        'Error fetching activities by project ID from Firestore:',
        error
      );
      throw error;
    }
  },

  /**
   * Fetch a single activity by ID from Firestore
   */
  getActivityById: async (
    activityId: string
  ): Promise<ActivityWithProjectInfo> => {
    try {
      const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
      const activityDoc = await getDoc(activityRef);

      if (!activityDoc.exists()) {
        throw new Error(`Activity with ID ${activityId} not found`);
      }

      return convertFirestoreToActivity(activityDoc);
    } catch (error) {
      console.error('Error fetching activity by ID from Firestore:', error);
      throw error;
    }
  },

  /**
   * Fetch all activities from Firestore
   */
  getAllActivities: async (): Promise<ActivityWithProjectInfo[]> => {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const activities: ActivityWithProjectInfo[] = [];

      querySnapshot.forEach((doc) => {
        activities.push(convertFirestoreToActivity(doc));
      });

      return activities;
    } catch (error) {
      console.error('Error fetching all activities from Firestore:', error);
      throw error;
    }
  },

  /**
   * Upsert activities for a specific project and practice
   * Updates existing activities and creates new ones efficiently
   */
  upsertActivitiesForProject: async (
    activities: ActivityWithProjectInfo[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (activities.length === 0) return [];

      const projectId = activities[0].projectId;
      const practice = activities[0].practice;

      // Get existing activities for comparison
      const existingActivities =
        await activityService.getActivitiesByProjectIdAndPractice(
          projectId,
          practice
        );
      const existingActivityMap = new Map(
        existingActivities.map((activity) => [activity.id, activity])
      );

      const upsertedActivities: ActivityWithProjectInfo[] = [];

      // Process each activity
      for (const activity of activities) {
        if (activity.id && existingActivityMap.has(activity.id)) {
          // Update existing activity using the existing updateActivity method
          const { id, ...updateData } = activity;
          const updatedActivity = await activityService.updateActivity(
            id,
            updateData
          );
          upsertedActivities.push(updatedActivity);
        } else {
          // Create new activity using the existing saveActivity method
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...activityWithoutId } = activity;
          const savedActivity =
            await activityService.saveActivity(activityWithoutId);
          upsertedActivities.push(savedActivity);
        }
      }

      return upsertedActivities;
    } catch (error) {
      console.error(
        'Error upserting activities for project in Firestore:',
        error
      );
      throw error;
    }
  },

  /**
   * Clear all activities from Firestore (use with caution!)
   */
  clearAllActivities: async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(
        collection(db, ACTIVITIES_COLLECTION)
      );
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing all activities from Firestore:', error);
      throw error;
    }
  },

  /**
   * Fetch activities by multiple business units and practices from Firestore
   */
  getActivitiesByBusinessUnits: async (
    businessUnits: string[],
    practices?: string[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (businessUnits.length === 0) return [];

      let q;
      if (practices && practices.length > 0) {
        // Filter by both business units and practices
        q = query(
          collection(db, ACTIVITIES_COLLECTION),
          where('businessUnit', 'in', businessUnits),
          where('practice', 'in', practices),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Filter by business units only
        q = query(
          collection(db, ACTIVITIES_COLLECTION),
          where('businessUnit', 'in', businessUnits),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const activities: ActivityWithProjectInfo[] = [];

      querySnapshot.forEach((doc) => {
        activities.push(convertFirestoreToActivity(doc));
      });

      return activities;
    } catch (error) {
      console.error(
        'Error fetching activities by business units from Firestore:',
        error
      );
      throw error;
    }
  },

  /**
   * Fetch activities by multiple accounts and practices from Firestore
   */
  getActivitiesByAccounts: async (
    accounts: string[],
    practices?: string[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (accounts.length === 0) return [];

      let q;
      if (practices && practices.length > 0) {
        // Filter by both accounts and practices
        q = query(
          collection(db, ACTIVITIES_COLLECTION),
          where('account', 'in', accounts),
          where('practice', 'in', practices),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Filter by accounts only
        q = query(
          collection(db, ACTIVITIES_COLLECTION),
          where('account', 'in', accounts),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const activities: ActivityWithProjectInfo[] = [];

      querySnapshot.forEach((doc) => {
        activities.push(convertFirestoreToActivity(doc));
      });

      return activities;
    } catch (error) {
      console.error(
        'Error fetching activities by accounts from Firestore:',
        error
      );
      throw error;
    }
  },

  /**
   * Fetch activities by multiple projects and practices from Firestore
   */
  getActivitiesByProjects: async (
    projects: string[],
    practices?: string[]
  ): Promise<ActivityWithProjectInfo[]> => {
    try {
      if (projects.length === 0) return [];

      let q;
      if (practices && practices.length > 0) {
        // Filter by both projects and practices
        q = query(
          collection(db, ACTIVITIES_COLLECTION),
          where('project', 'in', projects),
          where('practice', 'in', practices),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Filter by projects only
        q = query(
          collection(db, ACTIVITIES_COLLECTION),
          where('project', 'in', projects),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const activities: ActivityWithProjectInfo[] = [];

      querySnapshot.forEach((doc) => {
        activities.push(convertFirestoreToActivity(doc));
      });

      return activities;
    } catch (error) {
      console.error(
        'Error fetching activities by projects from Firestore:',
        error
      );
      throw error;
    }
  },
};

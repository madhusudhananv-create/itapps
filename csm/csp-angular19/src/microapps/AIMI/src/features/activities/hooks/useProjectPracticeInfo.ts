import { useState, useEffect, useCallback, useRef } from 'react';
import { practiceInfoService } from '@shared/practices/services/practiceInfoService';
import type { PracticeInfo } from '@shared/practices/services/practiceInfoService';
import { projectInfoService } from '@shared/projects/services/projectInfoService';
import type { ProjectInfo } from '@shared/projects/services/projectInfoService';

interface UseProjectPracticeInfoProps {
  projectId?: string;
  practice?: string;
}

interface UseProjectPracticeInfoReturn {
  projectInfo: ProjectInfo | null;
  practiceInfo: PracticeInfo | null;
  isLoading: boolean;
  error: string | null;
  saveProjectInfo: (peopleUsingAI: number) => Promise<void>;
  savePracticeInfo: (currentPhase: string) => Promise<void>;
}

// Validation functions
const validateProjectInfo = (
  projectId: string,
  peopleUsingAI: number
): void => {
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project ID is required and must be a string');
  }

  if (typeof peopleUsingAI !== 'number' || peopleUsingAI < 0) {
    throw new Error('People using AI must be a non-negative number');
  }
};

const validatePracticeInfo = (
  projectId: string,
  practice: string,
  currentPhase: string
): void => {
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project ID is required and must be a string');
  }

  if (!practice || typeof practice !== 'string') {
    throw new Error('Practice is required and must be a string');
  }

  if (!currentPhase || typeof currentPhase !== 'string') {
    throw new Error('Current phase is required and must be a string');
  }
};

export const useProjectPracticeInfo = ({
  projectId,
  practice,
}: UseProjectPracticeInfoProps): UseProjectPracticeInfoReturn => {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [practiceInfo, setPracticeInfo] = useState<PracticeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track current values for comparison
  const projectInfoRef = useRef<ProjectInfo | null>(null);
  const practiceInfoRef = useRef<PracticeInfo | null>(null);

  // Update refs when state changes
  useEffect(() => {
    projectInfoRef.current = projectInfo;
  }, [projectInfo]);

  useEffect(() => {
    practiceInfoRef.current = practiceInfo;
  }, [practiceInfo]);

  // Fetch project info only
  const fetchProjectInfo = useCallback(async () => {
    if (!projectId) {
      setProjectInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const projectData = await projectInfoService.getProjectInfo(projectId);
      setProjectInfo(projectData);
    } catch (err) {
      console.error('Error fetching project info:', err);
      setError('Failed to fetch project info');
      setProjectInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Fetch practice info only
  const fetchPracticeInfo = useCallback(async () => {
    if (!projectId || !practice) {
      setPracticeInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const practiceData = await practiceInfoService.getPracticeInfo(
        projectId,
        practice
      );
      setPracticeInfo(practiceData);
    } catch (err) {
      console.error('Error fetching practice info:', err);
      setError('Failed to fetch practice info');
      setPracticeInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, practice]);

  // Combined save function for project info
  const saveProjectInfo = useCallback(
    async (peopleUsingAI: number) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Validate input data
      validateProjectInfo(projectId, peopleUsingAI);

      setIsLoading(true);
      setError(null);

      try {
        const savedInfo = await projectInfoService.saveOrUpdateProjectInfo({
          projectId,
          peopleUsingAI,
        });
        setProjectInfo(savedInfo);
      } catch (err) {
        console.error('Error saving project info:', err);
        setError('Failed to save project info');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId]
  );

  // Combined save function for practice info
  const savePracticeInfo = useCallback(
    async (currentPhase: string) => {
      if (!projectId || !practice) {
        throw new Error('Project ID and practice are required');
      }

      // Validate input data
      validatePracticeInfo(projectId, practice, currentPhase);

      setIsLoading(true);
      setError(null);

      try {
        const savedInfo = await practiceInfoService.saveOrUpdatePracticeInfo({
          projectId,
          practice,
          currentPhase,
        });
        setPracticeInfo(savedInfo);
      } catch (err) {
        console.error('Error saving practice info:', err);
        setError('Failed to save practice info');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, practice]
  );

  // Effect to fetch project info when projectId changes
  useEffect(() => {
    // Only fetch if projectId has changed
    if (
      projectInfoRef.current &&
      projectInfoRef.current.projectId === projectId
    ) {
      return;
    }
    fetchProjectInfo();
  }, [fetchProjectInfo, projectId]);

  // Effect to fetch practice info when projectId or practice changes
  useEffect(() => {
    // Only fetch if projectId or practice has changed
    if (
      practiceInfoRef.current &&
      practiceInfoRef.current.projectId === projectId &&
      practiceInfoRef.current.practice === practice
    ) {
      return;
    }
    fetchPracticeInfo();
  }, [fetchPracticeInfo, projectId, practice]);

  return {
    projectInfo,
    practiceInfo,
    isLoading,
    error,
    saveProjectInfo,
    savePracticeInfo,
  };
};

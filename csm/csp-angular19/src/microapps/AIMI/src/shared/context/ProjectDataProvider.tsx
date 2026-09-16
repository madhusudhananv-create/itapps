import React, { useEffect, useMemo, useState } from 'react';
import type { ProjectData } from '@shared/projects/types/projectDataSchema';
import { getApiUrl } from '@shared/config/apiConfig';
import { mapApiResponseToProjectData } from '@shared/projects/utils/projectDataUtils';
import { useAuth } from '@auth/hooks/useAuth';
import {
  ProjectDataContext,
  type ProjectDataContextValue,
} from './ProjectDataContext';

interface ProjectDataProviderProps {
  children: React.ReactNode;
}

export const ProjectDataProvider: React.FC<ProjectDataProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl());

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

      const parsedData: ProjectData[] = [];

      for (const item of jsonData) {
        try {
          const projectData = mapApiResponseToProjectData(item);
          parsedData.push(projectData);
        } catch (itemError) {
          console.warn('Failed to parse API item:', item, itemError);
        }
      }

      setData(parsedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch project data if user is authenticated and auth loading is complete
    if (isAuthenticated && !isAuthLoading) {
      fetchProjectData();
    } else if (!isAuthenticated && !isAuthLoading) {
      // Reset data when not authenticated
      setData([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, isAuthLoading]);

  const value: ProjectDataContextValue = useMemo(
    () => ({
      data,
      loading: isAuthLoading ?? loading, // Show loading if auth is loading or data is loading
      error,
    }),
    [data, isAuthLoading, loading, error]
  );

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  );
};

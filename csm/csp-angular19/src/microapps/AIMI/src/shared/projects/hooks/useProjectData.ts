import { useContext } from 'react';
import {
  ProjectDataContext,
  type ProjectDataContextValue,
} from '@shared/context/ProjectDataContext';

export const useProjectData = (): ProjectDataContextValue => {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error('useProjectData must be used within a ProjectDataProvider');
  }
  return context;
};

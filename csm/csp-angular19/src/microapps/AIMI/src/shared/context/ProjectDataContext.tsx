import { createContext } from 'react';
import type { ProjectData } from '@shared/projects/types/projectDataSchema';

export interface ProjectDataContextValue {
  data: ProjectData[];
  loading: boolean;
  error: string | null;
}

export const ProjectDataContext = createContext<
  ProjectDataContextValue | undefined
>(undefined);

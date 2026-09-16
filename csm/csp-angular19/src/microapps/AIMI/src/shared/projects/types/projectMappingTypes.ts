// Interface for project mapping data used in activity enrichment
export interface ProjectMapping {
  businessHead: string;
  accountManager: string;
  manager: string;
  headcount?: number;
  currentPhase?: string;
}

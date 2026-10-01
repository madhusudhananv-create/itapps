import type { ActivityWithProjectInfo } from '@activities/types/activityTypes';

// Interface for fully enriched activity data
export interface EnrichedActivityWithProjectInfo
  extends ActivityWithProjectInfo {
  businessHead: string;
  accountManager: string;
  manager: string;
  headcount?: number;
  currentPhase?: string;
  peopleUsingAI?: number;
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
  acceptedScore?: number;
  acceptedScoreComment?: string;
}

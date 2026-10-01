export type AIToolDetails = Record<
  string,
  {
    accessType: string;
    licenseCount: number;
    networkType: string;
  }
>;

export interface ActivityFormData {
  sdlcPhase: string;
  activity: string;
  applicability: string;
  aiAdoptionScore: string;
  aiToolUsed: string | string[];
  //clientApproved: string;
  acceleratorsUsed: string | string[];
  workDoneByAI: number;
  hoursSaved: number;
  revenueGenerated: string;
  benefitTo: string;
  qualitativeBenefits: string[];
  comments: string;
  //aiToolDetails?: AIToolDetails;
}


// Draft entries are auto-saved so data isn't lost if the connection drops; submitted entries are final
export type ActivityStatus = 'draft' | 'submitted';

export interface ActivityData extends ActivityFormData {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  status?: ActivityStatus;
}

export interface ProjectInfo {
  projectId: string;
  businessUnit: string;
  businessHead: string;
  account: string;
  accountManager: string;
  project: string;
  practice: string;
  manager: string;
  currentPhase: string;
}

// New interface for activities with project information
export interface ActivityWithProjectInfo
  extends ActivityData,
    Pick<
      ProjectInfo,
      'projectId' | 'project' | 'practice' | 'account' | 'businessUnit'
    > {}

// QUALITATIVE_BENEFITS, AI_ADOPTION_SCORES, COMMON_AI_TOOLS and
// COMMON_ACCELERATORS used to be hardcoded here. They now come from the AIMI
// lookup tables via shared/lookups/useAimiOptionLists (AIMI_QUALITATIVE_BENEFIT,
// AIMI_AI_ADOPTION_SCORE, AIMI_AI_TOOL, AIMI_ACCELERATOR).

// APPLICABILITY_OPTIONS, BENEFIT_TO_OPTIONS, REVENUE_GENERATED_OPTIONS and
// CLIENT_APPROVED_OPTIONS are small, effectively-fixed option lists that don't
// need to be dynamic. AIMI_APPLICABILITY/AIMI_BENEFIT_TO tables still exist
// (Release 2.6.3.sql) if these ever need an API later, but no stored proc or
// endpoint reads them today - these stay hardcoded like the other two.
export const APPLICABILITY_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Activity NA', label: 'Activity NA' },
  { value: 'Customer NA', label: 'Customer NA' },
];

export const BENEFIT_TO_OPTIONS = [
  { value: 'Neurealm', label: 'Neurealm' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Both', label: 'Both' },
];

export const REVENUE_GENERATED_OPTIONS = [
  { value: 'No', label: 'No' },
  { value: 'Yes', label: 'Yes' },
];

export const CLIENT_APPROVED_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];


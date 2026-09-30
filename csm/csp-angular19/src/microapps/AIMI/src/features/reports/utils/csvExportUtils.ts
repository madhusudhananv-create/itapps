import type { ActivityData } from '@activities/types/activityTypes';
import type { EnrichedActivityWithProjectInfo } from './activityEnrichmentUtils';

// Common interface for project information
interface ProjectInfo {
  businessUnit: string;
  businessHead: string;
  account: string;
  accountManager: string;
  project: string;
  projectId: string;
  practice: string;
  manager: string;
  currentPhase: string;
  headcount?: number;
  peopleUsingAI?: number;
  overallScoreValue?: string | number;
}

// Common CSV headers
const CSV_HEADERS = [
  'Business Unit',
  'Business Head',
  'Account',
  'Account Manager',
  'Project',
  'Project ID',
  'Manager',
  'Head Count',
  'Practice',
  '# of People Using AI',
  'License Count',
  'License Provider',
  '% Tickets Auto-Resolved by AI',
  'MTTR Reduction vs Traditional Model',
  '# AI Agents in Production (Not Pilots)',
  '# End-to-End Workflows Re-imagined and Automated',
  '# MTTD (Mean Time to Detect)',
  '# MTTR (Mean Time to Respond or Repair)',
  'Delivery cycle-time reduction attributable to AI',
  '# AI agents in production (not pilots / POC)',
  'Contract Test case Pass Rate (%) (Passed Tests / Total Executed Tests) × 100',
  'Performance Defects Detected Pre-release (%)',
  '% workforce with externally validated AI / GenAI / Agentic AI certification',
  'Efforts saved in hours',
  '# FDE ( Forward Deployment Engineer) penetration as % of client-facing headcount',
  'Overall Score',
  'Accepted Score',
  'Accepted Comment',
  'SDLC Phase',
  'Activity',
  'Applicability',
  'AI Adoption Score',
  'AI Tools Used',
  'Client Approved',
  'Accelerators Used',
  'Work Done by AI (%)',
  'Hours Saved',
  'Revenue Generated',
  'Benefit To',
  'Qualitative Benefits',
  'Comments',
  'Created Date',
  'Last Updated Date',
] as const;

/**
 * Convert array or string to CSV-safe string
 */
const escapeCSVValue = (
  value: string | string[] | number | Date | null | undefined
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  let stringValue: string;

  if (Array.isArray(value)) {
    // Filter out empty values and join with commas
    const filteredValues = value.filter((item) => item && item.trim() !== '');
    stringValue = filteredValues.join(', ');
  } else if (value instanceof Date) {
    stringValue = value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  } else {
    stringValue = String(value);
  }

  // Always wrap in quotes for consistency and to handle commas in array values
  return `"${stringValue.replace(/"/g, '""')}"`;
};

/**
 * Generate CSV content from headers and rows
 */
const generateCSVContent = (
  headers: readonly string[],
  rows: string[][]
): string => {
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

/**
 * Validate activities array
 */
const validateActivities = (activities: unknown[]): void => {
  if (activities.length === 0) {
    throw new Error('No activities to export');
  }
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Create CSV row from activity data
 */
const createCSVRow = (
  activity: ActivityData,
  projectData?: {
    businessUnit?: string;
    businessHead?: string;
    account?: string;
    accountManager?: string;
    project?: string;
    projectId?: string;
    manager?: string;
    headcount?: number;
    practice?: string;
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
    overallScoreValue?: string | number;
    acceptedScore?: number;
    acceptedScoreComment?: string;
      
  }
): string[] => [
  escapeCSVValue(projectData?.businessUnit),
  escapeCSVValue(projectData?.businessHead),
  escapeCSVValue(projectData?.account),
  escapeCSVValue(projectData?.accountManager),
  escapeCSVValue(projectData?.project),
  escapeCSVValue(projectData?.projectId),
  escapeCSVValue(projectData?.manager),
  escapeCSVValue(projectData?.headcount),
  escapeCSVValue(projectData?.practice),
  escapeCSVValue(projectData?.peopleUsingAI),
  //escapeCSVValue(projectData?.currentPhase),
  escapeCSVValue(projectData?.licenseCount),
  escapeCSVValue(projectData?.licenseProvider),
  escapeCSVValue(projectData?.runOpsAutoResolved),
  escapeCSVValue(projectData?.runOpsMTTRReduction),
  escapeCSVValue(projectData?.runOpsAIAgents),
  escapeCSVValue(projectData?.runOpsAutomatedWorkflows),
  escapeCSVValue(projectData?.runOpsMTTD),
  escapeCSVValue(projectData?.runOpsMTTR),
  escapeCSVValue(projectData?.engineerAIAgents),
  escapeCSVValue(projectData?.engineerDeliveryCycleTime),
  escapeCSVValue(projectData?.engineerContractTestCasePassRate),
  escapeCSVValue(projectData?.engineerPerformanceDefectsPreRelease),
  escapeCSVValue(projectData?.commonAdoptionWorkforceCertification),
  escapeCSVValue(projectData?.commonAdoptionEffortsSaved),
  escapeCSVValue(projectData?.commonDeploymentEngineer),
  escapeCSVValue(projectData?.overallScoreValue),
  escapeCSVValue(projectData?.acceptedScore),
  escapeCSVValue(projectData?.acceptedScoreComment),
  escapeCSVValue(activity.sdlcPhase),
  escapeCSVValue(activity.activity),
  escapeCSVValue(activity.applicability),
  escapeCSVValue(activity.aiAdoptionScore),
  escapeCSVValue(activity.aiToolUsed),
  //escapeCSVValue(activity.clientApproved),
  escapeCSVValue(activity.acceleratorsUsed),
  escapeCSVValue(activity.workDoneByAI),
  escapeCSVValue(activity.hoursSaved),
  escapeCSVValue(activity.revenueGenerated),
  escapeCSVValue(activity.benefitTo),
  escapeCSVValue(activity.qualitativeBenefits),
  escapeCSVValue(activity.comments),
  escapeCSVValue(activity.createdAt),
  escapeCSVValue(activity.updatedAt),
];

/**
 * Generate CSV content for activities with optional project info
 */
export const generateActivitiesCSV = (
  activities: ActivityData[],
  projectInfo?: ProjectInfo
): string => {
  const rows = activities.map((activity) =>
    createCSVRow(activity, projectInfo)
  );
  return generateCSVContent(CSV_HEADERS, rows);
};

/**
 * Generate CSV content for multiple activities with project info
 */
export const generateMultiActivitiesCSV = (
  activities: EnrichedActivityWithProjectInfo[]
): string => {
  const rows = activities.map((activity) => createCSVRow(activity, activity));
  return generateCSVContent(CSV_HEADERS, rows);
};

/**
 * Generate and download activities report
 */
export const generateAndDownloadReport = (
  activities: ActivityData[],
  projectInfo?: ProjectInfo
): void => {
  validateActivities(activities);

  const csvContent = generateActivitiesCSV(activities, projectInfo);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const projectName = projectInfo?.project ?? 'Unknown';
  const practiceName = projectInfo?.practice ?? 'Unknown';
  const filename = `AI_Maturity_Report_${projectName}_${practiceName}_${timestamp}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Generate and download multi-activities report
 */
export const generateAndDownloadMultiReport = (
  activities: EnrichedActivityWithProjectInfo[],
  reportType: 'business-units' | 'accounts' | 'projects'
): void => {
  validateActivities(activities);

  const csvContent = generateMultiActivitiesCSV(activities);

  // Generate generic filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `AI_Maturity_Report_${reportType}_${timestamp}.csv`;

  downloadCSV(csvContent, filename);
};

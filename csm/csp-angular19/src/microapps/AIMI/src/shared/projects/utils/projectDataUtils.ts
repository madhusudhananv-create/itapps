import type { ProjectData } from '@shared/projects/types/projectDataSchema';
import { PROJECT_DATA_FIELDS } from '@shared/projects/types/projectDataSchema';

export const validateProjectData = (data: ProjectData): boolean => {
  return !!(
    data.customerName &&
    data.projectName &&
    data.startDate &&
    data.endDate &&
    data.projectId
  );
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

export const getUniqueValues = (
  projects: ProjectData[],
  field: keyof ProjectData
): string[] => {
  const values = projects.map((project) => project[field] as string);
  return [...new Set(values)].filter(Boolean).sort();
};

const getString = (val: unknown, fallback = ''): string =>
  typeof val === 'string' ? val : fallback;

const getNumber = (val: unknown, fallback = 0): number =>
  typeof val === 'number' ? val : fallback;

export const mapApiResponseToProjectData = (
  apiResponseItem: Record<string, unknown>
): ProjectData => {
  return {
    customerName: getString(apiResponseItem[PROJECT_DATA_FIELDS.CUST_NM]),
    projectName: getString(apiResponseItem[PROJECT_DATA_FIELDS.PROJ_NM]),
    startDate: getString(apiResponseItem[PROJECT_DATA_FIELDS.START_DATE]),
    endDate: getString(apiResponseItem[PROJECT_DATA_FIELDS.END_DATE]),
    headcount: getNumber(apiResponseItem[PROJECT_DATA_FIELDS.HEADCOUNT]),
    projectStatus: getString(apiResponseItem[PROJECT_DATA_FIELDS.PROJ_STATUS]),
    projectType: getString(apiResponseItem[PROJECT_DATA_FIELDS.PROJECT_TYPE]),
    businessUnit: getString(apiResponseItem[PROJECT_DATA_FIELDS.BUSINESS_UNIT]),
    department: getString(apiResponseItem[PROJECT_DATA_FIELDS.DEPARTMENT]),
    projectGroup: getString(apiResponseItem[PROJECT_DATA_FIELDS.PROJECT_GROUP]),
    contractingUnit: getString(
      apiResponseItem[PROJECT_DATA_FIELDS.CONTRACTING_UNIT]
    ),
    revenueType: getString(apiResponseItem[PROJECT_DATA_FIELDS.REVENUE_TYPE]),
    country: getString(apiResponseItem[PROJECT_DATA_FIELDS.COUNTRY]),
    methodology: getString(apiResponseItem[PROJECT_DATA_FIELDS.METHODOLOGY]),
    status: getString(apiResponseItem[PROJECT_DATA_FIELDS.STATUS]),
    accountOwner: getString(apiResponseItem[PROJECT_DATA_FIELDS.ACCOUNT_OWNER]),
    spoc: getString(apiResponseItem[PROJECT_DATA_FIELDS.SPOC]),
    pm: getString(apiResponseItem[PROJECT_DATA_FIELDS.PM]),
    pmMailId: getString(apiResponseItem[PROJECT_DATA_FIELDS.PM_MAIL_ID]),
    accountManager: getString(
      apiResponseItem[PROJECT_DATA_FIELDS.ACCOUNT_MANAGER]
    ),
    amMailId: getString(apiResponseItem[PROJECT_DATA_FIELDS.AM_MAIL_ID]),
    csm: getString(apiResponseItem[PROJECT_DATA_FIELDS.CSM]),
    csmMailId: getString(apiResponseItem[PROJECT_DATA_FIELDS.CSM_MAIL_ID]),
    buHead: getString(apiResponseItem[PROJECT_DATA_FIELDS.BU_HEAD]),
    buMailId: getString(apiResponseItem[PROJECT_DATA_FIELDS.BU_MAIL_ID]),
    csmReviewerMailId: getString(
      apiResponseItem[PROJECT_DATA_FIELDS.CSM_REVIEWER_MAIL_ID]
    ),
    lastAuditedOn: getString(
      apiResponseItem[PROJECT_DATA_FIELDS.LAST_AUDITED_ON]
    ),
    projectConfiguration: getString(
      apiResponseItem[PROJECT_DATA_FIELDS.PROJECT_CONFIGURATION]
    ),
    isoStandards: getString(apiResponseItem[PROJECT_DATA_FIELDS.ISO_STANDARDS]),
    certificationScopes: getString(
      apiResponseItem[PROJECT_DATA_FIELDS.CERTIFICATION_SCOPES]
    ),
    serviceTowers: getString(
      apiResponseItem[PROJECT_DATA_FIELDS.SERVICE_TOWERS]
    ),
    projectId: getString(apiResponseItem[PROJECT_DATA_FIELDS.PROJ_ID]),
  };
};

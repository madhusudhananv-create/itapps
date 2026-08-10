export const PROJECT_DATA_FIELDS = {
  CUST_NM: 'cust_nm',
  PROJ_NM: 'proj_nm',
  START_DATE: 'start_date',
  END_DATE: 'end_date',
  HEADCOUNT: 'HeadCount',
  PROJ_STATUS: 'proj_status',
  PROJECT_TYPE: 'project_type',
  BUSINESS_UNIT: 'BUSINESS_UNIT',
  DEPARTMENT: 'DEPARTMENT',
  PROJECT_GROUP: 'PROJECT_GROUP',
  CONTRACTING_UNIT: 'CONTRACTING_UNIT',
  REVENUE_TYPE: 'REVENUE_TYPE',
  COUNTRY: 'COUNTRY',
  METHODOLOGY: 'METHODOLOGY',
  STATUS: 'status',
  ACCOUNT_OWNER: 'Account_Owner',
  SPOC: 'SPOC',
  PM: 'PM',
  PM_MAIL_ID: 'PM Mail ID',
  ACCOUNT_MANAGER: 'Account_Manager',
  AM_MAIL_ID: 'AM Mail ID',
  CSM: 'CSM',
  CSM_MAIL_ID: 'CSM Mail ID',
  BU_HEAD: 'BU Head',
  BU_MAIL_ID: 'BU Mail ID',
  CSM_REVIEWER_MAIL_ID: 'CSM Reviewer mail ID',
  LAST_AUDITED_ON: 'Last Audited On',
  PROJECT_CONFIGURATION: 'Project_Configuration',
  ISO_STANDARDS: 'ISO_STANDARDS',
  CERTIFICATION_SCOPES: 'CERTIFICATION_SCOPES',
  SERVICE_TOWERS: 'Service Towers',
  PROJ_ID: 'proj_id',
} as const;

export type ProjectDataField = keyof typeof PROJECT_DATA_FIELDS;
export type ProjectDataFieldValue =
  (typeof PROJECT_DATA_FIELDS)[ProjectDataField];

export interface ProjectData {
  customerName: string;
  projectName: string;
  startDate?: string;
  endDate?: string;
  headcount?: number;
  projectStatus?: string;
  projectType?: string;
  businessUnit: string;
  department: string;
  projectGroup?: string;
  contractingUnit?: string;
  revenueType?: string;
  country?: string;
  methodology?: string;
  status?: string;
  accountOwner?: string;
  spoc?: string;
  pm: string;
  pmMailId?: string;
  accountManager?: string;
  amMailId?: string;
  csm?: string;
  csmMailId?: string;
  buHead?: string;
  buMailId?: string;
  csmReviewerMailId?: string;
  lastAuditedOn?: string;
  projectConfiguration?: string;
  isoStandards?: string;
  certificationScopes?: string;
  serviceTowers?: string;
  projectId: string;
}

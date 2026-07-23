export interface EmpInfoModel {
  emP_ID?: string;
  frsT_NM: string;
  middlE_NM?: string;
  lasT_NM?: string;
  emaiL_ID?: string;
  title?: string;
  emP_CSP_ROLE?: string;
  csM_TITLE_ID?: number;
  projecT_ID?: string;
  empid?: string;
  isselected?: boolean;
}

export interface EmpInfoDetailedModel {
  emP_ID: string;
  basE_CNTRY_ID: number;
  manageR_EMP_ID: string;
  revieweR_EMP_ID: string;
  empL_TYPE: string; // "Contractor" | "Employee"
  frsT_NM: string;
  middlE_NM: string;
  lasT_NM: string;
  gender: string; // "M" | "F"
  dob: Date;
  doj: Date;
  dor: Date;
  level: string;
  title: string;
  csM_TITLE_ID: number;
  experience: string;
  emaiL_ID: string;
  mobilE_NBR: string;
}

export interface ProjectResourceByEmpIdModel {
  id?: number;
  frsT_NM: string;
  lasT_NM: string;
  emP_ID: string;
  emP_EMAIL: string;
  emP_PHONE: string;
  projecT_ID: string;
  projrolE_ID: string;
  projrolE_NM: string;
}

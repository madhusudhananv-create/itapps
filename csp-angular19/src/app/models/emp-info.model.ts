/**
 * Employee Information Model
 * Used for employee basic information
 */
export class EmpInfoModel {
  emP_ID?: string;
  frsT_NM: string = '';
  middlE_NM: string = '';
  lasT_NM: string = '';
  emaiL_ID: string = '';
  title: string = '';
  emP_CSP_ROLE: string = '';
  csM_TITLE_ID: number = 0;
  projecT_ID: string = '';
  empid: string = '';
  isselected: boolean = false;
}

/**
 * Employee Information Detailed Model
 * Used for detailed employee information
 */
export class EmpInfoDetailedModel {
  emP_ID: string = '';
  basE_CNTRY_ID: number = 1;
  manageR_EMP_ID: string = "100365";
  revieweR_EMP_ID: string = "100365";
  empL_TYPE: string = "Employee"; //Contractor;Employee
  frsT_NM: string = "";
  middlE_NM: string = "";
  lasT_NM: string = "";
  gender: string = ""; //M
  dob: Date = new Date();
  doj: Date = new Date();
  dor: Date = new Date();
  level: string = "T1";
  title: string = "Engineer";
  csM_TITLE_ID: number = 3;
  experience: string = "1";
  emaiL_ID: string = "";
  mobilE_NBR: string = "";
  potentiaL_TO_BILL: boolean = false;
  unbilL_CLASSIFY: string = "";
  emP_ROLE: string = "";
  emP_BAS_ROLE: string = "";
  emP_CSP_ROLE: string = "";
  appraisaL_RATING: string = "";
  promotioN_INFO: string = "";
  createD_BY: string = localStorage.getItem("empid") || '';
  createD_DATE: Date = new Date();
  updateD_BY: string = localStorage.getItem("empid") || '';
  updateD_DATE: Date = new Date();
  superadmin: boolean = false; //0 
}

/**
 * Project Resource By Employee ID Model
 * Used for displaying project resource information by employee
 */
export class ProjectResourceByEmpIdModel {
  id: number = 0;
  frsT_NM: string = '';
  emP_ID: string = '';
  cusT_NM: string = '';
  cusT_ID: string = '';
  proJ_NM: string = '';
  proJ_ID: string = '';
  bilL_FLG: boolean = false;
  curR_INDC: boolean = false;
  starT_DATE: Date = new Date();
  enD_DATE: Date = new Date();
  proJ_RESRC_ID: number = 0;
}

/**
 * Project Resource Model
 * Used for adding/updating project resources
 */
export class ProjectResourceModel {
  proJ_ID: string = '';
  emP_ID: string = '';
  bilL_FLG: boolean = false;
  allcT_PCT: number = 0;
  curR_INDC: string = '';
  createD_BY: string = '';
  starT_DATE: Date = new Date();
  enD_DATE: Date = new Date();
}

/**
 * Project Resource Extended Model
 * Extends ProjectResourceByEmpIdModel with customer ID
 */
export class ProjResourceExtended extends ProjectResourceByEmpIdModel {
  override cusT_ID: string = '';
}

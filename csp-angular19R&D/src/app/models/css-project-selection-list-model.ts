export interface CssProjectSelectionListModel {
  cusT_ID: string;
  proJ_ID: string;
  cusT_NM: string;
  proJ_NM: string;
  proJ_STATUS: string;
  dP_ID: string;
  reason: string;
  defaulT_REASON: string;
  predicteD_SCORE: number;
  predicteD_REASON: string;
  respondenT_MAIL: string;
  contacT_ROLE: string;
  csaT_SPOC: string;
  csaT_SPOC_EMAIL: string;
  accounT_IN_PCSAT: string;
  projecT_IN_PCSAT: string;
  accounT_HEAD_COUNT: number;
  projecT_HEAD_COUNT: number;
  executioN_TYPE: string;
  engagamenT_TYPE: string;
  qualitY_SPOC?: string;
  proJ_PM_EMP_ID?: string;
  CREATED_BY: string;
  CREATED_DATE: Date;
  UPDATED_BY: string;
  UPDATED_DATE: Date;
  ISACTIVE: boolean;
  iS_SELECTED: boolean;
}

/**
 * CSAT Presurvey Connect Model
 */
export class CssPresurveyConnectModel {
  csS_BATCH_CUSTOMER_ID: number = 0;
  actuaL_DATE: Date | null = null;
  planneD_DATE: Date | null = null;
  status: string = 'To Be Planned';
  remarks: string = '';
  createD_BY?: string;
  createD_DATE?: Date;
  updateD_BY?: string;
  updateD_DATE?: Date;
  isactive?: boolean;
  updateD_BY_NAME: string = '';
}

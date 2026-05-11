/**
 * Finding Model
 * Used for QA assessment details filtering and search
 */
export class FindingModel {
  cusT_ID: string = '';
  starT_DATE: string | null = null;
  enD_DATE: string | null = null;
  proJ_ID: string | undefined;  // Can be string or undefined, matching legacy behavior
  assessmenT_ID: number = 0;
  iS_FROM_DASHBOARD: boolean = false;
}

/**
 * Finding By Type Model
 * Groups findings by their type (Strength, Weakness, Opportunity, Threat, etc.)
 */
export class FindingByType {
  findinG_TYPE: string;
  findings: FindingDetails[];

  constructor(type: string) {
    this.findinG_TYPE = type;
    this.findings = [];
  }
}

/**
 * Finding Details Model
 * Individual finding/assessment record
 */
export class FindingDetails {
  id: number = 0;
  findinG_TYPE: string = '';
  findinG_DESCRIPTION: string = '';
  stagE_DESCRIPTION: string = '';
  stagE_STATUS: string = '';
  customeR_ID: string = '';
  projecT_ID: string = '';
  cusT_NM: string = '';
  proJ_NM: string = '';
  portfoliO_ID: number = 0;
  portfoliO_NAME: string = '';
  createD_DATE: Date = new Date();
  updateD_DATE: Date = new Date();
  targeT_DATE: Date = new Date();
  responsible: string = '';
  url: string = '';
  agE_OF_FINDING: string = '';
  agE_OF_FINDING_IN_DAYS: string = '';
  statuS_DATE: Date = new Date();
  assessmenT_ID: number = 0;
}

/**
 * Customer Model
 * Migrated from Angular 6 to Angular 19
 * 
 * Represents customer/client information in the CSM system
 */

export interface CustomerModel {
  cusT_ID: string;
  cusT_NM: string;
  industrY_TYPE: string;
  url: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
}

export interface ResourcesSummary {
  status: string;
  count: number;
}

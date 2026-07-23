/**
 * Customer Model
 * Migrated from legacy customer-model.ts
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
  iS_SLA_AVAILABLE?: boolean;
}

/**
 * Resources Summary Model
 * Used for resource status counts
 */
export interface ResourcesSummary {
  status: string;
  count: number;
}

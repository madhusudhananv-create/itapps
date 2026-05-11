/**
 * Action Item Models
 * Migrated from LEGACY-SOURCE/src/app/models/actionitem-model.ts
 */

export class ActionitemModel {
  id?: number;
  projecT_ID?: string;
  rag?: string;
  description?: string;
  source?: string;
  owner?: string;
  priority?: string;
  identifieD_DATE?: Date | null;
  targeT_DATE?: Date | null;
  status?: string;
  completioN_DATE?: Date | null;
  comments?: string;
  createD_BY?: string;
  createD_DATE?: Date | null;
  updateD_BY?: string;
  updateD_DATE?: Date | null;
  isactive?: boolean;
}

export class ActionitemModelNew {
  cusT_ID?: string;
  proJ_ID?: string;
  proJ_NM?: string;
  portfoliO_ID?: number;
  portfoliO_NAME?: string;
  actioN_ITEM_ID?: number;
  rag?: string;
  description?: string;
  source?: string;
  sourcE_DESCRIPTION?: string;
  originaL_DESCRIPTION?: string;
  owner?: string;
  identifieD_DATE?: Date | null;
  targeT_DATE?: Date | null;
  status?: string;
  priority?: string;
  completioN_DATE?: Date | null;
  comments?: string;
  createD_BY?: string;
  createD_DATE?: Date | null;
  updateD_BY?: string;
  updateD_DATE?: Date | null;
  isactive?: boolean;
  statuS_TYPE?: string;
  batcH_CUSTOMER_ID?: number;
  batcH_CUSTOMER_MONTHLY_ID?: number;
  risk_id?: number;
  customeR_ID?: string;
  id?: number;
  planneD_TARGET_DATE?: Date | null;
  planneD_ACTUAL_DATE?: Date | null;
  rooT_CAUSE?: string;
  customeR_REMARKS?: string;
  score?: number;
  preventivE_ACTION_PLAN?: string;
  csS_REFERENCE?: string;
  perspective?: string;
  actuaL_PLAN_DECLARATION?: boolean;
  actuaL_CUST_DATE?: Date | null;
  planneD_DECLARATION?: boolean;
  planneD_CUST_DATE?: Date | null;
  closurE_ACKNOWLEDGE?: boolean;
  closurE_ACTUAL_CUST_DATE?: Date | null;
}

/**
 * CI Tracker Models
 * Used for Continual Improvement Leaderboard data structures
 * Migrated from legacy ci_tracker.ts
 */

export class CITrackerModel {
  cusT_ID?: string;
  cusT_NM?: string;
  cI_CUST_PROPERTIES?: CI_CUST_PROPERTIES;
}

export class CI_CUST_PROPERTIES {
  cusT_ID?: string;
  cusT_NM?: string;
  completed?: number;
  inprogress?: number;
  qualitY_REDUCTION_OF_ERRORS?: number;
  reductioN_IN_LEAD_TIME?: number;
  reductioN_IN_CYCLE_TIME?: number;
  savinG_PER_YEAR_EFFORT?: number;
  savingS_IN_USD?: number;
  harD_BENEFITS?: number;
  sofT_BENEFITS?: string;
  revenue?: number;
  operatinG_COST?: number;
  profitability?: number;
  cI_CUST_PROPERTIES?: any;
  totaL_BEFORE_ERROR?: number;
  totaL_AFTER_ERROR?: number;
  automatioN_INDEX?: number;
  totalIdeas?: number;
  totalideas?: number; // Alternative property name used in template
  neT_BENEFITS?: number;
}

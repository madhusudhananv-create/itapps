/**
 * Innovation Model
 * Migrated from LEGACY-SOURCE/src/app/models/innovation-model.ts
 * Preserves all original field names exactly.
 */

export class InnovationModel {
  id: number = 0;
  projecT_ID: string = '';
  rag: string = '';
  identifieD_DATE: Date | null = null;
  description: string = '';
  status: string = '';
  targeT_DATE: Date | null = null;
  actuaL_DATE: Date | null = null;
  responsible: string = '';
  area: string = '';
  beforE_ERROR: string = '';
  beforE_CYCLE_TIME: string = '';
  beforE_LEAD_TIME: number | null = null;
  afteR_LEAD_TIME: number | null = null;
  beforE_EFFORT: string = '';
  afteR_ERROR: string = '';
  afteR_CYCLE_TIME: string = '';
  afteR_EFFORT: string = '';
  customeR_SAVINGS: string = '';
  customeR_PERSONHOUR_SAVINGS: number | null = null;
  financiaL_REVENUE: string = '';
  financiaL_OPERATING_COST: string = '';
  financiaL_PROFITABILITY: string = '';
  automate: boolean = false;
  tooL_USED: string = '';
  referencE_IDEA_ID: number | null = null;
  isinnovation: boolean = false;
  isprocessimprovement: boolean = false;
  innovatioN_DESCRIPTION: string = '';
  procesS_IMPROVEMENT_DESCRIPTION: string = '';
  comments: string = '';
  createD_BY: string = '';
  createD_DATE: Date | null = null;
  updateD_BY: string = '';
  updateD_DATE: Date | null = null;
  isactive: boolean = true;
  approach: string = '';
  beforE_CASES_COUNT: number | null = null;
  afteR_CASES_COUNT: number | null = null;
  afteR_FTECOST_HOUR: number | null = null;
  beforE_FTECOST_HOUR: number | null = null;
  afteR_FTECOST_MONTH: number | null = null;
  beforE_FTECOST_MONTH: number | null = null;
  beforE_FTESPENT_MONTH: number | null = null;
  afteR_FTESPENT_MONTH: number | null = null;
  afteR_COST: string = '';
  beforE_COST: string = '';
  internaL_SAVINGS: string = '';
  customeR_BUSINESS_VALUE: string = '';
  beforE_OCCOURANCE_COUNT: number | null = null;
  afteR_OCCOURANCE_COUNT: number | null = null;
  gavS_SERVICE: GAVSService[] = [];
  qualitY_REDUCTION_OF_ERRORS: number | null = null;
  reductioN_IN_LEAD_TIME: number | null = null;
  reductioN_IN_CYCLE_TIME: number | null = null;
  reductioN_IN_LEAD_TIME_DATA: string = '';
  reductioN_IN_CYCLE_TIME_DATA: string = '';
  savinG_PER_YEAR_EFFORT: number | null = null;
  automatioN_INDEX: number | null = null;
  savingS_IN_USD: number | null = null;
  harD_BENEFITS: number | null = null;
  revenue: number | null = null;
  operatinG_COST: number | null = null;
  profitability: number | null = null;
  iS_ONETIME: boolean = false;

  beforE_CYCLE_TIME_UOM: number = 1;
  beforE_LEAD_TIME_UOM: number = 1;
  beforE_TIME_TAKEN_UOM: number = 1;

  afteR_CYCLE_TIME_UOM: number = 1;
  afteR_LEAD_TIME_UOM: number = 1;
  afteR_TIME_TAKEN_UOM: number = 1;

  beforE_TIME_TAKEN: number | null = null;
  afteR_TIME_TAKEN: number | null = null;
}

export class GAVSService {
  servicE_ID: number = 0;
  iS_CHECKED: boolean = false;
}

export class InnovationModelExt extends InnovationModel {
  cusT_ID: string = '';
  cusT_NM: string = '';
  portfoliO_ID: number = 0;
  portfoliO_NM: string = '';
  proJ_NM: string = '';
}

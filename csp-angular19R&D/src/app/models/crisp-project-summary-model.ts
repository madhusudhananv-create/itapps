/**
 * CRISP Project Summary Model
 * Used for displaying CRISP scores and validation details
 */

export interface CrispProjectSummaryModel {
  projecT_ID: string;
  projecT_NAME: string;
  score: number;
  categories: CrispCategoryScoreModel[];
  validations: CrispValidationModel[];
}

export interface CrispCategoryScoreModel {
  categorY_ID: number;
  categorY_NAME: string;
  score: number;
}

export interface CrispValidationModel {
  categorY_NAME: string;
  criteriA_ID: number;
  criteriA_NAME: string;
  validatioN_NAME: string;
  eligible: number;
  score: number;
}

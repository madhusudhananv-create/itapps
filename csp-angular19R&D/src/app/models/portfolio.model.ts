/**
 * Portfolio Models
 * Migrated from legacy: src/app/models/portfolio-model.ts
 */

/**
 * Portfolio Model
 */
export interface PortfolioModel {
  id: number;
  title: string;
  contacT_NAME: string;
  contacT_EMAILID: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
  crispGraphData?: any[];
}

/**
 * Portfolios Model (for creation/updates)
 */
export interface PortfoliosModel {
  id: number;
  title: string;
  comments: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Portfolio Owners Model
 */
export interface PortfoliosOwnersModel {
  id: number;
  portfoliO_ID: number;
  owneR_NAME: string;
  owneR_EMAILID: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Portfolio Owners Project Model
 */
export interface PortfoliosOwnersProjectModel {
  id: number;
  portfoliO_OWNER_ID: number;
  cusT_ID: string;
  proJ_ID: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Project Model (new format for portfolio-project mapping)
 */
export interface ProjectModelNew {
  portfolio_id: number;
  proj_id: string;
  proj_nm: string;
}

/**
 * Product Model (new format)
 */
export interface ProductModelNew {
  id: number;
  portfoliO_ID: number;
  producT_TITLE: string;
  servicE_AREA_TYPE_ID: number;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

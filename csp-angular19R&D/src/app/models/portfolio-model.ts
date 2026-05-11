/**
 * Portfolio Models
 * Migrated from Angular 6 to Angular 19
 * 
 * Models for portfolio management including projects and products
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

export class PortfoliosModel {
  id!: number;
  title!: string;
  comments!: string;
  createD_BY: string = localStorage.getItem("empid") || '';
  createD_DATE: Date = new Date();
  updateD_BY: string = localStorage.getItem("empid") || '';
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
}

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

export interface ProjectModelNew {
  portfolio_id: number;
  proj_id: string;
  proj_nm: string;
}

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

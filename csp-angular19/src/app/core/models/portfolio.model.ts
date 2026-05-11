export interface PortfolioModel {
  id: number;
  title: string;
  cusT_ID?: string;
}

export class ProjectModelNew {
  proj_id: string = '';
  proj_nm: string = '';
  portfolio_id?: number;
  cusT_ID?: string;
}

export interface ProductModelNew {
  id: string;
  producT_TITLE: string;
  portfoliO_ID: number;
  cusT_ID?: string;
}

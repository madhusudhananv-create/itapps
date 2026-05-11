/**
 * Highlights Model
 * Migrated from Angular 6 to Angular 19
 * 
 * Represents project/customer highlights and key updates
 */

export interface HighlightsModel {
  id: number;
  customeR_ID: string;
  projecT_ID: string;
  rag: string;
  category: string;
  description: string;
  publisH_DATE: Date;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
  portfoliO_ID?: number;
  servicE_AREA?: string;
  week?: any;
}

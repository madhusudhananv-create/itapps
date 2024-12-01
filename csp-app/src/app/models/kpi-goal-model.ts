export class KpiGoalModel {
    id: number;
    customeR_ID: string;
    projecT_ID: string;
    description: string;
    displaY_ORDER: number;
    starT_DATE: Date;
    enD_DATE: Date;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: Boolean;
    isinternal: Boolean;
    isExpired: boolean;
}

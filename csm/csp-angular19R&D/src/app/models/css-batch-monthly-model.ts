export class CssBatchMonthlyModel {
    id!: number;    
    month?: number;
    year?: number;
    starT_DATE!: Date;
    enD_DATE!: Date;
    status!: string;
    createD_BY?: string;
    createD_DATE?: Date;
    updateD_BY?: string;
    updateD_DATE?: Date;
    isactive?: boolean;
    totaL_RECORDS?: number;
    pending?: number;
    verified?: number;
    rejected?: number;
    surveY_SENT?: number;
    surveY_RECD?: number;
}

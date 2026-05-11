/**
 * Best Practices Model
 * Migrated from LEGACY-SOURCE/src/app/models/best-practices-model.ts
 * 
 * Represents a best practice entry in the CSM system
 */

export class BestPracticesModel {
    id: number = 0;
    referencE_BEST_PRACTICE_ID: number = 0;
    projecT_ID: string = '';
    description: string = '';
    reporteD_BY: string = '';
    reporteD_DATE: Date | null = null;
    revieweD_BY: string = '';
    revieweD_BY_empID: string = '';
    revieweD_DATE: Date | null = null;
    approveD_BY: string = '';
    approveD_BY_empID: string = '';
    approveD_DATE: Date | null = null;
    servicE_AREA_ID: string = '';
    servicE_AREA: string = '';
    procesS_AREA_ID: string = '';
    procesS_AREA: string = '';
    procesS_ID: string = '';
    process: string = '';
    status: string = '';
    targeT_DATE: Date | null = null;
    actuaL_DATE: Date | null = null;
    remarks: string = '';
    applicablE_FOR: string = '';
    noT_APPLICABLE_FOR: string = '';
    createD_BY: string = '';
    createD_DATE: Date | null = null;
    updateD_BY: string = '';
    updateD_DATE: Date | null = null;
    isactive: boolean = true;
    gavS_SERVICE: GAVSService[] = [];
}

export class GAVSService {
    servicE_ID: number = 0;
    iS_CHECKED: boolean = false;
}

export class BestPracticesModelExt extends BestPracticesModel {
    cusT_ID: string = '';
    cusT_NM: string = '';
    portfoliO_ID: number = 0;
    portfoliO_NM: string = '';
    proJ_NM: string = '';
}

export class BestPracticesModel {
    id: number;
    referencE_BEST_PRACTICE_ID:number;
	projecT_ID:string;
	description:string;
    reporteD_BY:string;
    reporteD_DATE:Date;
    revieweD_BY:string;
    revieweD_BY_empID:string;
    revieweD_DATE:Date;
    approveD_BY:string;
    approveD_BY_empID:string;
    approveD_DATE:Date; 
    servicE_AREA_ID:string;    
    servicE_AREA:string;    
    procesS_AREA_ID:string;    
    procesS_AREA:string;
    procesS_ID:string;
    process:string;
    status:string;
    targeT_DATE:Date;
    actuaL_DATE:Date;
    remarks:string;
    applicablE_FOR:string;
    noT_APPLICABLE_FOR:string
    createD_BY:string;
    createD_DATE:Date;
    updateD_BY:string;
    updateD_DATE:Date;    
    isactive:boolean;    
    gavS_SERVICE :GAVSService[]=[];
}
export class GAVSService
{
  servicE_ID:number;
  iS_CHECKED:Boolean = false;
}

export class BestPracticesModelExt extends BestPracticesModel{
	cusT_ID:string;
    cusT_NM: string;
    portfoliO_ID: number;
    portfoliO_NM: string;
    proJ_NM: string;
}

export class ProjectServiceAreaProcessMappingModel{
    id:number = 0;
    cusT_ID:string;
    proJ_ID:string;
    servicE_AREA_ID:number;
    procesS_MODEL_ID:number;
    procesS_Area_ID:number;
    procesS_ID:number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    procesS_TAILORING_NOTES : string;
}



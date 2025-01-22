export class ServiceAreaProjectMappingModel {
    id:number;
    cusT_ID:string;
    proJ_ID:string;
    servicE_AREA_ID:number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class ServiceTowersProjectMappingModel {
    id:number;
    title:string;
  retiremenT_DATE: Date;
}


export class ProcessByServiceAreaModel{
    procesS_MODEL_ID:number;
    procesS_MODEL_NAME : string;
    iS_CHECKED : boolean= false;
    isDisabled:boolean= false;
    groupByProcessArea:ProcessByProcessArea[];
}
export class ProcessByProcessArea{
    procesS_AREA_ID : number;
    procesS_AREA_NAME : string;
    bSelected:Boolean;
    isDisabled:boolean= false;
    processess : ServiceAreaProcessModleProcessCollection[]
}
export class ServiceAreaProcessModleProcessCollection{
    procesS_MODEL_ID:number;
    procesS_MODEL_TITLE: string
    procesS_AREA_ID:number;
    procesS_AREA_TITLE: string;
    procesS_ID:number;
    procesS_TITLE: string;
    procesS_DESCRIPTION: string;
    iS_DIRTY: Boolean;
    bSelected:Boolean;
    isDisabled:boolean= false;
    procesS_TAILORING_NOTES : string;
}

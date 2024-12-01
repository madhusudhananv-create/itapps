export class ProcessProjectConfigModel {
    id:number;
    customeR_ID:string;
    projecT_ID:string;
    procesS_MODEL_DESCRIPTION:ProcessModelDescription[] = [];
}

export class ProcessModelDescription {
    modeL_ID:number;
    modeL_NAME:string;
    servicE_AREA:ServiceArea[] = []
}
export class ServiceArea{
    areA_ID:number;
    areA_NAME:string;
    procesS_NAME:ProcessDescription[] =[];
}

export class ProcessDescription
{
    modeL_ID:number;
    procesS_MODEL_DESCRIPTION:string;
    areaA_ID:number;
    procesS_AREA_DESCRIPTION:string;
    descriptioN_ID:number;
    areA_NAME:string;

}




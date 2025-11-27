export class AppAccessControlsModel {
    ID: number;
    RESOURCE_ID: number;
    
    ACCESS_LEVEL: number;
    ROLE_ID: number;
    CUST_ID: string[] = [];
    PROJ_ID: string[] = [];
    EMP_ID: string[] = [];

    VIEW_ACCESS: boolean;
    CREATE_ACCESS: boolean;
    EDIT_ACCESS: boolean;
    DELETE_ACCESS: boolean;

    COMMENTS: string;
    CREATED_BY: string
    CREATED_DATE: Date;
    UPDATED_BY: string;
    UPDATED_DATE: Date;
    ISACTIVE: Boolean;
}
export class AppControlsModel {
    id: number;
    resourcE_ID: number;
    resourcE_TYPE: number;
    resourcE_NAME: number;

    comments: string;
    createD_BY: string
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: Boolean;
}

export class AppControlFeaturesModel {
    id: number;
    resourcE_ID: number;
    feature: number;
    comments: string;
    createD_BY: string
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: Boolean;
}
export class AccessRequestModel {
    id: number;
    resourcE_ID: number;
    proJ_ID: string;
    cusT_ID: string;
    accesS_LEVEL: number;
    status:string
    feature: string;
    approveR_ID: string;
    approvaL_DATE: Date;
    rejecT_REASON: string;
    requesteD_BY: string
    requesteD_DATE: Date;
    createD_BY: string
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: Boolean;
}



export class ProjectsModel {
    cusT_ID: string;
    cusT_NM: string;
    proJ_ID: string;
    proJ_NM: string;
    proC_TYPE: string;
    updateD_DATE: string;
    proJ_ALIAS_NM: string;
    parenT_PROJ_ID: string; //
    starT_DATE: Date = new Date(); //
    enD_DATE: Date = new Date(); //     
    qualitY_SPOC : string;
    bP_SHARE_TO_All:boolean;    
    checked: boolean;
    // starT_DATE:Date = new Date("2018-01-01");
    // enD_DATE:Date = new Date("2020-01-01");
}

export class MigrateProjectsModel {
    cusT_ID: string;
    cusT_NM: string;
    proJ_ID: string;
    proJ_NM: string;
    proC_TYPE: string;
    updateD_DATE: string;
    proJ_ALIAS_NM: string;
    parenT_PROJ_ID: string; //
    starT_DATE: Date = new Date(); //
    enD_DATE: Date = new Date(); //     
    qualitY_SPOC : number;
    bP_SHARE_TO_All:boolean;    
    checked: boolean;
    Proj_Status:string;
}

//
export class AddProjectsModel {

    proJ_ID: string;
    CUST_ADDR_ID: number = 1;
    //bilL_CURRENCY_ID: number = 1;   //BILL_CRNCY_ID 
    bilL_CRNCY_ID: number = 1;
    proJ_NM: string;
    //startDate:Date = new Date("January 1, 2018 00:01:00"); //"2018-01-01" didnt work    
    //startDate:string;
    starT_DATE: Date = new Date("2018-01-01");
    //endDate:Date = new Date("January 1, 2020 00:01:00");
    enD_DATE: Date = new Date("2020-01-01");
    bilL_TYPE: boolean;
    proC_TYPE: string = "Fixed Bid";
    lvL_1_APPR_EMP_ID: string;
    lvL_2_APPR_EMP_ID: string;
    lvL_3_APPR_EMP_ID: string;
    lvL_4_APPR_EMP_ID: string;
    proJ_BUHEAD_EMP_ID: string;
    proJ_DM_EMP_ID: string;
    proJ_PM_EMP_ID: string;
    proJ_AM_EMP_ID: string;
    createD_BY: string;
    createD_DATE: Date = new Date();
    //CREATED_DATE : string; 
    updateD_BY: string;
    updateD_DATE: Date = new Date();
    //updateD_DATE :string;
    depT_ID: number;
    cusT_ID: string;
    bU_ID: number;
    parenT_PROJ_ID: string;
    proJ_ALIAS_NM: string;

    //cusT_NM:string;
    //updateD_DATE:string;


    //


}
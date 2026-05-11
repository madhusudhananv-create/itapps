/**
 * Projects Model
 * Models for project information
 * Migrated from Angular 6 to Angular 19
 */

export class ProjectsModel {
    cusT_ID: string = '';
    cusT_NM: string = '';
    proJ_ID: string = '';
    proJ_NM: string = '';
    proC_TYPE: string = '';
    updateD_DATE: string = '';
    proJ_ALIAS_NM: string = '';
    parenT_PROJ_ID: string = '';
    starT_DATE: Date = new Date();
    enD_DATE: Date = new Date();
    qualitY_SPOC: string = '';
    bP_SHARE_TO_All: boolean = false;
    checked: boolean = false;
}

export class MigrateProjectsModel {
    cusT_ID: string = '';
    cusT_NM: string = '';
    proJ_ID: string = '';
    proJ_NM: string = '';
    proC_TYPE: string = '';
    updateD_DATE: string = '';
    proJ_ALIAS_NM: string = '';
    parenT_PROJ_ID: string = '';
    starT_DATE: Date = new Date();
    enD_DATE: Date = new Date();
    qualitY_SPOC: number = 0;
    bP_SHARE_TO_All: boolean = false;
    checked: boolean = false;
    Proj_Status: string = '';
}

export class AddProjectsModel {
    proJ_ID: string = '';
    CUST_ADDR_ID: number = 1;
    bilL_CRNCY_ID: number = 1;
    proJ_NM: string = '';
    starT_DATE: Date = new Date("2018-01-01");
    enD_DATE: Date = new Date("2020-01-01");
    bilL_TYPE: boolean = false;
    proC_TYPE: string = "Fixed Bid";
}

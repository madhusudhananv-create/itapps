export class ProjectsModel {
    proJ_ID!: string;
    proJ_NM!: string;
}

/**
 * Add Projects Model
 * Used for adding new projects
 * Migrated from legacy projects-model.ts
 */
export class AddProjectsModel {
    proJ_ID: string = '';
    CUST_ADDR_ID: number = 1;
    bilL_CRNCY_ID: number = 1;
    proJ_NM: string = '';
    starT_DATE: Date = new Date("2018-01-01");
    enD_DATE: Date = new Date("2020-01-01");
    bilL_TYPE: boolean = false;
    proC_TYPE: string = "Fixed Bid";
    lvL_1_APPR_EMP_ID: string = '';
    lvL_2_APPR_EMP_ID: string = '';
    lvL_3_APPR_EMP_ID: string = '';
    lvL_4_APPR_EMP_ID: string = '';
    proJ_BUHEAD_EMP_ID: string = '';
    proJ_DM_EMP_ID: string = '';
    proJ_PM_EMP_ID: string = '';
    proJ_AM_EMP_ID: string = '';
    createD_BY: string = '';
    createD_DATE: Date = new Date();
    updateD_BY: string = '';
    updateD_DATE: Date = new Date();
    depT_ID: number = 0;
    cusT_ID: string = '';
    bU_ID: number = 0;
    parenT_PROJ_ID: string = '';
    proJ_ALIAS_NM: string = '';
}
